
-- Create table for user badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for user_badges
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can create badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Create table for content reports
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'harassment', 'fake', 'other')),
  report_reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for content_reports
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Policies for content_reports
CREATE POLICY "Users can create reports" ON public.content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.content_reports FOR SELECT USING (auth.uid() = reporter_id);

-- Create function to award badges automatically
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_post_count INTEGER;
  user_likes_count INTEGER;
BEGIN
  -- Check for first post badge
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    SELECT posts_count INTO user_post_count 
    FROM public.social_profiles 
    WHERE user_id = NEW.user_id;
    
    IF user_post_count = 1 THEN
      INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES (NEW.user_id, 'first_post', 'Style Starter', 'Posted your first outfit!')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF user_post_count = 10 THEN
      INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES (NEW.user_id, 'active_poster', 'Style Enthusiast', 'Posted 10 outfits!')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;
  
  -- Check for likes milestone badges
  IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    SELECT SUM(likes_count) INTO user_likes_count
    FROM public.posts
    WHERE user_id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
    
    IF user_likes_count >= 50 THEN
      INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES ((SELECT user_id FROM public.posts WHERE id = NEW.post_id), 'popular_creator', 'Style Icon', 'Received 50+ likes across all posts!')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
    
    IF user_likes_count >= 100 THEN
      INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES ((SELECT user_id FROM public.posts WHERE id = NEW.post_id), 'viral_creator', 'Trendsetter', 'Received 100+ likes across all posts!')
      ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for badge awarding
CREATE TRIGGER trigger_award_post_badges
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();

CREATE TRIGGER trigger_award_like_badges
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();

-- Create view for leaderboard data
CREATE OR REPLACE VIEW public.style_leaderboard AS
SELECT 
  sp.user_id,
  sp.display_name,
  sp.avatar_url,
  sp.posts_count,
  COALESCE(SUM(p.likes_count), 0) as total_likes,
  COALESCE(COUNT(ub.id), 0) as badge_count,
  -- Calculate style score: posts * 2 + likes + badges * 5
  (sp.posts_count * 2 + COALESCE(SUM(p.likes_count), 0) + COALESCE(COUNT(ub.id), 0) * 5) as style_score
FROM public.social_profiles sp
LEFT JOIN public.posts p ON sp.user_id = p.user_id
LEFT JOIN public.user_badges ub ON sp.user_id = ub.user_id
GROUP BY sp.user_id, sp.display_name, sp.avatar_url, sp.posts_count
ORDER BY style_score DESC;

-- Add content filtering flags to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;


-- Create badges table for gamification
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB NOT NULL, -- e.g., {"type": "posts_count", "threshold": 1}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create content_reports table for moderation
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_post_id UUID REFERENCES public.posts(id),
  reported_user_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_id UUID,
  moderator_action TEXT,
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create community_guidelines table
CREATE TABLE public.community_guidelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appeals table for content moderation appeals
CREATE TABLE public.content_appeals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_id UUID NOT NULL REFERENCES public.content_reports(id),
  appeal_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  moderator_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_appeals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" 
  ON public.badges 
  FOR SELECT 
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view user badges" 
  ON public.user_badges 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can create user badges" 
  ON public.user_badges 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for content_reports
CREATE POLICY "Users can create reports" 
  ON public.content_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
  ON public.content_reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id);

-- RLS Policies for community_guidelines (public read)
CREATE POLICY "Anyone can view guidelines" 
  ON public.community_guidelines 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for content_appeals
CREATE POLICY "Users can create appeals for their content" 
  ON public.content_appeals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own appeals" 
  ON public.content_appeals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, criteria) VALUES
('First Post', 'Share your first outfit with the community', 'camera', '{"type": "posts_count", "threshold": 1}'),
('Popular Styler', 'Receive 50 likes on your posts', 'heart', '{"type": "total_likes", "threshold": 50}'),
('Community Member', 'Join the StyleSync community', 'users', '{"type": "signup", "threshold": 1}'),
('Trendsetter', 'Create 10 posts', 'trending-up', '{"type": "posts_count", "threshold": 10}'),
('Style Influencer', 'Receive 100 likes on your posts', 'star', '{"type": "total_likes", "threshold": 100}');

-- Insert default community guidelines
INSERT INTO public.community_guidelines (title, content, category) VALUES
('Respectful Communication', 'Treat all community members with respect. No harassment, bullying, or hate speech will be tolerated.', 'behavior'),
('Appropriate Content', 'Share only appropriate fashion and style content. No nudity, violence, or inappropriate imagery.', 'content'),
('No Spam', 'Avoid posting repetitive content or excessive promotional material. Focus on quality over quantity.', 'content'),
('Authentic Content', 'Share your own photos and give credit where due. No stolen or misleading content.', 'authenticity'),
('Privacy Respect', 'Do not share personal information of others without consent. Respect privacy and boundaries.', 'privacy');

-- Function to automatically award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_posts_count INTEGER;
  user_total_likes INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user's current stats
  SELECT COUNT(*) INTO user_posts_count 
  FROM public.posts WHERE user_id = NEW.user_id;
  
  SELECT COALESCE(SUM(likes_count), 0) INTO user_total_likes 
  FROM public.posts WHERE user_id = NEW.user_id;
  
  -- Check each badge criteria
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = NEW.user_id AND badge_id = badge_record.id
    ) THEN
      -- Check badge criteria
      IF (badge_record.criteria->>'type' = 'posts_count' AND 
          user_posts_count >= (badge_record.criteria->>'threshold')::INTEGER) OR
         (badge_record.criteria->>'type' = 'total_likes' AND 
          user_total_likes >= (badge_record.criteria->>'threshold')::INTEGER) THEN
        
        -- Award the badge
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.user_id, badge_record.id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check badges when posts are created or likes are updated
CREATE TRIGGER trigger_check_badges_on_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();

CREATE TRIGGER trigger_check_badges_on_like_update
  AFTER UPDATE OF likes_count ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.check_and_award_badges();

-- Function to award signup badge
CREATE OR REPLACE FUNCTION public.award_signup_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- Award the signup badge
  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT NEW.user_id, id FROM public.badges 
  WHERE criteria->>'type' = 'signup' 
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award signup badge when social profile is created
CREATE TRIGGER trigger_award_signup_badge
  AFTER INSERT ON public.social_profiles
  FOR EACH ROW EXECUTE FUNCTION public.award_signup_badge();

-- Phase 2: Fix Remaining Security Issues

-- 1. Fix remaining functions without proper search_path
-- Fix all trigger functions to use proper search path

CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  -- Create notification for likes
  IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, message, related_post_id, related_user_id)
    SELECT 
      p.user_id,
      'like',
      sp.display_name || ' liked your post',
      NEW.post_id,
      NEW.user_id
    FROM public.posts p
    LEFT JOIN public.social_profiles sp ON sp.user_id = NEW.user_id
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
    
    RETURN NEW;
  END IF;

  -- Create notification for comments
  IF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, message, related_post_id, related_user_id)
    SELECT 
      p.user_id,
      'comment',
      sp.display_name || ' commented on your post',
      NEW.post_id,
      NEW.user_id
    FROM public.posts p
    LEFT JOIN public.social_profiles sp ON sp.user_id = NEW.user_id
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
    
    RETURN NEW;
  END IF;

  -- Create notification for follows
  IF TG_TABLE_NAME = 'followers' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, message, related_user_id)
    SELECT 
      NEW.following_id,
      'follow',
      sp.display_name || ' started following you',
      NEW.follower_id
    FROM public.social_profiles sp
    WHERE sp.user_id = NEW.follower_id;
    
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.moderate_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  flagged_words text[] := ARRAY['spam', 'scam', 'fake', 'counterfeit', 'replica'];
  word text;
BEGIN
  -- Check for flagged words in post content
  IF TG_TABLE_NAME = 'posts' THEN
    FOREACH word IN ARRAY flagged_words
    LOOP
      IF NEW.caption ILIKE '%' || word || '%' THEN
        NEW.is_flagged := true;
        NEW.flag_reason := 'Automated moderation: Contains flagged content';
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- Check for flagged words in comments
  IF TG_TABLE_NAME = 'comments' THEN
    FOREACH word IN ARRAY flagged_words
    LOOP
      IF NEW.content ILIKE '%' || word || '%' THEN
        -- Flag the parent post as well
        UPDATE public.posts SET is_flagged = true, flag_reason = 'Automated moderation: Comment contains flagged content' WHERE id = NEW.post_id;
        -- Could delete the comment or flag it
        RETURN NULL; -- This prevents the comment from being inserted
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_preference_insights()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  -- Extract insights from positive feedback (rating >= 4)
  IF NEW.rating >= 4 THEN
    -- Update style preferences
    IF NEW.liked_aspects IS NOT NULL THEN
      INSERT INTO public.user_preference_insights (user_id, insight_type, insight_data, confidence_score, source_recommendations)
      VALUES (
        NEW.user_id, 
        'style_preference', 
        jsonb_build_object('liked_aspects', NEW.liked_aspects),
        CASE WHEN NEW.rating = 5 THEN 0.9 ELSE 0.7 END,
        ARRAY[NEW.recommendation_id]
      )
      ON CONFLICT (user_id, insight_type, insight_data) 
      DO UPDATE SET 
        times_confirmed = user_preference_insights.times_confirmed + 1,
        confidence_score = LEAST(user_preference_insights.confidence_score + 0.1, 1.0),
        last_confirmed = now(),
        updated_at = now();
    END IF;
  END IF;

  -- Extract insights from negative feedback (rating <= 2)
  IF NEW.rating <= 2 THEN
    IF NEW.disliked_aspects IS NOT NULL THEN
      INSERT INTO public.user_preference_insights (user_id, insight_type, insight_data, confidence_score, source_recommendations)
      VALUES (
        NEW.user_id, 
        'style_preference', 
        jsonb_build_object('disliked_aspects', NEW.disliked_aspects),
        0.8,
        ARRAY[NEW.recommendation_id]
      )
      ON CONFLICT (user_id, insight_type, insight_data) 
      DO UPDATE SET 
        times_confirmed = user_preference_insights.times_confirmed + 1,
        confidence_score = LEAST(user_preference_insights.confidence_score + 0.1, 1.0),
        last_confirmed = now(),
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    UPDATE public.social_profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_profiles 
    SET followers_count = followers_count - 1 
    WHERE user_id = OLD.following_id;
    
    UPDATE public.social_profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_like_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update posts count
    UPDATE public.social_profiles 
    SET posts_count = posts_count + 1 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update posts count
    UPDATE public.social_profiles 
    SET posts_count = posts_count - 1 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_recommendations()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
BEGIN
  DELETE FROM public.ai_recommendations 
  WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_social_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  INSERT INTO public.social_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$function$;

-- 2. Remove any security definer views if they exist
-- (First check if the view exists to avoid errors)
DROP VIEW IF EXISTS style_leaderboard CASCADE;

-- Recreate as a regular view without security definer
CREATE VIEW style_leaderboard AS
SELECT 
  sp.user_id,
  sp.posts_count,
  COALESCE(SUM(p.likes_count), 0) as total_likes,
  COUNT(ub.id) as badge_count,
  (COALESCE(SUM(p.likes_count), 0) + sp.posts_count * 2 + COUNT(ub.id) * 10) as style_score,
  sp.display_name,
  sp.avatar_url
FROM public.social_profiles sp
LEFT JOIN public.posts p ON p.user_id = sp.user_id AND NOT p.is_flagged
LEFT JOIN public.user_badges ub ON ub.user_id = sp.user_id
GROUP BY sp.user_id, sp.posts_count, sp.display_name, sp.avatar_url
ORDER BY style_score DESC;

-- 3. Add additional security hardening
-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only super admins can view audit logs" ON public.security_audit_log
FOR SELECT USING (public.is_admin(auth.uid(), 'super_admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param text,
  event_details_param jsonb DEFAULT NULL,
  target_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_details,
    created_at
  ) VALUES (
    target_user_id,
    event_type_param,
    event_details_param,
    now()
  );
END;
$$;

-- 4. Add session security improvements
-- Function to revoke all user sessions (for security incidents)
CREATE OR REPLACE FUNCTION public.revoke_all_user_sessions(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Only allow users to revoke their own sessions or admin access
  IF auth.uid() != target_user_id AND NOT public.is_admin(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Cannot revoke another user''s sessions';
  END IF;

  -- Log the security event
  PERFORM public.log_security_event(
    'session_revocation',
    jsonb_build_object('target_user_id', target_user_id, 'revoked_by', auth.uid())
  );

  -- Note: In a real implementation, you would revoke sessions through Supabase Auth API
  -- This is a placeholder for the business logic
  RETURN true;
END;
$$;
-- Phase 1: Critical Security Fixes

-- 1. Fix Database Function Security Paths
-- Update all security definer functions to use proper search path

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  result json;
BEGIN
  -- Only allow users to delete their own data or admin access
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot delete another user''s data';
  END IF;

  -- Start deleting user data from all tables
  DELETE FROM public.user_behavior_analytics WHERE user_id = target_user_id;
  DELETE FROM public.recommendation_feedback WHERE user_id = target_user_id;
  DELETE FROM public.ai_recommendations WHERE user_id = target_user_id;
  DELETE FROM public.outfit_ratings WHERE user_id = target_user_id;
  DELETE FROM public.user_purchases WHERE user_id = target_user_id;
  DELETE FROM public.user_wishlist WHERE user_id = target_user_id;
  DELETE FROM public.user_favorites WHERE user_id = target_user_id;
  DELETE FROM public.outfit_history WHERE user_id = target_user_id;
  DELETE FROM public.user_sizes WHERE user_id = target_user_id;
  DELETE FROM public.wardrobe_items WHERE user_id = target_user_id;
  DELETE FROM public.outfit_combinations WHERE user_id = target_user_id;
  DELETE FROM public.synced_calendar_events WHERE user_id = target_user_id;
  DELETE FROM public.user_calendar_connections WHERE user_id = target_user_id;
  DELETE FROM public.user_oauth_connections WHERE user_id = target_user_id;
  DELETE FROM public.trend_analytics WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.content_reports WHERE reporter_id = target_user_id;
  DELETE FROM public.comments WHERE user_id = target_user_id;
  DELETE FROM public.likes WHERE user_id = target_user_id;
  DELETE FROM public.followers WHERE follower_id = target_user_id OR following_id = target_user_id;
  DELETE FROM public.posts WHERE user_id = target_user_id;
  DELETE FROM public.user_badges WHERE user_id = target_user_id;
  DELETE FROM public.social_profiles WHERE user_id = target_user_id;
  DELETE FROM public.user_style_profiles WHERE user_id = target_user_id;

  result := json_build_object(
    'success', true,
    'message', 'User data deleted successfully',
    'deleted_at', now()
  );

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  user_data json;
BEGIN
  -- Only allow users to export their own data
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot export another user''s data';
  END IF;

  -- Collect all user data
  SELECT json_build_object(
    'user_id', target_user_id,
    'export_date', now(),
    'profile', (SELECT row_to_json(p) FROM (SELECT * FROM public.user_style_profiles WHERE user_id = target_user_id) p),
    'social_profile', (SELECT row_to_json(sp) FROM (SELECT * FROM public.social_profiles WHERE user_id = target_user_id) sp),
    'wardrobe_items', (SELECT json_agg(row_to_json(wi)) FROM (SELECT * FROM public.wardrobe_items WHERE user_id = target_user_id) wi),
    'outfit_combinations', (SELECT json_agg(row_to_json(oc)) FROM (SELECT * FROM public.outfit_combinations WHERE user_id = target_user_id) oc),
    'outfit_history', (SELECT json_agg(row_to_json(oh)) FROM (SELECT * FROM public.outfit_history WHERE user_id = target_user_id) oh),
    'ai_recommendations', (SELECT json_agg(row_to_json(ar)) FROM (SELECT * FROM public.ai_recommendations WHERE user_id = target_user_id) ar),
    'posts', (SELECT json_agg(row_to_json(p)) FROM (SELECT * FROM public.posts WHERE user_id = target_user_id) p),
    'comments', (SELECT json_agg(row_to_json(c)) FROM (SELECT * FROM public.comments WHERE user_id = target_user_id) c),
    'likes', (SELECT json_agg(row_to_json(l)) FROM (SELECT * FROM public.likes WHERE user_id = target_user_id) l),
    'followers', (SELECT json_agg(row_to_json(f)) FROM (SELECT * FROM public.followers WHERE follower_id = target_user_id OR following_id = target_user_id) f),
    'user_purchases', (SELECT json_agg(row_to_json(up)) FROM (SELECT * FROM public.user_purchases WHERE user_id = target_user_id) up),
    'user_wishlist', (SELECT json_agg(row_to_json(uw)) FROM (SELECT * FROM public.user_wishlist WHERE user_id = target_user_id) uw),
    'user_sizes', (SELECT json_agg(row_to_json(us)) FROM (SELECT * FROM public.user_sizes WHERE user_id = target_user_id) us),
    'notifications', (SELECT json_agg(row_to_json(n)) FROM (SELECT * FROM public.notifications WHERE user_id = target_user_id) n),
    'behavior_analytics', (SELECT json_agg(row_to_json(ba)) FROM (SELECT * FROM public.user_behavior_analytics WHERE user_id = target_user_id) ba)
  ) INTO user_data;

  RETURN user_data;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(user_email text, target_user_id uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  current_usage RECORD;
  rate_limit INTEGER;
  window_hours INTEGER := 24; -- 24-hour window
  is_allowed BOOLEAN := false;
  remaining_requests INTEGER := 0;
  reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Define rate limits based on subscription tier
  rate_limit := CASE 
    WHEN (SELECT subscription_tier FROM public.ai_usage_limits WHERE email = user_email) = 'premium' THEN 50
    WHEN (SELECT subscription_tier FROM public.ai_usage_limits WHERE email = user_email) = 'pro' THEN 100
    ELSE 5 -- free tier
  END;

  -- Get or create usage record
  INSERT INTO public.ai_usage_limits (user_id, email, subscription_tier)
  VALUES (target_user_id, user_email, 'free')
  ON CONFLICT (email) 
  DO UPDATE SET updated_at = now()
  RETURNING * INTO current_usage;

  IF current_usage IS NULL THEN
    SELECT * INTO current_usage FROM public.ai_usage_limits WHERE email = user_email;
  END IF;

  -- Check if we need to reset the window
  IF current_usage.window_start < (now() - (window_hours || ' hours')::INTERVAL) THEN
    UPDATE public.ai_usage_limits 
    SET 
      requests_count = 0,
      window_start = now(),
      updated_at = now()
    WHERE email = user_email
    RETURNING * INTO current_usage;
  END IF;

  -- Check if under rate limit
  IF current_usage.requests_count < rate_limit THEN
    is_allowed := true;
    remaining_requests := rate_limit - current_usage.requests_count - 1;
    
    -- Increment counter
    UPDATE public.ai_usage_limits 
    SET 
      requests_count = requests_count + 1,
      last_request_at = now(),
      updated_at = now()
    WHERE email = user_email;
  ELSE
    remaining_requests := 0;
  END IF;

  reset_time := current_usage.window_start + (window_hours || ' hours')::INTERVAL;

  RETURN json_build_object(
    'allowed', is_allowed,
    'remaining_requests', remaining_requests,
    'rate_limit', rate_limit,
    'current_usage', current_usage.requests_count,
    'reset_time', reset_time,
    'subscription_tier', current_usage.subscription_tier
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.upgrade_user_subscription(user_email text, new_tier text, target_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  UPDATE public.ai_usage_limits 
  SET 
    subscription_tier = new_tier,
    updated_at = now()
  WHERE email = user_email;

  RETURN FOUND;
END;
$function$;

-- 2. Create proper admin role management system
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator');

CREATE TABLE IF NOT EXISTS public.user_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on admin roles table
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Only allow super admins to manage admin roles
CREATE POLICY "Super admins can manage admin roles" ON public.user_admin_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_admin_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- Users can view their own admin roles
CREATE POLICY "Users can view their own admin roles" ON public.user_admin_roles
FOR SELECT USING (user_id = auth.uid());

-- Create secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(target_user_id uuid DEFAULT auth.uid(), required_role admin_role DEFAULT 'admin')
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_admin_roles 
    WHERE user_id = target_user_id 
    AND role >= required_role 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- 3. Add OAuth token encryption (placeholder for encrypted storage)
-- Note: In production, implement actual encryption at application level
ALTER TABLE public.user_oauth_connections 
ADD COLUMN IF NOT EXISTS encrypted_access_token text,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token text,
ADD COLUMN IF NOT EXISTS encryption_key_id text;

ALTER TABLE public.user_calendar_connections 
ADD COLUMN IF NOT EXISTS encrypted_access_token text,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token text,
ADD COLUMN IF NOT EXISTS encryption_key_id text;

-- Update RLS policies to use new admin system
DROP POLICY IF EXISTS "Admins can view all content reports" ON public.content_reports;
CREATE POLICY "Admins can view all content reports" ON public.content_reports
FOR SELECT USING (public.is_admin(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Hide flagged posts from regular users" ON public.posts;
CREATE POLICY "Hide flagged posts from regular users" ON public.posts
FOR SELECT USING (
  (NOT is_flagged) OR 
  (user_id = auth.uid()) OR 
  public.is_admin(auth.uid(), 'moderator')
);

-- 4. Add rate limiting table for critical operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  requests_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  last_request_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, operation_type)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
FOR SELECT USING (user_id = auth.uid());

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  target_user_id uuid,
  operation text,
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_usage RECORD;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  INSERT INTO public.rate_limits (user_id, operation_type, requests_count, window_start)
  VALUES (target_user_id, operation, 1, now())
  ON CONFLICT (user_id, operation_type) 
  DO UPDATE SET 
    requests_count = CASE 
      WHEN rate_limits.window_start < window_start_time THEN 1
      ELSE rate_limits.requests_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < window_start_time THEN now()
      ELSE rate_limits.window_start
    END,
    last_request_at = now(),
    updated_at = now()
  RETURNING * INTO current_usage;

  -- Check if within rate limit
  RETURN current_usage.requests_count <= max_requests;
END;
$$;

-- 5. Add input validation functions
CREATE OR REPLACE FUNCTION public.validate_email(email_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, extensions
AS $$
BEGIN
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION public.sanitize_text(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, extensions
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS characters and limit length
  RETURN LEFT(
    REGEXP_REPLACE(
      REGEXP_REPLACE(input_text, '[<>"\'';&]', '', 'g'),
      '\s+', ' ', 'g'
    ),
    max_length
  );
END;
$$;

-- Add validation triggers for critical tables
CREATE OR REPLACE FUNCTION public.validate_post_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  -- Validate caption length and content
  IF NEW.caption IS NOT NULL THEN
    NEW.caption := public.sanitize_text(NEW.caption, 2000);
  END IF;
  
  -- Rate limit post creation
  IF NOT public.check_rate_limit(NEW.user_id, 'post_creation', 5, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded for post creation';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_post_content_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_post_content();

CREATE OR REPLACE FUNCTION public.validate_comment_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  -- Validate comment content
  IF NEW.content IS NOT NULL THEN
    NEW.content := public.sanitize_text(NEW.content, 1000);
  END IF;
  
  -- Rate limit comment creation
  IF NOT public.check_rate_limit(NEW.user_id, 'comment_creation', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded for comment creation';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_comment_content_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.validate_comment_content();
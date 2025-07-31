-- Fix search_path security issue for all existing functions
-- This ensures functions cannot be exploited by search_path manipulation

-- Update existing functions to include proper search_path
CREATE OR REPLACE FUNCTION public.get_style_leaderboard()
 RETURNS TABLE(user_id uuid, posts_count integer, total_likes bigint, badge_count bigint, style_score bigint, display_name text, avatar_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT 
    sp.user_id,
    sp.posts_count,
    COALESCE(SUM(p.likes_count), 0) as total_likes,
    (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = sp.user_id) as badge_count,
    (sp.posts_count * 10 + COALESCE(SUM(p.likes_count), 0) * 2) as style_score,
    sp.display_name,
    sp.avatar_url
  FROM public.social_profiles sp
  LEFT JOIN public.posts p ON p.user_id = sp.user_id
  WHERE sp.posts_count > 0  -- Only include users with posts
  GROUP BY sp.user_id, sp.posts_count, sp.display_name, sp.avatar_url
  ORDER BY style_score DESC
  LIMIT 100;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
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
 SET search_path TO 'public', 'extensions'
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
 SET search_path TO 'public', 'extensions'
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
 SET search_path TO 'public', 'extensions'
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
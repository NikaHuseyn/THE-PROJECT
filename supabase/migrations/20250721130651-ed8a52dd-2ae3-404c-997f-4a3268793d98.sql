-- Add data deletion functionality for GDPR right to be forgotten
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Add function to export user data for GDPR compliance
CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Add automated content moderation function
CREATE OR REPLACE FUNCTION public.moderate_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create triggers for automated content moderation
CREATE TRIGGER moderate_posts_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.moderate_content();

CREATE TRIGGER moderate_comments_trigger
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.moderate_content();

-- Add policy for content moderation (admins can view all reports)
CREATE POLICY "Admins can view all content reports"
ON public.content_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_style_profiles 
    WHERE user_id = auth.uid() 
    AND (notification_preferences->>'admin_role')::boolean = true
  )
);

-- Add policy for flagged content (hide from regular users)
CREATE POLICY "Hide flagged posts from regular users"
ON public.posts
FOR SELECT
TO authenticated
USING (
  NOT is_flagged 
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_style_profiles 
    WHERE user_id = auth.uid() 
    AND (notification_preferences->>'admin_role')::boolean = true
  )
);
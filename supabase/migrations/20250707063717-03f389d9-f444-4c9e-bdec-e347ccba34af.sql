
-- Enable realtime for posts and likes tables to support real-time notifications
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications
CREATE TRIGGER trigger_create_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_create_comment_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_create_follow_notification
  AFTER INSERT ON public.followers
  FOR EACH ROW EXECUTE FUNCTION create_notification();

-- Update notifications RLS policies to allow system to insert notifications
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;
CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

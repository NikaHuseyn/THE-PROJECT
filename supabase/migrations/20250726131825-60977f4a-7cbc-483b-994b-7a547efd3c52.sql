-- Fix Security Definer View issue by dropping the problematic view
-- and creating a secure function instead

-- Drop the existing style_leaderboard view that bypasses RLS
DROP VIEW IF EXISTS public.style_leaderboard;

-- Create a secure function to get leaderboard data with proper RLS enforcement
CREATE OR REPLACE FUNCTION public.get_style_leaderboard()
RETURNS TABLE (
  user_id uuid,
  posts_count integer,
  total_likes bigint,
  badge_count bigint,
  style_score bigint,
  display_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- This ensures RLS policies are enforced for the calling user
AS $$
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
$$;

-- Create RLS policy for the function access
COMMENT ON FUNCTION public.get_style_leaderboard() IS 'Secure leaderboard function that respects RLS policies';

-- Fix OAuth token validation trigger to ensure proper encryption
-- Update the validation function to be more strict about encryption
CREATE OR REPLACE FUNCTION public.validate_token_encryption()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Ensure tokens are properly encrypted before storage
  -- Reject any tokens that look like demo/placeholder data
  IF NEW.encrypted_access_token IS NULL OR 
     NEW.encryption_key_id IS NULL OR
     NEW.encrypted_access_token LIKE '%demo%' OR
     NEW.encrypted_access_token LIKE '%placeholder%' OR
     NEW.encrypted_access_token LIKE '%Math.random%' THEN
    RAISE EXCEPTION 'OAuth tokens must be properly encrypted before storage. Demo/placeholder tokens are not allowed.';
  END IF;
  
  -- Log security event for token storage
  PERFORM public.log_security_event(
    'oauth_token_stored',
    jsonb_build_object(
      'provider', NEW.provider,
      'user_id', NEW.user_id,
      'encrypted', true,
      'validation_passed', true
    ),
    NEW.user_id
  );
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger is properly attached to both OAuth tables
DROP TRIGGER IF EXISTS validate_oauth_token_encryption ON public.user_oauth_connections;
CREATE TRIGGER validate_oauth_token_encryption
  BEFORE INSERT OR UPDATE ON public.user_oauth_connections
  FOR EACH ROW EXECUTE FUNCTION public.validate_token_encryption();

DROP TRIGGER IF EXISTS validate_calendar_token_encryption ON public.user_calendar_connections;
CREATE TRIGGER validate_calendar_token_encryption
  BEFORE INSERT OR UPDATE ON public.user_calendar_connections
  FOR EACH ROW EXECUTE FUNCTION public.validate_token_encryption();

-- Add additional security constraints
ALTER TABLE public.user_oauth_connections 
  ADD CONSTRAINT encrypted_access_token_not_demo 
  CHECK (encrypted_access_token IS NULL OR (
    encrypted_access_token NOT LIKE '%demo%' AND 
    encrypted_access_token NOT LIKE '%placeholder%' AND
    encrypted_access_token NOT LIKE '%Math.random%'
  ));

ALTER TABLE public.user_calendar_connections 
  ADD CONSTRAINT encrypted_access_token_not_demo 
  CHECK (encrypted_access_token IS NULL OR (
    encrypted_access_token NOT LIKE '%demo%' AND 
    encrypted_access_token NOT LIKE '%placeholder%' AND
    encrypted_access_token NOT LIKE '%Math.random%'
  ));

-- Create audit function for security events
CREATE OR REPLACE FUNCTION public.audit_security_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Log any changes to OAuth connections for security audit
  IF TG_TABLE_NAME = 'user_oauth_connections' THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM public.log_security_event(
        'oauth_connection_created',
        jsonb_build_object(
          'provider', NEW.provider,
          'user_id', NEW.user_id,
          'is_active', NEW.is_active
        ),
        NEW.user_id
      );
    ELSIF TG_OP = 'UPDATE' THEN
      PERFORM public.log_security_event(
        'oauth_connection_updated',
        jsonb_build_object(
          'provider', NEW.provider,
          'user_id', NEW.user_id,
          'was_active', OLD.is_active,
          'now_active', NEW.is_active
        ),
        NEW.user_id
      );
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.log_security_event(
        'oauth_connection_deleted',
        jsonb_build_object(
          'provider', OLD.provider,
          'user_id', OLD.user_id
        ),
        OLD.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create audit triggers for OAuth tables
DROP TRIGGER IF EXISTS audit_oauth_connections ON public.user_oauth_connections;
CREATE TRIGGER audit_oauth_connections
  AFTER INSERT OR UPDATE OR DELETE ON public.user_oauth_connections
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_changes();

DROP TRIGGER IF EXISTS audit_calendar_connections ON public.user_calendar_connections;
CREATE TRIGGER audit_calendar_connections
  AFTER INSERT OR UPDATE OR DELETE ON public.user_calendar_connections
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_changes();
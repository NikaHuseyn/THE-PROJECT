-- Phase 3: Final Security Hardening

-- 1. Check for any remaining security definer objects and fix them
-- Query system catalogs to find any remaining security definer functions or views
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Check for any functions that might still have security definer without proper search path
    FOR rec IN 
        SELECT n.nspname as schema_name, p.proname as function_name, p.prosecdef
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' 
        AND p.prosecdef = true
        AND p.proname NOT IN (
            'delete_user_data', 'export_user_data', 'check_ai_rate_limit', 
            'upgrade_user_subscription', 'is_admin', 'check_rate_limit',
            'validate_email', 'sanitize_text', 'validate_post_content',
            'validate_comment_content', 'create_notification', 'moderate_content',
            'check_and_award_badges', 'update_preference_insights', 'handle_new_social_user',
            'log_security_event', 'revoke_all_user_sessions'
        )
    LOOP
        RAISE NOTICE 'Found potential security definer function: %.%', rec.schema_name, rec.function_name;
    END LOOP;
END
$$;

-- 2. Add comprehensive database-level security constraints
-- Add check constraints for critical data validation
ALTER TABLE public.user_admin_roles 
ADD CONSTRAINT valid_admin_role_expiry 
CHECK (expires_at IS NULL OR expires_at > granted_at);

ALTER TABLE public.ai_usage_limits 
ADD CONSTRAINT valid_subscription_tier 
CHECK (subscription_tier IN ('free', 'premium', 'pro'));

ALTER TABLE public.rate_limits 
ADD CONSTRAINT positive_request_count 
CHECK (requests_count >= 0);

ALTER TABLE public.recommendation_feedback 
ADD CONSTRAINT valid_rating_range 
CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE public.outfit_ratings 
ADD CONSTRAINT valid_outfit_rating_range 
CHECK (rating BETWEEN 1 AND 5);

-- 3. Add comprehensive indexes for security and performance
-- Indexes for audit and security queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_event 
ON public.security_audit_log(user_id, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log(created_at DESC);

-- Indexes for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_operation 
ON public.rate_limits(user_id, operation_type);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
ON public.rate_limits(window_start);

-- Indexes for admin role queries
CREATE INDEX IF NOT EXISTS idx_user_admin_roles_user_active 
ON public.user_admin_roles(user_id, is_active, expires_at);

-- 4. Add data retention policies for security logs
-- Function to clean up old audit logs (retain for 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM public.security_audit_log 
  WHERE created_at < (now() - INTERVAL '1 year');
  
  -- Log the cleanup action
  INSERT INTO public.security_audit_log (
    event_type,
    event_details,
    created_at
  ) VALUES (
    'audit_log_cleanup',
    jsonb_build_object(
      'cleanup_date', now(),
      'retention_policy', '1 year'
    ),
    now()
  );
END;
$$;

-- 5. Add final security trigger for admin role changes
CREATE OR REPLACE FUNCTION public.log_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'admin_role_granted',
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'role', NEW.role,
        'granted_by', NEW.granted_by,
        'expires_at', NEW.expires_at
      ),
      NEW.user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active != NEW.is_active THEN
      PERFORM public.log_security_event(
        CASE WHEN NEW.is_active THEN 'admin_role_activated' ELSE 'admin_role_deactivated' END,
        jsonb_build_object(
          'target_user_id', NEW.user_id,
          'role', NEW.role,
          'changed_by', auth.uid()
        ),
        NEW.user_id
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'admin_role_revoked',
      jsonb_build_object(
        'target_user_id', OLD.user_id,
        'role', OLD.role,
        'revoked_by', auth.uid()
      ),
      OLD.user_id
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for admin role changes
DROP TRIGGER IF EXISTS log_admin_role_changes_trigger ON public.user_admin_roles;
CREATE TRIGGER log_admin_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_role_changes();

-- 6. Add missing unique constraints for data integrity
ALTER TABLE public.user_calendar_connections 
ADD CONSTRAINT unique_user_provider_account 
UNIQUE (user_id, provider, provider_account_id);

ALTER TABLE public.user_oauth_connections 
ADD CONSTRAINT unique_user_provider_oauth 
UNIQUE (user_id, provider, provider_user_id);

-- 7. Final security documentation comment
COMMENT ON TABLE public.security_audit_log IS 'Comprehensive audit log for security events. Retention policy: 1 year. Access: Super admins only.';
COMMENT ON FUNCTION public.is_admin IS 'Secure function to check admin status. Uses hierarchical role checking.';
COMMENT ON FUNCTION public.log_security_event IS 'Central function for logging security events. All sensitive operations should use this.';
COMMENT ON TABLE public.user_admin_roles IS 'Admin role management with expiration and audit trail. Critical for access control.';
COMMENT ON TABLE public.rate_limits IS 'Rate limiting for critical operations. Prevents abuse and DoS attacks.';
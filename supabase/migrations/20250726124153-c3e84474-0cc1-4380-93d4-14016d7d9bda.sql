-- Remove plaintext token storage and ensure only encrypted tokens are used
-- First, delete rows with missing encrypted tokens (they'll need to be re-authenticated)
DELETE FROM public.user_oauth_connections 
WHERE encrypted_access_token IS NULL OR encryption_key_id IS NULL;

DELETE FROM public.user_calendar_connections
WHERE encrypted_access_token IS NULL OR encryption_key_id IS NULL;

-- Remove plaintext token columns
ALTER TABLE public.user_oauth_connections 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

ALTER TABLE public.user_calendar_connections
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

-- Now add constraints to ensure encrypted tokens are always used
ALTER TABLE public.user_oauth_connections 
ADD CONSTRAINT encrypted_tokens_required 
CHECK (encrypted_access_token IS NOT NULL AND encryption_key_id IS NOT NULL);

ALTER TABLE public.user_calendar_connections
ADD CONSTRAINT encrypted_tokens_required 
CHECK (encrypted_access_token IS NOT NULL AND encryption_key_id IS NOT NULL);

-- Add security trigger for token validation
CREATE OR REPLACE FUNCTION public.validate_token_encryption()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- Ensure tokens are properly encrypted before storage
  IF NEW.encrypted_access_token IS NULL OR NEW.encryption_key_id IS NULL THEN
    RAISE EXCEPTION 'OAuth tokens must be encrypted before storage';
  END IF;
  
  -- Log security event for token storage
  PERFORM public.log_security_event(
    'oauth_token_stored',
    jsonb_build_object(
      'provider', NEW.provider,
      'user_id', NEW.user_id,
      'encrypted', true
    ),
    NEW.user_id
  );
  
  RETURN NEW;
END;
$function$;

-- Apply encryption validation trigger to OAuth connections
CREATE TRIGGER validate_oauth_token_encryption
  BEFORE INSERT OR UPDATE ON public.user_oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_token_encryption();

-- Apply encryption validation trigger to calendar connections  
CREATE TRIGGER validate_calendar_token_encryption
  BEFORE INSERT OR UPDATE ON public.user_calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_token_encryption();
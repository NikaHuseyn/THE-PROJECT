-- Fix PUBLIC_DATA_EXPOSURE: Restrict social_profiles to authenticated users only
-- This prevents mass scraping and unauthorized data collection

DROP POLICY IF EXISTS "Anyone can view social profiles" ON public.social_profiles;
DROP POLICY IF EXISTS "Users can manage their own social profile" ON public.social_profiles;

CREATE POLICY "Authenticated users can view social profiles" 
ON public.social_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Recreate the user management policy
CREATE POLICY "Users can manage their own social profile"
ON public.social_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
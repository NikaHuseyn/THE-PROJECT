-- Add unique constraint to user_id in user_style_profiles table
-- This will allow the upsert operation to work properly

ALTER TABLE public.user_style_profiles 
ADD CONSTRAINT user_style_profiles_user_id_unique UNIQUE (user_id);
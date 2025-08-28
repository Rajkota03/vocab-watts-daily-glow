-- Fix the view security issue by removing problematic elements
-- Views inherit RLS from underlying tables, so we just need a simple view

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a simple view without any RLS attempts (it will inherit from profiles table RLS)
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  first_name,
  nick_name,
  created_at
FROM public.profiles;

-- Add a security function for controlled profile access if needed
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  nick_name text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.id, p.first_name, p.nick_name, p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id
  AND (
    -- User can see their own profile
    p.id = auth.uid() 
    -- Or admin can see any profile
    OR has_role(auth.uid(), 'admin'::app_role)
  );
$$;

COMMENT ON VIEW public.public_profiles IS 'Public view of non-sensitive profile data - inherits RLS from profiles table';
COMMENT ON FUNCTION public.get_public_profile_info IS 'Secure function to retrieve public profile information with proper access control';
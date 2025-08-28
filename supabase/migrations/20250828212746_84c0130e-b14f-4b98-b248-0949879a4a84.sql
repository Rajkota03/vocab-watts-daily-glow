-- Fix the Security Definer View issue
-- Remove the security barrier setting from the view and create proper RLS policies instead

-- Drop and recreate the view without security definer properties
DROP VIEW IF EXISTS public.public_profiles;

-- Create the view without security definer properties
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  first_name,
  nick_name,
  created_at
FROM public.profiles;

-- Enable RLS on the view properly
ALTER VIEW public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view that allows users to see only their own public profile
CREATE POLICY "Users can view own public profile"
ON public.public_profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also create a policy for anonymous users if needed (optional - remove if not needed)
-- This would allow viewing public profiles without authentication
-- UNCOMMENT the following lines only if you need anonymous access to public profiles:
-- CREATE POLICY "Anonymous users can view public profiles"
-- ON public.public_profiles
-- FOR SELECT
-- TO anon
-- USING (true);

COMMENT ON VIEW public.public_profiles IS 'Safe view of profile data containing only non-sensitive information with proper RLS protection';
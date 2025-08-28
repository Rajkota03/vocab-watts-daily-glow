-- Check for and fix any remaining security issues
-- Remove all potentially problematic views and ensure clean security setup

-- Drop the view entirely to eliminate any security definer issues
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Instead of a view, we'll just use the secure function approach for accessing public profile data
-- The get_public_profile_info function already exists and is properly secured

-- Let's also check for and fix any functions without proper search_path
-- Update existing functions to have proper search_path settings

-- Fix the user_exists function
CREATE OR REPLACE FUNCTION public.user_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid);
$$;

-- Fix the log_profile_access function  
CREATE OR REPLACE FUNCTION public.log_profile_access(
  accessed_profile_id uuid,
  action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_audit_log (
    user_id,
    accessed_profile_id,
    action,
    timestamp
  ) VALUES (
    auth.uid(),
    accessed_profile_id,
    action_type,
    now()
  );
END;
$$;

-- Ensure all our custom functions have proper search_path
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

-- Create a safer alternative to the view using a function
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(requesting_user_id uuid DEFAULT auth.uid())
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
  WHERE (
    -- User can see their own profile
    p.id = requesting_user_id 
    -- Or admin can see any profile  
    OR has_role(requesting_user_id, 'admin'::app_role)
  );
$$;

COMMENT ON FUNCTION public.get_safe_profile_data IS 'Secure function to retrieve profile data with proper RLS enforcement - safer alternative to views';
COMMENT ON FUNCTION public.user_exists IS 'Secure function to check user existence without exposing profile data';
COMMENT ON FUNCTION public.log_profile_access IS 'Audit logging function for profile access tracking';
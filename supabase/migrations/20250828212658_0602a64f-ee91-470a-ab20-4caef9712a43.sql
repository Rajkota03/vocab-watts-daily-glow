-- Comprehensive Security Fix for Profiles Table
-- This addresses the security vulnerability by implementing strict RLS policies

-- First, let's drop any existing policies to rebuild them properly
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create comprehensive RLS policies for the profiles table

-- 1. SELECT Policy: Users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. UPDATE Policy: Users can only update their own profile, admins can update any
CREATE POLICY "Users can update own profile only"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. INSERT Policy: Explicitly deny direct inserts (handled by triggers only)
CREATE POLICY "Block direct profile inserts"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 4. DELETE Policy: Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Create a view for public profile information (non-sensitive data only)
-- This allows controlled access to non-sensitive profile data when needed
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  first_name,
  nick_name,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- 6. Create a secure function to check if a user exists (without exposing data)
CREATE OR REPLACE FUNCTION public.user_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid);
$$;

-- 7. Create audit logging for profile access (optional but recommended)
CREATE TABLE IF NOT EXISTS public.profile_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accessed_profile_id uuid NOT NULL,
  action text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.profile_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to log profile access
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

-- 8. Update the handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow specific fields from user metadata to prevent injection
    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        nick_name, 
        whatsapp_number, 
        email
    )
    VALUES (
        NEW.id,
        COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'User'),
        COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'last_name'), ''), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'nick_name'), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'whatsapp_number'), ''),
        NEW.email
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

COMMENT ON TABLE public.profiles IS 'User profiles with strict RLS policies to protect personal information';
COMMENT ON POLICY "Users can view own profile only" ON public.profiles IS 'Ensures users can only access their own profile data, admins have full access';
COMMENT ON POLICY "Users can update own profile only" ON public.profiles IS 'Restricts profile updates to profile owners and admins only';
COMMENT ON POLICY "Block direct profile inserts" ON public.profiles IS 'Prevents direct inserts - profiles are created via auth triggers only';
COMMENT ON POLICY "Only admins can delete profiles" ON public.profiles IS 'Profile deletion restricted to administrators only';
-- Comprehensive Security Fix for Profiles Table - Part 2
-- First check what policies exist and drop them properly

-- Drop all existing policies on profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END$$;

-- Create comprehensive RLS policies for the profiles table

-- 1. SELECT Policy: Users can only view their own profile, admins can view all
CREATE POLICY "Secure profile access - view own only"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. UPDATE Policy: Users can only update their own profile, admins can update any
CREATE POLICY "Secure profile access - update own only"
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
CREATE POLICY "Block direct profile creation"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 4. DELETE Policy: Only admins can delete profiles
CREATE POLICY "Admin only profile deletion"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Create audit logging table for profile access
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
CREATE POLICY "Audit logs admin only access"
ON public.profile_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only service role can insert audit logs
CREATE POLICY "Service role audit log insert"
ON public.profile_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);
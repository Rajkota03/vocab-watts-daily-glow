-- Fix function parameter name conflict
-- Drop existing functions first and recreate them

-- Drop existing functions to avoid parameter conflicts
DROP FUNCTION IF EXISTS public.get_public_profile_info(uuid);
DROP FUNCTION IF EXISTS public.user_exists(uuid);

-- Create secure function to get limited profile data
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
  -- Only return data if the requesting user is authorized (admin or self)
  SELECT p.id, p.first_name, p.nick_name, p.created_at
  FROM public.profiles p
  WHERE p.id = profile_user_id
  AND (
    auth.uid() = profile_user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );
$$;

-- Create utility function to check if user exists securely
CREATE OR REPLACE FUNCTION public.user_exists(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles 
    WHERE id = check_user_id
    AND (
      auth.uid() = check_user_id 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );
$$;

-- Create function to log profile access for audit purposes
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
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
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
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log errors but don't fail the main operation
    RAISE LOG 'Error logging profile access: %', SQLERRM;
END;
$$;

-- Add documentation comments
COMMENT ON FUNCTION public.get_public_profile_info(uuid) IS 'Securely retrieves limited profile information for authorized users only';
COMMENT ON FUNCTION public.user_exists(uuid) IS 'Securely checks if a user exists without exposing sensitive data';
COMMENT ON FUNCTION public.log_profile_access(uuid, text) IS 'Logs profile access for security auditing purposes';
-- Fix function parameter conflict by dropping existing functions first
-- Then recreate with proper security measures

-- Drop existing functions that might conflict
DROP FUNCTION IF EXISTS public.get_public_profile_info(uuid);
DROP FUNCTION IF EXISTS public.user_exists(uuid);

-- Create secure functions for profile operations
CREATE OR REPLACE FUNCTION public.get_public_profile_info(user_uuid uuid)
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
  WHERE p.id = user_uuid
  AND (
    auth.uid() = user_uuid 
    OR has_role(auth.uid(), 'admin'::app_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_uuid
    AND (
      auth.uid() = user_uuid 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );
$$;

-- Add function to log profile access attempts (for auditing)
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
  -- Only log if audit table exists and user is authenticated
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profile_audit_log') 
     AND auth.uid() IS NOT NULL THEN
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
    -- Silently continue if logging fails
    NULL;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_public_profile_info(uuid) IS 'Securely retrieves limited profile information for authorized users only';
COMMENT ON FUNCTION public.user_exists(uuid) IS 'Securely checks if a user exists without exposing sensitive data';
COMMENT ON FUNCTION public.log_profile_access(uuid, text) IS 'Logs profile access attempts for security auditing';
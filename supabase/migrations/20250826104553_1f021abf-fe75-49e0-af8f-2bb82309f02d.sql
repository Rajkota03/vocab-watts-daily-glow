-- Create a database function to safely check admin role without hardcoded emails
-- This replaces hardcoded admin email checks with proper role-based authorization

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role = 'admin'::app_role
  );
$$;
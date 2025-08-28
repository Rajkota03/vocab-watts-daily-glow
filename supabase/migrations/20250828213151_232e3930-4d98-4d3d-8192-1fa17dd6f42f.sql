-- Fix remaining function search path issues
-- Ensure all functions have proper search_path settings for security

-- Update any existing functions that might not have proper search_path
-- These are likely existing functions in the database

-- Check and update the has_role function if it exists and needs fixing
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
$$;

-- Update any other system functions that might need search_path
-- Fix the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - interval '1 hour');
END;
$$;

-- Update the user phone number function
CREATE OR REPLACE FUNCTION public.current_user_phone_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  phone TEXT;
BEGIN
  SELECT phone_number INTO phone FROM public.user_subscriptions WHERE user_id = auth.uid() LIMIT 1;
  RETURN phone;
END;
$$;

-- Update the admin assignment function
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

-- Update the admin subscription function
CREATE OR REPLACE FUNCTION public.ensure_admin_unlimited_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If a user is assigned admin role, update their subscription to unlimited
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_subscriptions (
      user_id, 
      phone_number, 
      email, 
      is_pro, 
      category, 
      subscription_ends_at, 
      trial_ends_at,
      first_name,
      last_name
    )
    SELECT 
      NEW.user_id,
      p.whatsapp_number,
      p.email,
      true, -- is_pro = true for admins
      'daily-intermediate', -- default category
      NULL, -- no end date (unlimited)
      NULL, -- no trial end
      p.first_name,
      p.last_name
    FROM public.profiles p 
    WHERE p.id = NEW.user_id
    ON CONFLICT (phone_number) DO UPDATE SET
      is_pro = true,
      subscription_ends_at = NULL,
      trial_ends_at = NULL,
      user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the subscription validation function  
CREATE OR REPLACE FUNCTION public.validate_subscription_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure that if user_id is set, it corresponds to a real user
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Invalid user_id: user does not exist';
    END IF;
  END IF;
  
  -- Allow admin users to have unlimited pro subscriptions (no end date required)
  IF NEW.is_pro = true AND NEW.subscription_ends_at IS NULL THEN
    -- Check if user is admin
    IF NEW.user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin'
    ) THEN
      -- Allow unlimited subscription for admins
      RETURN NEW;
    ELSE
      -- Require end date for non-admin pro subscriptions
      RAISE EXCEPTION 'Pro subscriptions must have a valid end date';
    END IF;
  END IF;
  
  -- Prevent backdating of subscriptions
  IF NEW.subscription_ends_at IS NOT NULL AND NEW.subscription_ends_at < NEW.created_at THEN
    RAISE EXCEPTION 'Subscription end date cannot be before creation date';
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.has_role IS 'Secure role checking function with proper search path';
COMMENT ON FUNCTION public.cleanup_expired_otp_codes IS 'Cleanup function for expired OTP codes with secure search path';
COMMENT ON FUNCTION public.current_user_phone_number IS 'Get current user phone number with secure search path';
COMMENT ON FUNCTION public.assign_default_role IS 'Default role assignment trigger function with secure search path';
COMMENT ON FUNCTION public.ensure_admin_unlimited_subscription IS 'Admin subscription management with secure search path';
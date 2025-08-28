-- Fix Security Definer View Issue
-- Remove the security definer view and replace with proper function-based approach

-- Drop the security definer view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure function to get limited profile data instead of a view
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

-- Create utility functions for secure profile operations
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

-- Enhanced user creation function with better security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate input data and prevent injection
    IF NEW.id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    -- Only allow specific fields from user metadata to prevent injection
    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        nick_name, 
        whatsapp_number, 
        email,
        trial_user
    )
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(trim(both from COALESCE(NEW.raw_user_meta_data->>'first_name', '')), ''), 
            'User'
        ),
        NULLIF(trim(both from COALESCE(NEW.raw_user_meta_data->>'last_name', '')), ''),
        NULLIF(trim(both from COALESCE(NEW.raw_user_meta_data->>'nick_name', '')), ''),
        NULLIF(trim(both from COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', '')), ''),
        COALESCE(NEW.email, ''),
        COALESCE((NEW.raw_user_meta_data->>'trial_user')::boolean, false)
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, this is OK
        RAISE LOG 'Profile already exists for user %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_public_profile_info(uuid) IS 'Securely retrieves limited profile information for authorized users only';
COMMENT ON FUNCTION public.user_exists(uuid) IS 'Securely checks if a user exists without exposing sensitive data';
COMMENT ON FUNCTION public.handle_new_user() IS 'Securely creates user profiles with input validation and injection prevention';
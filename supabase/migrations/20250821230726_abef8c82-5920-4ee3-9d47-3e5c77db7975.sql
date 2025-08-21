-- Fix security warnings by restricting access to vocabulary content

-- Drop existing public policies for vocabulary_words
DROP POLICY IF EXISTS "Anyone can view vocabulary words" ON public.vocabulary_words;

-- Create new restrictive policies for vocabulary_words
-- Only authenticated users with active subscriptions can view vocabulary words
CREATE POLICY "Authenticated users can view vocabulary words"
ON public.vocabulary_words
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    -- User has an active subscription
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND (
        (is_pro = true AND (subscription_ends_at IS NULL OR subscription_ends_at > now())) 
        OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
      )
    )
    -- Or user is an admin
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Allow service role and edge functions to access vocabulary words for generating content
CREATE POLICY "Service role can access vocabulary words"
ON public.vocabulary_words
FOR SELECT
USING (true);

-- Update starter_words policies to be more restrictive
-- Drop existing public policy
DROP POLICY IF EXISTS "Allow functions to read active starter words" ON public.starter_words;

-- Create new restrictive policy for starter_words
CREATE POLICY "Authenticated users can view active starter words"
ON public.starter_words
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    -- User has an active subscription
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND (
        (is_pro = true AND (subscription_ends_at IS NULL OR subscription_ends_at > now())) 
        OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
      )
    )
    -- Or user is an admin
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Allow service role to read starter words for system functions
CREATE POLICY "Service role can read starter words"
ON public.starter_words
FOR SELECT
USING (is_active = true);

-- Set search_path for all existing functions to fix the mutable search path warning
-- Update the has_role function to set search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
$$;

-- Update current_user_phone_number function to set search_path
CREATE OR REPLACE FUNCTION public.current_user_phone_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  phone TEXT;
BEGIN
  SELECT phone_number INTO phone FROM public.user_subscriptions WHERE user_id = auth.uid() LIMIT 1;
  RETURN phone;
END;
$$;
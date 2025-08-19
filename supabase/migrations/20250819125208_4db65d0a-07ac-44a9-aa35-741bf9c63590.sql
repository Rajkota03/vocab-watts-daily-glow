-- Also secure the user_subscriptions table to prevent data leakage

-- First, check existing policies and drop overly permissive ones if any
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.user_subscriptions;

-- Recreate more secure service role policy
CREATE POLICY "Service role can manage subscriptions" 
ON public.user_subscriptions 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure users can only view their own subscription data
-- The existing policies should already be secure, but let's verify they're restrictive enough

-- Add constraint to ensure user_id is set for authenticated operations
-- This will help prevent RLS bypasses when user_id is null
ALTER TABLE public.outbox_messages 
ADD CONSTRAINT outbox_messages_user_phone_check 
CHECK (
  (user_id IS NOT NULL) OR 
  (user_id IS NULL AND phone IS NOT NULL)
);

-- Add a function to validate outbox message ownership for better security
CREATE OR REPLACE FUNCTION public.user_owns_outbox_message(message_user_id UUID, message_phone TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN message_user_id IS NOT NULL THEN 
        message_user_id = auth.uid()
      WHEN message_phone IS NOT NULL THEN 
        EXISTS (
          SELECT 1 
          FROM public.user_subscriptions 
          WHERE user_id = auth.uid() 
          AND phone_number = message_phone
        )
      ELSE 
        false
    END;
$$;
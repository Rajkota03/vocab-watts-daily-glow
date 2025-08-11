-- Fix user_subscriptions security vulnerability
-- Remove the dangerous public insert policy that allows anonymous users to create fake subscriptions
DROP POLICY IF EXISTS "Allow public inserts to user_subscriptions" ON public.user_subscriptions;

-- Create secure, operation-specific policies for user_subscriptions

-- 1. Allow service_role to insert subscriptions (for payment webhooks and edge functions)
CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Keep existing authenticated user policies but make them more explicit
-- Replace existing similar policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;

-- Create new explicit policy for authenticated users to insert their own subscriptions
CREATE POLICY "Authenticated users can insert their own subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL -- Ensure user_id is set
);

-- 3. Add admin policy for subscription management
CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- 4. Ensure anonymous users have no access to insert subscriptions
CREATE POLICY "Anonymous users cannot insert subscriptions"
ON public.user_subscriptions
FOR INSERT
TO anon
WITH CHECK (false);

-- 5. Add validation constraints to prevent malicious data
-- Ensure phone_number follows a valid format (basic validation)
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT phone_number_format 
CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');

-- Ensure email format is valid if provided
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT email_format 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure subscription_ends_at is in the future if set
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT subscription_end_future 
CHECK (subscription_ends_at IS NULL OR subscription_ends_at > created_at);

-- Add function to validate subscription data integrity
CREATE OR REPLACE FUNCTION public.validate_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure that if user_id is set, it corresponds to a real user
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Invalid user_id: user does not exist';
    END IF;
  END IF;
  
  -- Ensure pro subscriptions have valid end dates
  IF NEW.is_pro = true AND NEW.subscription_ends_at IS NULL THEN
    RAISE EXCEPTION 'Pro subscriptions must have a valid end date';
  END IF;
  
  -- Prevent backdating of subscriptions
  IF NEW.subscription_ends_at IS NOT NULL AND NEW.subscription_ends_at < NEW.created_at THEN
    RAISE EXCEPTION 'Subscription end date cannot be before creation date';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for data validation
DROP TRIGGER IF EXISTS validate_subscription_data_trigger ON public.user_subscriptions;
CREATE TRIGGER validate_subscription_data_trigger
  BEFORE INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_data();

-- Apply the same security fixes to the staging schema
DROP POLICY IF EXISTS "Allow public inserts to user_subscriptions" ON staging.user_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own subscription" ON staging.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON staging.user_subscriptions;

-- Create secure policies for staging schema
CREATE POLICY "Service role can manage subscriptions"
ON staging.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert their own subscriptions"
ON staging.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
);

CREATE POLICY "Admins can manage all subscriptions"
ON staging.user_subscriptions
FOR ALL
TO authenticated
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role))
WITH CHECK (staging.has_role(auth.uid(), 'admin'::staging.app_role));

CREATE POLICY "Anonymous users cannot insert subscriptions"
ON staging.user_subscriptions
FOR INSERT
TO anon
WITH CHECK (false);

-- Add same constraints to staging
ALTER TABLE staging.user_subscriptions 
ADD CONSTRAINT phone_number_format 
CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE staging.user_subscriptions 
ADD CONSTRAINT email_format 
CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE staging.user_subscriptions 
ADD CONSTRAINT subscription_end_future 
CHECK (subscription_ends_at IS NULL OR subscription_ends_at > created_at);

-- Create validation function for staging
CREATE OR REPLACE FUNCTION staging.validate_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Invalid user_id: user does not exist';
    END IF;
  END IF;
  
  IF NEW.is_pro = true AND NEW.subscription_ends_at IS NULL THEN
    RAISE EXCEPTION 'Pro subscriptions must have a valid end date';
  END IF;
  
  IF NEW.subscription_ends_at IS NOT NULL AND NEW.subscription_ends_at < NEW.created_at THEN
    RAISE EXCEPTION 'Subscription end date cannot be before creation date';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'staging';

-- Add trigger for staging
DROP TRIGGER IF EXISTS validate_subscription_data_trigger ON staging.user_subscriptions;
CREATE TRIGGER validate_subscription_data_trigger
  BEFORE INSERT OR UPDATE ON staging.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION staging.validate_subscription_data();

-- Add table comments explaining the security model
COMMENT ON TABLE public.user_subscriptions IS 'User subscriptions with strict RLS policies. Only authenticated users can create their own subscriptions, service role can manage for payments, admins have full access. Anonymous access is denied.';
COMMENT ON TABLE staging.user_subscriptions IS 'Staging user subscriptions with identical security model to production.';

-- Log the security fix with proper JSON casting
INSERT INTO public.app_settings (setting_key, setting_value, updated_by) 
VALUES (
  'security_fix_user_subscriptions', 
  jsonb_build_object(
    'fix_date', now()::text,
    'description', 'Removed public insert policy, added data validation, restricted anonymous access'
  ),
  null
) ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();
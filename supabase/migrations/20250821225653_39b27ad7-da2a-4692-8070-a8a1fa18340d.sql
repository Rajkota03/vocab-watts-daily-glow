-- First, modify the validation function to allow admin users unlimited subscriptions
CREATE OR REPLACE FUNCTION validate_subscription_data()
RETURNS TRIGGER AS $$
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
      SELECT 1 FROM user_roles WHERE user_id = NEW.user_id AND role = 'admin'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now update admin users to have unlimited subscriptions
UPDATE user_subscriptions 
SET 
  is_pro = true,
  subscription_ends_at = NULL,
  trial_ends_at = NULL
WHERE user_id IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
);

-- Create a function to auto-assign unlimited subscriptions to admin users
CREATE OR REPLACE FUNCTION ensure_admin_unlimited_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- If a user is assigned admin role, update their subscription to unlimited
  IF NEW.role = 'admin' THEN
    INSERT INTO user_subscriptions (
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
    FROM profiles p 
    WHERE p.id = NEW.user_id
    ON CONFLICT (phone_number) DO UPDATE SET
      is_pro = true,
      subscription_ends_at = NULL,
      trial_ends_at = NULL,
      user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically give admins unlimited subscriptions
DROP TRIGGER IF EXISTS ensure_admin_subscription ON user_roles;
CREATE TRIGGER ensure_admin_subscription
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_admin_unlimited_subscription();
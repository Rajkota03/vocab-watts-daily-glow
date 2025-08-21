-- Update admin users to have unlimited subscriptions
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
      NULL, -- no end date
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

-- Set up daily scheduler cron job (runs every day at 6:00 AM UTC)
SELECT cron.schedule(
  'daily-vocab-scheduler',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/daily-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  );
  $$
);

-- Set up outbox processor cron job (runs every 5 minutes)
SELECT cron.schedule(
  'outbox-processor', 
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/outbox-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicG10cWNmZmhxd3pib3ZpcWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTk4NDEsImV4cCI6MjA1OTc5NTg0MX0.IinFO7UL9mbSP4hvpFGRRr_I7KEeDrwXWv8oZkfhAV4"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  );
  $$
);
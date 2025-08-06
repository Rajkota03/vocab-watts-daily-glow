-- Update the existing users to daily-intermediate category
UPDATE user_subscriptions 
SET category = 'daily-intermediate' 
WHERE phone_number IN ('+919949567744', '+919502038767');

-- Also fix the user_id linking issue by updating the subscription with null user_id
-- to link them properly to the authenticated user
UPDATE user_subscriptions 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = user_subscriptions.email 
  LIMIT 1
)
WHERE user_id IS NULL AND email IS NOT NULL;
-- Fix phone number constraint issue by dropping the constraint properly
-- The constraint is causing issues when users try to update their subscription

-- Drop the unique constraint on phone_number column
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_phone_number_key;

-- Add a partial unique index instead to allow multiple subscriptions per phone but unique per user
CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_user_phone_unique 
ON user_subscriptions (user_id, phone_number) 
WHERE phone_number IS NOT NULL;
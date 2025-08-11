-- Fix phone number constraint issue by removing the unique constraint
-- The constraint is causing issues when users try to update their subscription

-- First, check if the constraint exists and remove it
DROP INDEX IF EXISTS user_subscriptions_phone_number_key;

-- Remove the unique constraint on phone_number column
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_phone_number_key;

-- Add a partial unique index instead to allow multiple subscriptions per phone but unique per user
CREATE UNIQUE INDEX user_subscriptions_user_phone_unique 
ON user_subscriptions (user_id, phone_number) 
WHERE phone_number IS NOT NULL;
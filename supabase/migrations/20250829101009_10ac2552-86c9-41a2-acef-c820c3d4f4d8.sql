-- Fix data integrity issues for messaging system

-- 1. First, let's check and fix duplicate subscriptions
-- Remove duplicate subscription for +919949567744, keeping the one with a valid user_id
DELETE FROM user_subscriptions 
WHERE phone_number = '+919949567744' 
AND user_id IS NULL;

-- 2. Create default delivery settings for all users who don't have them
INSERT INTO user_delivery_settings (user_id, words_per_day, mode, auto_window_start, auto_window_end, timezone)
SELECT DISTINCT us.user_id, 3, 'auto', '09:00:00'::time, '21:00:00'::time, 'UTC'
FROM user_subscriptions us
LEFT JOIN user_delivery_settings uds ON us.user_id = uds.user_id
WHERE us.user_id IS NOT NULL 
AND uds.user_id IS NULL
AND (
    (us.is_pro = true AND (us.subscription_ends_at IS NULL OR us.subscription_ends_at > now()))
    OR (us.trial_ends_at IS NOT NULL AND us.trial_ends_at > now())
);

-- 3. For subscriptions without user_id, try to match them with existing profiles
UPDATE user_subscriptions 
SET user_id = p.id
FROM profiles p
WHERE user_subscriptions.user_id IS NULL 
AND user_subscriptions.phone_number = p.whatsapp_number;

-- 4. Clean up any remaining invalid subscriptions (no user_id and can't match to profile)
-- Mark them as inactive rather than deleting to preserve data
UPDATE user_subscriptions 
SET trial_ends_at = now() - interval '1 day',
    subscription_ends_at = now() - interval '1 day'
WHERE user_id IS NULL 
AND phone_number NOT IN (SELECT whatsapp_number FROM profiles WHERE whatsapp_number IS NOT NULL);

-- 5. Ensure all active subscriptions have valid categories
UPDATE user_subscriptions 
SET category = 'daily-intermediate'
WHERE category IS NULL 
AND user_id IS NOT NULL
AND (
    (is_pro = true AND (subscription_ends_at IS NULL OR subscription_ends_at > now()))
    OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
);
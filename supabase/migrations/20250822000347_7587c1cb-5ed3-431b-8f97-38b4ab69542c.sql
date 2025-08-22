-- Clean up duplicate user subscriptions, keeping only the most recent one per phone number
WITH ranked_subscriptions AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY phone_number 
           ORDER BY created_at DESC, 
                    CASE WHEN user_id IS NOT NULL THEN 1 ELSE 2 END,
                    CASE WHEN is_pro = true THEN 1 ELSE 2 END
         ) as rn
  FROM user_subscriptions
),
subscriptions_to_delete AS (
  SELECT id FROM ranked_subscriptions WHERE rn > 1
)
DELETE FROM user_subscriptions 
WHERE id IN (SELECT id FROM subscriptions_to_delete);
-- Clean up duplicate outbox messages for today
DELETE FROM outbox_messages 
WHERE DATE(send_at) = CURRENT_DATE 
AND status = 'queued';

-- Fix users with custom mode but mismatched words_per_day
WITH custom_time_counts AS (
  SELECT user_id, COUNT(*) as custom_times_count
  FROM user_custom_times
  GROUP BY user_id
)
UPDATE user_delivery_settings 
SET words_per_day = custom_time_counts.custom_times_count,
    updated_at = now()
FROM custom_time_counts 
WHERE user_delivery_settings.user_id = custom_time_counts.user_id 
AND user_delivery_settings.mode = 'custom' 
AND user_delivery_settings.words_per_day != custom_time_counts.custom_times_count;

-- Add a scheduler_source column to track which scheduler created the message
ALTER TABLE outbox_messages ADD COLUMN IF NOT EXISTS scheduler_source TEXT DEFAULT 'unknown';
-- Fix the user who has custom times but mode is set to auto
UPDATE user_delivery_settings 
SET mode = 'custom',
    words_per_day = 3,
    updated_at = now()
WHERE user_id = '53fdfbdc-e7e7-405a-a4b9-55b989466beb' 
AND mode = 'auto' 
AND EXISTS (
  SELECT 1 FROM user_custom_times 
  WHERE user_custom_times.user_id = user_delivery_settings.user_id
);
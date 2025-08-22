-- Update existing subscriptions to have default category if null or empty
UPDATE public.user_subscriptions 
SET category = 'daily-intermediate' 
WHERE category IS NULL OR category = '' OR category = 'general';

-- Set default for future inserts by updating the table default
ALTER TABLE public.user_subscriptions 
ALTER COLUMN category SET DEFAULT 'daily-intermediate';
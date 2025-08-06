-- Add required fields to user_subscriptions table for email authentication
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS last_word_sent_id uuid,
ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone;

-- Update RLS policies to allow email-based access
CREATE POLICY "Users can view subscriptions by email" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update subscriptions by email" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = email);
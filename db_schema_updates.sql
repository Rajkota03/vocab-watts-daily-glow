
-- This is not a file that will be used directly, but shows the SQL updates needed
-- for your Supabase database to support Razorpay payments

-- Add Razorpay columns to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN razorpay_order_id text,
ADD COLUMN razorpay_payment_id text;

-- Create a payment_history table to track payment attempts
CREATE TABLE public.payment_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  phone_number text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL, -- 'created', 'successful', 'failed'
  razorpay_order_id text,
  razorpay_payment_id text,
  payment_method text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policies for payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own payment history
CREATE POLICY "Users can view their own payment history"
ON public.payment_history
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

-- Allow users to insert their own payment records
CREATE POLICY "Users can insert their own payment records"
ON public.payment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins full access to payment history
CREATE POLICY "Admins have full access to payment history"
ON public.payment_history
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

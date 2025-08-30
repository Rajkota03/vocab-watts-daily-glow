-- Add razorpay_subscription_id column to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Add subscription status column to track active/cancelled state
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_subscription_id 
ON public.user_subscriptions(razorpay_subscription_id);

-- Create function to cancel Razorpay subscription
CREATE OR REPLACE FUNCTION public.cancel_user_subscription(user_id_param UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  subscription_record RECORD;
  result jsonb;
BEGIN
  -- Get user's subscription
  SELECT * INTO subscription_record
  FROM public.user_subscriptions 
  WHERE user_id = user_id_param 
  AND is_pro = true 
  AND subscription_ends_at > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active subscription found'
    );
  END IF;
  
  -- Mark subscription as cancelled (but keep active until period ends)
  UPDATE public.user_subscriptions 
  SET subscription_status = 'cancelled'
  WHERE user_id = user_id_param;
  
  RETURN jsonb_build_object(
    'success', true,
    'razorpay_subscription_id', subscription_record.razorpay_subscription_id,
    'message', 'Subscription marked for cancellation'
  );
END;
$$;
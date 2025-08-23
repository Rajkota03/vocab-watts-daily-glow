-- Add trial_user flag to profiles table for better user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_user boolean DEFAULT false;

-- Create a function to handle trial user conversions
CREATE OR REPLACE FUNCTION convert_trial_to_pro_user(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the profile to mark as no longer trial user
  UPDATE public.profiles 
  SET trial_user = false 
  WHERE id = user_id_param;
  
  -- Update the subscription to pro status
  UPDATE public.user_subscriptions 
  SET is_pro = true,
      subscription_ends_at = (now() + interval '30 days'),
      trial_ends_at = null
  WHERE user_id = user_id_param;
  
  return true;
END;
$$;

-- Create index for better performance on trial user queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_user ON public.profiles(trial_user) WHERE trial_user = true;
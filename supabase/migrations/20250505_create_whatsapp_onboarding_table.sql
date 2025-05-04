
-- Create a table to track the WhatsApp onboarding conversation flow
CREATE TABLE IF NOT EXISTS public.whatsapp_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'initial',
  delivery_time TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_onboarding_phone_number ON public.whatsapp_onboarding (phone_number);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admin users to view
CREATE POLICY "Admins can view all onboarding data" ON public.whatsapp_onboarding
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create policy to allow service role to modify
CREATE POLICY "Service role can modify onboarding data" ON public.whatsapp_onboarding
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

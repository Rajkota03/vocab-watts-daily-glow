
-- Create OTP codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON public.otp_codes(phone_number);

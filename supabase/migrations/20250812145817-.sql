-- Add token column to whatsapp_config table if it doesn't exist
ALTER TABLE public.whatsapp_config 
ADD COLUMN IF NOT EXISTS token TEXT,
ADD COLUMN IF NOT EXISTS phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS display_status TEXT,
ADD COLUMN IF NOT EXISTS display_status_reason TEXT,
ADD COLUMN IF NOT EXISTS waba_id TEXT;

-- Update the existing record with the new token
INSERT INTO public.whatsapp_config (
  token, 
  phone_number_id, 
  verification_token, 
  provider,
  webhook_verified,
  created_at,
  updated_at
) VALUES (
  'EAAXbVrl8PJkBPFpwqILHVNZA0YU0b3Qylm0K3o2vD28ARaiGd4kiASqbbf98NyBcc9n3VpptZAzuaeoCYAU060kpIHpP2i5mVBy2srBhE6i04Ma05B7zK2o9Fu7SglLiSqF1axgEUcufZCZCWk2JcfIXK53AbC12PNrYXvqpwZBi6lHFszjjbMN0ukpER5HTKcAZDZD',
  '1210928836703397',
  'glintup_verify_2024',
  'meta',
  false,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  token = EXCLUDED.token,
  phone_number_id = EXCLUDED.phone_number_id,
  verification_token = EXCLUDED.verification_token,
  updated_at = now();
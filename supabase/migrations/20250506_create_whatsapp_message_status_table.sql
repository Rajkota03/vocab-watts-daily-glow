
-- Create a table to store WhatsApp message status updates from Twilio
CREATE TABLE IF NOT EXISTS public.whatsapp_message_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_sid TEXT NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  to_number TEXT,
  from_number TEXT,
  api_version TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.whatsapp_message_status ENABLE ROW LEVEL SECURITY;

-- Allow admin users to view message status
CREATE POLICY "Admins can view message status" 
  ON public.whatsapp_message_status 
  FOR SELECT 
  TO authenticated 
  USING ((SELECT has_role(auth.uid(), 'admin'::app_role)));

-- Allow Supabase functions to insert message status
CREATE POLICY "Functions can insert message status"
  ON public.whatsapp_message_status
  FOR INSERT
  TO anon
  WITH CHECK (true);

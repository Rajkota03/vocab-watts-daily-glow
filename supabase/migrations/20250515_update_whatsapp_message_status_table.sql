
-- Add a comment to the api_version column explaining the Twilio API version
COMMENT ON COLUMN public.whatsapp_message_status.api_version IS 
  'Twilio API version (2010-04-01 is normal and represents Twilio''s stable API versioning scheme)';

-- Add a note field to store additional information
ALTER TABLE public.whatsapp_message_status
ADD COLUMN notes TEXT;

COMMENT ON COLUMN public.whatsapp_message_status.notes IS
  'Additional notes or information about the message status';

-- Add an index on the message_sid column for faster lookups
CREATE INDEX IF NOT EXISTS whatsapp_message_status_message_sid_idx ON public.whatsapp_message_status (message_sid);

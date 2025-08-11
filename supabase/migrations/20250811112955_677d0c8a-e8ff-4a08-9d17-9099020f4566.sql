-- Create WhatsApp configuration table for persistent storage
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  waba_id TEXT,
  display_name TEXT,
  display_status TEXT CHECK (display_status IN ('pending', 'approved', 'rejected')),
  display_status_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view WhatsApp config" 
  ON public.whatsapp_config 
  FOR SELECT 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert WhatsApp config" 
  ON public.whatsapp_config 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update WhatsApp config" 
  ON public.whatsapp_config 
  FOR UPDATE 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
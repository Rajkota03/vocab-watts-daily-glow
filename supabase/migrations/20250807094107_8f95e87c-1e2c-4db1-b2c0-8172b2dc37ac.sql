-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

-- Create RLS policies for logo bucket
CREATE POLICY "Public can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Admin can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'logos' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid() AND auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Admin can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'logos' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid() AND auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Admin can delete logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'logos' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE id = auth.uid() AND auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  )
);

-- Create a settings table to store logo configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_settings
CREATE POLICY "Admin can manage app settings" 
ON public.app_settings 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Insert default logo setting
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('logo_config', '{"main_logo": "/public/logo.svg", "horizontal_logo": "/public/logo-horizontal.svg"}')
ON CONFLICT (setting_key) DO NOTHING;
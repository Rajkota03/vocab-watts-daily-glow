-- Create staging schema
CREATE SCHEMA IF NOT EXISTS staging;

-- Create app_role enum in staging schema
CREATE TYPE staging.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create staging.app_settings table
CREATE TABLE staging.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL,
  setting_value jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

-- Create staging.otp_codes table
CREATE TABLE staging.otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used boolean NOT NULL DEFAULT false
);

-- Create staging.profiles table
CREATE TABLE staging.profiles (
  id uuid NOT NULL PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  nick_name text,
  whatsapp_number text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.user_roles table
CREATE TABLE staging.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role staging.app_role NOT NULL DEFAULT 'user'::staging.app_role,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.user_subscriptions table
CREATE TABLE staging.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  phone_number text NOT NULL,
  is_pro boolean NOT NULL DEFAULT false,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  trial_ends_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  last_word_sent_id uuid,
  last_sent_at timestamp with time zone,
  razorpay_order_id text,
  razorpay_payment_id text,
  delivery_time text,
  email text,
  first_name text,
  last_name text,
  level text
);

-- Create staging.scheduled_messages table
CREATE TABLE staging.scheduled_messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid,
  phone_number text NOT NULL,
  message text,
  scheduled_time timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text,
  category text,
  is_pro boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create staging.sent_words table
CREATE TABLE staging.sent_words (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  word_id uuid NOT NULL,
  phone_number text,
  category text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.user_word_history table
CREATE TABLE staging.user_word_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  word_id uuid NOT NULL,
  word text NOT NULL,
  category text NOT NULL,
  date_sent timestamp with time zone NOT NULL DEFAULT now(),
  source text DEFAULT 'database'::text
);

-- Create staging.vocab_prompts table
CREATE TABLE staging.vocab_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  subcategory text,
  prompt text NOT NULL,
  difficulty_level text DEFAULT 'intermediate'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.vocabulary_words table
CREATE TABLE staging.vocabulary_words (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word text NOT NULL,
  definition text NOT NULL,
  example text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.whatsapp_config table
CREATE TABLE staging.whatsapp_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url text,
  webhook_verified boolean DEFAULT false,
  verification_token text,
  provider text DEFAULT 'twilio'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.whatsapp_messages table
CREATE TABLE staging.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_number text NOT NULL,
  message text,
  media_url text,
  provider text,
  processed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staging.whatsapp_message_status table
CREATE TABLE staging.whatsapp_message_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_sid text,
  from_number text,
  to_number text NOT NULL,
  status text NOT NULL,
  error_code text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all staging tables
ALTER TABLE staging.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.sent_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.user_word_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.vocab_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging.whatsapp_message_status ENABLE ROW LEVEL SECURITY;

-- Create staging functions
CREATE OR REPLACE FUNCTION staging.has_role(_user_id uuid, _role staging.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'staging'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM staging.user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
$$;

CREATE OR REPLACE FUNCTION staging.current_user_phone_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'staging'
AS $$
DECLARE
  phone TEXT;
BEGIN
  SELECT phone_number INTO phone FROM staging.user_subscriptions WHERE user_id = auth.uid() LIMIT 1;
  RETURN phone;
END;
$$;

CREATE OR REPLACE FUNCTION staging.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER set_staging_app_settings_updated_at
  BEFORE UPDATE ON staging.app_settings
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

CREATE TRIGGER set_staging_profiles_updated_at
  BEFORE UPDATE ON staging.profiles
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

CREATE TRIGGER set_staging_vocab_prompts_updated_at
  BEFORE UPDATE ON staging.vocab_prompts
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

CREATE TRIGGER set_staging_whatsapp_config_updated_at
  BEFORE UPDATE ON staging.whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

CREATE TRIGGER set_staging_whatsapp_messages_updated_at
  BEFORE UPDATE ON staging.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

CREATE TRIGGER set_staging_whatsapp_message_status_updated_at
  BEFORE UPDATE ON staging.whatsapp_message_status
  FOR EACH ROW EXECUTE FUNCTION staging.handle_updated_at();

-- Create RLS policies for staging tables

-- staging.app_settings policies
CREATE POLICY "Admin can manage app settings" 
ON staging.app_settings 
FOR ALL 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role))
WITH CHECK (staging.has_role(auth.uid(), 'admin'::staging.app_role));

-- staging.otp_codes policies
CREATE POLICY "Allow service_role access" 
ON staging.otp_codes 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- staging.profiles policies
CREATE POLICY "Users can view own profile" 
ON staging.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON staging.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- staging.user_roles policies
CREATE POLICY "Users can read their own roles" 
ON staging.user_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON staging.user_roles 
FOR ALL 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));

-- staging.user_subscriptions policies
CREATE POLICY "Users can view own subscriptions" 
ON staging.user_subscriptions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR phone_number IN (
  SELECT whatsapp_number FROM staging.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update own subscriptions" 
ON staging.user_subscriptions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow public inserts to user_subscriptions" 
ON staging.user_subscriptions 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert their own subscription" 
ON staging.user_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- staging.scheduled_messages policies
CREATE POLICY "Users can see their own scheduled messages" 
ON staging.scheduled_messages 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled messages" 
ON staging.scheduled_messages 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled messages" 
ON staging.scheduled_messages 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled messages" 
ON staging.scheduled_messages 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- staging.sent_words policies
CREATE POLICY "Users can view their own sent words" 
ON staging.sent_words 
FOR SELECT 
TO authenticated 
USING (
  (phone_number IS NOT NULL AND phone_number = staging.current_user_phone_number()) 
  OR (user_id = auth.uid())
);

-- staging.user_word_history policies
CREATE POLICY "Users can view their own word history" 
ON staging.user_word_history 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own word history" 
ON staging.user_word_history 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- staging.vocab_prompts policies
CREATE POLICY "Admin can manage vocab prompts" 
ON staging.vocab_prompts 
FOR ALL 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role))
WITH CHECK (staging.has_role(auth.uid(), 'admin'::staging.app_role));

-- staging.vocabulary_words policies
CREATE POLICY "Anyone can view vocabulary words" 
ON staging.vocabulary_words 
FOR SELECT 
TO authenticated 
USING (true);

-- staging.whatsapp_config policies
CREATE POLICY "Admins can view WhatsApp config" 
ON staging.whatsapp_config 
FOR SELECT 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));

CREATE POLICY "Admins can update WhatsApp config" 
ON staging.whatsapp_config 
FOR ALL 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));

-- staging.whatsapp_messages policies
CREATE POLICY "Admins can view all messages" 
ON staging.whatsapp_messages 
FOR SELECT 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));

CREATE POLICY "Functions can insert messages" 
ON staging.whatsapp_messages 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- staging.whatsapp_message_status policies
CREATE POLICY "Admins can view all whatsapp message statuses" 
ON staging.whatsapp_message_status 
FOR SELECT 
TO authenticated 
USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));

CREATE POLICY "Functions can insert whatsapp message statuses" 
ON staging.whatsapp_message_status 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Functions can update whatsapp message statuses" 
ON staging.whatsapp_message_status 
FOR UPDATE 
TO anon 
USING (true);
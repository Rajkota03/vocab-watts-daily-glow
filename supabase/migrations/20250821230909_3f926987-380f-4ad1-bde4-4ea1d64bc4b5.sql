-- Fix remaining functions to have immutable search_path

-- Update all remaining functions to set search_path
CREATE OR REPLACE FUNCTION public.get_whatsapp_message_status(message_sid_param text)
RETURNS SETOF whatsapp_message_status
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM public.whatsapp_message_status
  WHERE message_sid = message_sid_param
  ORDER BY created_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_owns_outbox_message(message_user_id uuid, message_phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    CASE 
      WHEN message_user_id IS NOT NULL THEN 
        message_user_id = auth.uid()
      WHEN message_phone IS NOT NULL THEN 
        EXISTS (
          SELECT 1 
          FROM public.user_subscriptions 
          WHERE user_id = auth.uid() 
          AND phone_number = message_phone
        )
      ELSE 
        false
    END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - interval '1 hour');
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_whatsapp_tables()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
  tables_created TEXT[] DEFAULT '{}';
BEGIN
  -- Check if whatsapp_messages table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_messages') THEN
    -- Create whatsapp_messages table
    CREATE TABLE public.whatsapp_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_number TEXT NOT NULL,
      message TEXT,
      media_url TEXT,
      provider TEXT,
      processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    tables_created := array_append(tables_created, 'whatsapp_messages');
    
    -- Set up RLS
    ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
    
    -- Create a policy to allow admins to view all messages
    CREATE POLICY "Admins can view all messages" 
      ON public.whatsapp_messages 
      FOR SELECT 
      TO authenticated 
      USING (has_role(auth.uid(), 'admin'));
      
    -- Create a policy to allow admins to insert messages
    CREATE POLICY "Admins can insert messages" 
      ON public.whatsapp_messages 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (has_role(auth.uid(), 'admin'));
      
    -- Create a policy to allow the webhook function to insert messages
    CREATE POLICY "Functions can insert messages" 
      ON public.whatsapp_messages 
      FOR INSERT 
      TO anon 
      WITH CHECK (true);
  END IF;
  
  -- Check if whatsapp_config table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_config') THEN
    -- Create whatsapp_config table
    CREATE TABLE public.whatsapp_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      webhook_url TEXT,
      webhook_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      provider TEXT DEFAULT 'twilio',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    tables_created := array_append(tables_created, 'whatsapp_config');
    
    -- Set up RLS
    ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
    
    -- Create a policy to allow admins to view config
    CREATE POLICY "Admins can view config" 
      ON public.whatsapp_config 
      FOR SELECT 
      TO authenticated 
      USING (has_role(auth.uid(), 'admin'));
      
    -- Create a policy to allow admins to update config
    CREATE POLICY "Admins can update config" 
      ON public.whatsapp_config 
      FOR ALL 
      TO authenticated 
      USING (has_role(auth.uid(), 'admin'));
  END IF;
  
  -- Add updated_at trigger to both tables
  CREATE OR REPLACE TRIGGER set_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
  
  CREATE OR REPLACE TRIGGER set_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

  result := jsonb_build_object(
    'tables_created', tables_created,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_subscription_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ensure that if user_id is set, it corresponds to a real user
  IF NEW.user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
      RAISE EXCEPTION 'Invalid user_id: user does not exist';
    END IF;
  END IF;
  
  -- Allow admin users to have unlimited pro subscriptions (no end date required)
  IF NEW.is_pro = true AND NEW.subscription_ends_at IS NULL THEN
    -- Check if user is admin
    IF NEW.user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin'
    ) THEN
      -- Allow unlimited subscription for admins
      RETURN NEW;
    ELSE
      -- Require end date for non-admin pro subscriptions
      RAISE EXCEPTION 'Pro subscriptions must have a valid end date';
    END IF;
  END IF;
  
  -- Prevent backdating of subscriptions
  IF NEW.subscription_ends_at IS NOT NULL AND NEW.subscription_ends_at < NEW.created_at THEN
    RAISE EXCEPTION 'Subscription end date cannot be before creation date';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin_unlimited_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If a user is assigned admin role, update their subscription to unlimited
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_subscriptions (
      user_id, 
      phone_number, 
      email, 
      is_pro, 
      category, 
      subscription_ends_at, 
      trial_ends_at,
      first_name,
      last_name
    )
    SELECT 
      NEW.user_id,
      p.whatsapp_number,
      p.email,
      true, -- is_pro = true for admins
      'daily-intermediate', -- default category
      NULL, -- no end date (unlimited)
      NULL, -- no trial end
      p.first_name,
      p.last_name
    FROM public.profiles p 
    WHERE p.id = NEW.user_id
    ON CONFLICT (phone_number) DO UPDATE SET
      is_pro = true,
      subscription_ends_at = NULL,
      trial_ends_at = NULL,
      user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, nick_name, whatsapp_number, email)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'nick_name',
        NEW.raw_user_meta_data->>'whatsapp_number',
        NEW.email
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
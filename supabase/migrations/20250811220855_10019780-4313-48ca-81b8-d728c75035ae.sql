-- Fix WhatsApp message security vulnerabilities
-- Remove overly permissive policies and create secure ones

-- First, remove the insecure policies for whatsapp_messages
DROP POLICY IF EXISTS "Functions can insert messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.whatsapp_messages;

-- Create secure policies for whatsapp_messages
CREATE POLICY "Service role can insert messages" 
ON public.whatsapp_messages 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Authenticated admins can insert messages" 
ON public.whatsapp_messages 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated admins can update messages" 
ON public.whatsapp_messages 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix whatsapp_message_status policies
DROP POLICY IF EXISTS "Functions can insert whatsapp message statuses" ON public.whatsapp_message_status;
DROP POLICY IF EXISTS "Functions can update whatsapp message statuses" ON public.whatsapp_message_status;

-- Create secure policies for whatsapp_message_status
CREATE POLICY "Service role can insert message statuses" 
ON public.whatsapp_message_status 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update message statuses" 
ON public.whatsapp_message_status 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Authenticated admins can insert message statuses" 
ON public.whatsapp_message_status 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated admins can update message statuses" 
ON public.whatsapp_message_status 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add data validation for message integrity
ALTER TABLE public.whatsapp_messages 
ADD CONSTRAINT valid_from_number_format 
CHECK (from_number ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.whatsapp_message_status 
ADD CONSTRAINT valid_to_number_format 
CHECK (to_number ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.whatsapp_message_status 
ADD CONSTRAINT valid_status_values 
CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'delivered', 'read', 'undelivered'));

-- Apply the same fixes to staging schema if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'staging') THEN
        -- Remove insecure staging policies
        DROP POLICY IF EXISTS "Functions can insert messages" ON staging.whatsapp_messages;
        DROP POLICY IF EXISTS "Functions can insert whatsapp message statuses" ON staging.whatsapp_message_status;
        DROP POLICY IF EXISTS "Functions can update whatsapp message statuses" ON staging.whatsapp_message_status;
        
        -- Create secure staging policies
        CREATE POLICY "Service role can insert messages" 
        ON staging.whatsapp_messages 
        FOR INSERT 
        TO service_role
        WITH CHECK (true);

        CREATE POLICY "Authenticated admins can insert messages" 
        ON staging.whatsapp_messages 
        FOR INSERT 
        TO authenticated
        WITH CHECK (staging.has_role(auth.uid(), 'admin'::staging.app_role));

        CREATE POLICY "Service role can insert message statuses" 
        ON staging.whatsapp_message_status 
        FOR INSERT 
        TO service_role
        WITH CHECK (true);

        CREATE POLICY "Service role can update message statuses" 
        ON staging.whatsapp_message_status 
        FOR UPDATE 
        TO service_role
        USING (true);

        CREATE POLICY "Authenticated admins can insert message statuses" 
        ON staging.whatsapp_message_status 
        FOR INSERT 
        TO authenticated
        WITH CHECK (staging.has_role(auth.uid(), 'admin'::staging.app_role));

        CREATE POLICY "Authenticated admins can update message statuses" 
        ON staging.whatsapp_message_status 
        FOR UPDATE 
        TO authenticated
        USING (staging.has_role(auth.uid(), 'admin'::staging.app_role));
    END IF;
END $$;
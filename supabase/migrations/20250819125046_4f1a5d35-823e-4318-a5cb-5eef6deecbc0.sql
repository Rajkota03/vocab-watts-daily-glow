-- Drop existing overly permissive policies on outbox_messages
DROP POLICY IF EXISTS "Service role can manage outbox messages" ON public.outbox_messages;
DROP POLICY IF EXISTS "Users can view their own outbox messages" ON public.outbox_messages;

-- Create secure RLS policies for outbox_messages table

-- Policy 1: Only authenticated users can view their own outbox messages (when user_id is set)
CREATE POLICY "Users can view own outbox messages" 
ON public.outbox_messages 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id AND user_id IS NOT NULL
);

-- Policy 2: Only authenticated users can view outbox messages for their phone number (when user_id is null but they own the phone)
CREATE POLICY "Users can view outbox by phone" 
ON public.outbox_messages 
FOR SELECT 
TO authenticated
USING (
  user_id IS NULL AND 
  phone IN (
    SELECT phone_number 
    FROM public.user_subscriptions 
    WHERE user_id = auth.uid()
  )
);

-- Policy 3: Service role can insert outbox messages (for automated scheduling)
CREATE POLICY "Service role can insert outbox messages" 
ON public.outbox_messages 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Policy 4: Service role can update outbox messages (for status updates during processing)
CREATE POLICY "Service role can update outbox messages" 
ON public.outbox_messages 
FOR UPDATE 
TO service_role
USING (true);

-- Policy 5: Service role can select outbox messages (for processing)
CREATE POLICY "Service role can select outbox messages" 
ON public.outbox_messages 
FOR SELECT 
TO service_role
USING (true);

-- Policy 6: No public access - explicitly deny anon access
CREATE POLICY "Deny anonymous access to outbox messages" 
ON public.outbox_messages 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Policy 7: Authenticated users cannot insert or update outbox messages directly
CREATE POLICY "Users cannot modify outbox messages" 
ON public.outbox_messages 
FOR INSERT 
TO authenticated
WITH CHECK (false);

CREATE POLICY "Users cannot update outbox messages" 
ON public.outbox_messages 
FOR UPDATE 
TO authenticated
USING (false);

-- Policy 8: No one can delete outbox messages (preserve for audit trail)
CREATE POLICY "No deletion of outbox messages" 
ON public.outbox_messages 
FOR DELETE 
USING (false);
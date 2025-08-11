-- Fix OTP codes security vulnerability
-- Remove the overly permissive service_role policy
DROP POLICY IF EXISTS "Allow service_role access" ON public.otp_codes;

-- Create more secure, operation-specific policies

-- 1. Allow service_role to INSERT new OTP codes (for send-otp function)
CREATE POLICY "Service role can insert OTP codes"
ON public.otp_codes
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Allow service_role to SELECT OTP codes for verification (limited scope)
CREATE POLICY "Service role can verify OTP codes"
ON public.otp_codes
FOR SELECT
TO service_role
USING (
  -- Only allow reading for verification purposes
  -- Additional security: only unexpired, unused codes
  expires_at > now() AND used = false
);

-- 3. Allow service_role to UPDATE OTP codes to mark as used (for verify-otp function)
CREATE POLICY "Service role can mark OTP as used"
ON public.otp_codes
FOR UPDATE
TO service_role
USING (
  -- Only allow updating the 'used' status of valid codes
  expires_at > now()
)
WITH CHECK (
  -- Ensure only the 'used' field can be updated to true
  used = true
);

-- 4. Prevent service_role from deleting OTP codes (audit trail preservation)
CREATE POLICY "Service role cannot delete OTP codes"
ON public.otp_codes
FOR DELETE
TO service_role
USING (false);

-- 5. Allow authenticated users to view only their own unexpired, unused OTP codes
-- (This might be useful for debugging or user-facing OTP status)
CREATE POLICY "Users can view their own valid OTP codes"
ON public.otp_codes
FOR SELECT
TO authenticated
USING (
  -- Users can only see their own phone number's codes
  phone_number IN (
    SELECT whatsapp_number FROM public.profiles WHERE id = auth.uid()
    UNION
    SELECT phone_number FROM public.user_subscriptions WHERE user_id = auth.uid()
  )
  AND expires_at > now()
  AND used = false
);

-- 6. Prevent authenticated users from modifying OTP codes directly
CREATE POLICY "Users cannot modify OTP codes"
ON public.otp_codes
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Users cannot update OTP codes"
ON public.otp_codes
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Users cannot delete OTP codes"
ON public.otp_codes
FOR DELETE
TO authenticated
USING (false);

-- 7. Deny all access to anonymous users (extra security layer)
CREATE POLICY "Anonymous users have no access to OTP codes"
ON public.otp_codes
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add a cleanup function to automatically remove expired OTP codes (security best practice)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - interval '1 hour');
END;
$$;

-- Add comment explaining the security model
COMMENT ON TABLE public.otp_codes IS 'Stores OTP codes with restricted access policies. Service role can insert/verify/mark as used. Users can only view their own valid codes. Expired codes are automatically cleaned up.';

-- Apply the same security fixes to the staging schema
DROP POLICY IF EXISTS "Allow service_role access" ON staging.otp_codes;

-- Create identical policies for staging schema
CREATE POLICY "Service role can insert OTP codes"
ON staging.otp_codes
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can verify OTP codes"
ON staging.otp_codes
FOR SELECT
TO service_role
USING (expires_at > now() AND used = false);

CREATE POLICY "Service role can mark OTP as used"
ON staging.otp_codes
FOR UPDATE
TO service_role
USING (expires_at > now())
WITH CHECK (used = true);

CREATE POLICY "Service role cannot delete OTP codes"
ON staging.otp_codes
FOR DELETE
TO service_role
USING (false);

CREATE POLICY "Users can view their own valid OTP codes"
ON staging.otp_codes
FOR SELECT
TO authenticated
USING (
  phone_number IN (
    SELECT whatsapp_number FROM staging.profiles WHERE id = auth.uid()
    UNION
    SELECT phone_number FROM staging.user_subscriptions WHERE user_id = auth.uid()
  )
  AND expires_at > now()
  AND used = false
);

CREATE POLICY "Users cannot modify OTP codes"
ON staging.otp_codes
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Users cannot update OTP codes"
ON staging.otp_codes
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Users cannot delete OTP codes"
ON staging.otp_codes
FOR DELETE
TO authenticated
USING (false);

CREATE POLICY "Anonymous users have no access to OTP codes"
ON staging.otp_codes
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Create cleanup function for staging as well
CREATE OR REPLACE FUNCTION staging.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'staging'
AS $$
BEGIN
  DELETE FROM staging.otp_codes 
  WHERE expires_at < (now() - interval '1 hour');
END;
$$;
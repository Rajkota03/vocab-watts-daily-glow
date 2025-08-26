-- Remove the insecure policy that allows anyone to view vocabulary words
-- This prevents competitors from stealing educational content
DROP POLICY IF EXISTS "Anyone can view vocabulary words" ON public.vocabulary_words;

-- Verify that authenticated users with valid subscriptions can still access content
-- The existing policy "Authenticated users can view vocabulary words" already handles this properly
-- It checks for:
-- 1. User is authenticated (auth.uid() IS NOT NULL)
-- 2. User has active pro subscription OR active trial OR is admin

-- Also ensure service role access is maintained for edge functions
-- The existing policy "Service role can access vocabulary words" handles this
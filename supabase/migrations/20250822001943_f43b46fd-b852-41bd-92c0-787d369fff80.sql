-- Allow admins to manage vocabulary words
CREATE POLICY "Admins can manage vocabulary words" 
ON public.vocabulary_words 
FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
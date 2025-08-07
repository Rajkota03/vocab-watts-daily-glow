-- Fix logos bucket RLS policies to work without requiring profiles table
-- Drop existing logo-related policies
DROP POLICY IF EXISTS "Admin can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete logos" ON storage.objects;

-- Create simplified policies that only check admin role
CREATE POLICY "Admin can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'logos' AND 
  auth.uid() IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  )
);

CREATE POLICY "Admin can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'logos' AND 
  auth.uid() IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  )
);

CREATE POLICY "Admin can delete logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'logos' AND 
  auth.uid() IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  )
);
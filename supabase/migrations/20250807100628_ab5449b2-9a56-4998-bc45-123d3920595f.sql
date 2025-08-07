-- Promote the main user to admin role
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'tropes.in@gmail.com'
);
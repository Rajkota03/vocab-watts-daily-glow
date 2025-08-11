-- First, let's check if you already have admin role assigned
-- Get the current user's ID and check if they have admin role
SELECT ur.user_id, ur.role 
FROM user_roles ur 
WHERE ur.user_id = '53fdfbdc-e7e7-405a-a4b9-55b989466beb';

-- If no admin role exists, insert it
INSERT INTO user_roles (user_id, role)
SELECT '53fdfbdc-e7e7-405a-a4b9-55b989466beb', 'admin'::app_role
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = '53fdfbdc-e7e7-405a-a4b9-55b989466beb' 
    AND role = 'admin'::app_role
);
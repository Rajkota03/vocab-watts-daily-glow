
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'user' }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in at all
          toast({
            title: "Unauthorized",
            description: "Please log in to access this page.",
            variant: "destructive"
          });
          setIsAuthorized(false);
          return;
        }

        // For admin routes, check if user has admin role
        // Since we don't have a user_roles table yet, 
        // we'll temporarily check for admin email pattern or use a hardcoded check
        // This should be replaced with a proper role check once the user_roles table is created
        if (requiredRole === 'admin') {
          // Option 1: Check if email matches an admin pattern (e.g., ends with @admin.com)
          // const isAdmin = session.user.email?.endsWith('@admin.com') || false;
          
          // Option 2: Hardcoded admin check - Replace with your admin user ID or email
          // You can also add multiple admin IDs or implement other logic
          const adminEmails = ['admin@example.com']; // Replace with actual admin emails
          const isAdmin = adminEmails.includes(session.user.email || '');
          
          if (!isAdmin) {
            toast({
              title: "Access Denied",
              description: "You do not have permission to access the admin dashboard.",
              variant: "destructive"
            });
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          // Regular user route
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      }
    };

    checkUserRole();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (isAuthorized === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
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

        // For admin email, auto-authorize
        if (session.user.email === 'rajkota.sql@gmail.com' && requiredRole === 'admin') {
          setIsAuthorized(true);
          return;
        }

        // Check if user has the required role using our custom function
        const { data, error } = await supabase.rpc('has_role', { 
          _user_id: session.user.id,
          _role: requiredRole
        });
        
        if (error) {
          console.error('Role check failed:', error);
          setIsAuthorized(false);
          return;
        }
        
        if (!data) {
          toast({
            title: "Access Denied",
            description: `You need ${requiredRole} permissions to access this page.`,
            variant: "destructive"
          });
          setIsAuthorized(false);
        } else {
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

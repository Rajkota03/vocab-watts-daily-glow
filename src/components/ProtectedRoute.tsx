
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
        if (requiredRole === 'admin') {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single();

          if (error || !data) {
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

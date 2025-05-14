
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'user' }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Store a flag to prevent multiple redirects
    let isAuthCheckComplete = false;
    
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in at all
          if (!isAuthCheckComplete) {
            toast({
              title: "Unauthorized",
              description: "Please log in to access this page.",
              variant: "destructive"
            });
            setIsAuthorized(false);
            isAuthCheckComplete = true;
          }
        } else {
          // For admin email, auto-authorize
          if (session.user.email === 'rajkota.sql@gmail.com' && requiredRole === 'admin') {
            setIsAuthorized(true);
            setIsLoading(false);
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
          } else if (!data && !isAuthCheckComplete) {
            toast({
              title: "Access Denied",
              description: `You need ${requiredRole} permissions to access this page.`,
              variant: "destructive"
            });
            setIsAuthorized(false);
            isAuthCheckComplete = true;
          } else {
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [requiredRole]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (isAuthorized === false) {
    // Use state to pass the return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

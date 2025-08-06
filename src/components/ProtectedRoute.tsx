
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
    let isAuthCheckComplete = false;
    
    const checkUserRole = async () => {
      try {
        console.log("ProtectedRoute: Checking user role...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("ProtectedRoute: Session found:", !!session);
        
        if (!session) {
          console.log("ProtectedRoute: No session, redirecting to login");
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
          console.log("ProtectedRoute: Session found, checking role for:", session.user.email);
          
          // For admin email, auto-authorize
          if (session.user.email === 'rajkota.sql@gmail.com' && requiredRole === 'admin') {
            console.log("ProtectedRoute: Admin user authorized");
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }

          // For regular users accessing dashboard (default role), just authorize them
          if (requiredRole === 'user') {
            console.log("ProtectedRoute: Regular user authorized for user role");
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
            console.error('ProtectedRoute: Role check failed:', error);
            setIsAuthorized(false);
          } else if (!data && !isAuthCheckComplete) {
            console.log("ProtectedRoute: User lacks required role:", requiredRole);
            toast({
              title: "Access Denied",
              description: `You need ${requiredRole} permissions to access this page.`,
              variant: "destructive"
            });
            setIsAuthorized(false);
            isAuthCheckComplete = true;
          } else {
            console.log("ProtectedRoute: User has required role:", requiredRole);
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('ProtectedRoute: Authorization check failed:', error);
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


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
    let isMounted = true;
    let authCheckComplete = false;
    
    const checkUserRole = async () => {
      try {
        console.log("ProtectedRoute: Checking user role...");
        
        // First, listen for auth state changes to catch fresh sessions
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("ProtectedRoute: Auth state changed:", event, !!session);
          
          if (!isMounted) return;
          
          if (event === 'SIGNED_IN' && session) {
            console.log("ProtectedRoute: User signed in, session available:", session.user.email);
            await handleAuthCheck(session);
          } else if (event === 'SIGNED_OUT' || !session) {
            console.log("ProtectedRoute: User signed out or no session");
            if (!authCheckComplete) {
              authCheckComplete = true;
              toast({
                title: "Unauthorized",
                description: "Please log in to access this page.",
                variant: "destructive"
              });
              setIsAuthorized(false);
              setIsLoading(false);
            }
          }
        });
        
        // Also check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("ProtectedRoute: Initial session check:", !!session);
        
        if (session && isMounted) {
          console.log("ProtectedRoute: Found existing session for:", session.user.email);
          await handleAuthCheck(session);
        } else if (!session && isMounted && !authCheckComplete) {
          console.log("ProtectedRoute: No existing session found");
          authCheckComplete = true;
          toast({
            title: "Unauthorized",
            description: "Please log in to access this page.",
            variant: "destructive"
          });
          setIsAuthorized(false);
          setIsLoading(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('ProtectedRoute: Authorization check failed:', error);
        if (isMounted) {
          setIsAuthorized(false);
          setIsLoading(false);
        }
      }
    };
    
    const handleAuthCheck = async (session: any) => {
      if (!session || authCheckComplete) return;
      
      try {
        console.log("ProtectedRoute: Handling auth check for:", session.user.email);
        
        // For admin email, auto-authorize
        if (session.user.email === 'rajkota.sql@gmail.com' && requiredRole === 'admin') {
          console.log("ProtectedRoute: Admin user authorized");
          authCheckComplete = true;
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // For regular users accessing dashboard (default role), just authorize them
        if (requiredRole === 'user') {
          console.log("ProtectedRoute: Regular user authorized for user role");
          authCheckComplete = true;
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
          authCheckComplete = true;
          setIsAuthorized(false);
          setIsLoading(false);
        } else if (!data) {
          console.log("ProtectedRoute: User lacks required role:", requiredRole);
          authCheckComplete = true;
          toast({
            title: "Access Denied",
            description: `You need ${requiredRole} permissions to access this page.`,
            variant: "destructive"
          });
          setIsAuthorized(false);
          setIsLoading(false);
        } else {
          console.log("ProtectedRoute: User has required role:", requiredRole);
          authCheckComplete = true;
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('ProtectedRoute: Role check error:', error);
        authCheckComplete = true;
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkUserRole();

    return () => {
      isMounted = false;
    };
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


import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
        
        // Check for existing session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log("ProtectedRoute: Initial session check:", !!session);
        
        if (session && isMounted) {
          console.log("ProtectedRoute: Found existing session for:", session.user.email);
          await handleAuthCheck(session);
          return;
        }
        
        // Set up auth state listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("ProtectedRoute: Auth state changed:", event, !!session);
          
          if (!isMounted || authCheckComplete) return;
          
          if (event === 'SIGNED_IN' && session) {
            console.log("ProtectedRoute: User signed in, session available:", session.user.email);
            await handleAuthCheck(session);
          } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
            console.log("ProtectedRoute: User signed out or no session");
            authCheckComplete = true;
            toast({
              title: "Unauthorized",
              description: "Please log in to access this page.",
              variant: "destructive"
            });
            setIsAuthorized(false);
            setIsLoading(false);
          }
        });
        
        // If no existing session, show unauthorized
        if (!session && isMounted && !authCheckComplete) {
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
        if (isMounted && !authCheckComplete) {
          authCheckComplete = true;
          setIsAuthorized(false);
          setIsLoading(false);
        }
      }
    };
    
    const handleAuthCheck = async (session: any) => {
      if (!session || authCheckComplete) return;
      
      try {
        console.log("ProtectedRoute: Handling auth check for:", session.user.email);
        
        // Use proper database function to check admin role
        const { data: isAdminResult, error: adminCheckError } = await supabase.rpc('is_admin_user', { 
          _user_id: session.user.id 
        });
        
        if (adminCheckError) {
          console.error("ProtectedRoute: Admin check failed:", adminCheckError);
        } else if (isAdminResult && requiredRole === 'admin') {
          console.log("ProtectedRoute: Admin user authorized via database");
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

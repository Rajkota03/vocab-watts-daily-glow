
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthHandler = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let hasRedirected = false;
    
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          if (isMounted) {
            toast({
              title: "Authentication error",
              description: "Please sign in again to continue.",
              variant: "destructive"
            });
          }
          return;
        }
        
        if (isMounted) {
          setSession(currentSession);
        }
        
        if (!currentSession && !hasRedirected) {
          hasRedirected = true;
          navigate('/login');
        }
      } catch (error) {
        console.error("Exception checking session:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        if (isMounted) {
          setSession(currentSession);
        }
      }
      
      // Use a more general approach for session expiry events to avoid TypeScript errors
      // Supabase can emit various events like "SIGNED_OUT" or "USER_DELETED"
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setSession(null);
        }
        
        if (!hasRedirected) {
          hasRedirected = true;
          navigate('/login');
          
          if (isMounted) {
            toast({
              title: "Session expired",
              description: "Please sign in again to continue.",
              variant: "destructive"
            });
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Function to manually attempt to refresh the token
  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing token:", error);
        // If refresh fails, redirect to login
        toast({
          title: "Session expired",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
        navigate('/login');
        return false;
      }
      
      if (data.session) {
        setSession(data.session);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Exception refreshing token:", error);
      return false;
    }
  };

  return { session, refreshToken, isChecking };
};

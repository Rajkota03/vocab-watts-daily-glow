
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Session, User } from '@supabase/supabase-js';

export const useEmailAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Handle successful signup/login
          setTimeout(() => {
            handleAuthSuccess(session.user);
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: User) => {
    try {
      // Check if user already has a subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSubscription) {
        console.log('User already has a subscription, skipping creation');
        navigate('/dashboard');
        return;
      }

      // Use the ensureUserSubscription function which properly handles the user context
      const { ensureUserSubscription } = await import('@/services/subscriptionService');
      await ensureUserSubscription(user.id, user.user_metadata?.whatsapp_number);

      toast({
        title: "Welcome to VocabSpark!",
        description: "Your account is ready. You can now access your dashboard.",
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      // Still navigate to dashboard even if subscription creation fails
      navigate('/dashboard');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    user,
    session,
    isLoading,
    signOut
  };
};

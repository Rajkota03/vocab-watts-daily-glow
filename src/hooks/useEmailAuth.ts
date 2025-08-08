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
      // Create user subscription record with the collected data
      const userData = user.user_metadata;
      
      const subscriptionData = {
        email: user.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.whatsapp_number,
        is_pro: false,
        level: null,
        last_word_sent_id: null,
        last_sent_at: null,
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        category: 'general',
        delivery_time: '10:00'
      };

      console.log('Creating subscription with data:', subscriptionData);

      const { error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('Error creating subscription:', error);
        // Don't throw error here, just log it
      } else {
        toast({
          title: "Welcome to VocabSpark!",
          description: "Your free trial has started. Words will be delivered daily at 10 AM IST.",
        });
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
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
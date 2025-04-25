
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardSubscription } from '@/types/subscription';

export const useDashboardSubscription = () => {
  const [subscription, setSubscription] = useState<DashboardSubscription>({
    is_pro: false,
    category: 'daily-intermediate',
    phone_number: '',
    trial_ends_at: null,
    subscription_ends_at: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: subscriptionData, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else if (subscriptionData) {
        let category = subscriptionData.category || 'daily-intermediate';
        if (category && !category.includes('-')) {
          const mapping: { [key: string]: string } = {
            'business': 'business-intermediate',
            'exam': 'exam-gre',
            'slang': 'slang-intermediate',
            'daily': 'daily-intermediate'
          };
          category = mapping[category] || 'daily-intermediate';
        }
        
        setSubscription({
          is_pro: subscriptionData.is_pro,
          category: category,
          phone_number: subscriptionData.phone_number,
          trial_ends_at: subscriptionData.trial_ends_at,
          subscription_ends_at: subscriptionData.subscription_ends_at
        });
      }
      setLoading(false);
    };

    initializeSubscription();
  }, []);

  return { subscription, loading };
};

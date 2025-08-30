import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  is_pro: boolean;
  subscription_ends_at: string | null;
  subscription_status: string;
  razorpay_subscription_id: string | null;
  loading: boolean;
}

export const useSubscriptionStatus = (userId: string | null) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    is_pro: false,
    subscription_ends_at: null,
    subscription_status: 'inactive',
    razorpay_subscription_id: null,
    loading: true
  });
  const { toast } = useToast();

  const fetchSubscriptionStatus = async () => {
    if (!userId) {
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('is_pro, subscription_ends_at, subscription_status, razorpay_subscription_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      setSubscriptionStatus({
        is_pro: data.is_pro || false,
        subscription_ends_at: data.subscription_ends_at,
        subscription_status: data.subscription_status || 'inactive',
        razorpay_subscription_id: data.razorpay_subscription_id,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) {
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast({
        title: "Subscription Cancelled",
        description: data.message,
      });

      // Refresh subscription status
      await fetchSubscriptionStatus();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [userId]);

  return {
    ...subscriptionStatus,
    cancelSubscription,
    refreshStatus: fetchSubscriptionStatus
  };
};
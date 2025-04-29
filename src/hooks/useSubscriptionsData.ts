import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

interface Metric {
  name: string;
  value: string | number;
}

interface ConversionChartData {
  date: string;
  conversion: number;
}

interface SubscriptionsData {
  subscriptions: Subscription[];
  metrics: Metric[];
  conversionData: ConversionChartData[];
  loading: boolean;
  refreshData: () => void;
}

export function useSubscriptionsData(): SubscriptionsData {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [conversionData, setConversionData] = useState<ConversionChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    console.log("Refreshing subscription data...");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    fetchSubscriptionsData();
  }, [refreshTrigger]);

  const fetchSubscriptionsData = async () => {
    try {
      setLoading(true);
      console.log("Fetching subscription data...");
      
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subsError) throw subsError;
      
      console.log("Fetched subscriptions:", subsData?.length);
      setSubscriptions(subsData || []);
      
      const totalSubs = subsData?.length || 0;
      const proSubs = subsData?.filter(sub => sub.is_pro).length || 0;
      const trialConversionRate = totalSubs > 0 ? (proSubs / totalSubs * 100).toFixed(1) : '0';
      
      const now = new Date();
      const activeSubs = subsData?.filter(sub => {
        const endDate = sub.subscription_ends_at ? new Date(sub.subscription_ends_at) : now;
        const startDate = new Date(sub.created_at);
        return endDate >= now;
      }) || [];
      
      const totalMonths = activeSubs.reduce((acc, sub) => {
        const startDate = new Date(sub.created_at);
        const endDate = sub.subscription_ends_at ? new Date(sub.subscription_ends_at) : now;
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        return acc + months;
      }, 0);
      
      const avgDuration = activeSubs.length > 0 ? 
        (totalMonths / activeSubs.length).toFixed(1) : '0';
      
      const mrr = (proSubs * 149).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const churned = subsData?.filter(sub => {
        const endDate = sub.subscription_ends_at ? new Date(sub.subscription_ends_at) : now;
        return endDate < now && endDate > thirtyDaysAgo;
      }).length || 0;
      
      const churnRate = activeSubs.length > 0 ? 
        ((churned / activeSubs.length) * 100).toFixed(1) : '0';
      
      setMetrics([
        { name: 'Trial to Pro Conversion', value: `${trialConversionRate}%` },
        { name: 'Average Subscription Duration', value: `${avgDuration} months` },
        { name: 'Monthly Recurring Revenue', value: mrr },
        { name: 'Churn Rate', value: `${churnRate}%` }
      ]);
      
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7);
      }).reverse();
      
      const conversionTrend = last6Months.map(month => {
        const monthSubs = subsData?.filter(sub => 
          sub.created_at.startsWith(month)
        ) || [];
        
        const monthProSubs = monthSubs.filter(sub => sub.is_pro).length;
        const monthConversion = monthSubs.length > 0 ? 
          (monthProSubs / monthSubs.length) * 100 : 0;
        
        return {
          date: new Date(month).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          }),
          conversion: parseFloat(monthConversion.toFixed(1))
        };
      });
      
      setConversionData(conversionTrend);
      console.log("Subscription data processed successfully");
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    subscriptions, 
    metrics, 
    conversionData, 
    loading, 
    refreshData 
  };
}

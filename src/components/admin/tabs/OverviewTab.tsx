
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, CreditCard, CalendarCheck, BookOpen, 
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
}

const OverviewTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData[]>([
    { title: 'Total Users', value: '0', trend: 'up', icon: Users },
    { title: 'Pro Subscribers', value: '0', trend: 'up', icon: CreditCard },
    { title: 'Active Today', value: '0', trend: 'up', icon: CalendarCheck },
    { title: 'Total Words', value: '0', trend: 'up', icon: BookOpen },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get total users count from profiles table
      const { count: usersCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (profilesError) throw new Error(`Error fetching users: ${profilesError.message}`);
      
      console.log('Total users count from profiles:', usersCount);
      
      // Get pro subscribers count (unique users with pro subscription)
      const { data: proUsers, error: proError } = await supabase
        .from('user_subscriptions')
        .select('user_id, phone_number')
        .eq('is_pro', true);

      if (proError) throw new Error(`Error fetching pro users: ${proError.message}`);
      
      // Count unique phone numbers for pro subscribers
      const uniqueProPhones = new Set(proUsers?.map(item => item.phone_number) || []);
      const proCount = uniqueProPhones.size;
      
      console.log('Pro subscribers count (unique phone numbers):', proCount);
      console.log('Pro subscribers data:', proUsers);
      
      // Get active users count (active in the last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: activeUsers, error: activeError } = await supabase
        .from('user_word_history')
        .select('user_id')
        .gt('date_sent', yesterday.toISOString());

      if (activeError) throw new Error(`Error fetching active users: ${activeError.message}`);
      
      // Count unique user_ids using a Set
      const uniqueActiveUsers = new Set(activeUsers?.map(item => item.user_id) || []);
      const activeCount = uniqueActiveUsers.size;
      
      console.log('Active users count:', activeCount);
      
      // Get total words count
      const { count: wordsCount, error: wordsError } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });

      if (wordsError) throw new Error(`Error fetching words: ${wordsError.message}`);
      
      console.log('Total words count:', wordsCount);

      // Get counts from previous month for growth calculation
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: lastMonthUsersCount, error: lastMonthUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', lastMonth.toISOString());
      
      if (lastMonthUsersError) throw new Error(`Error fetching last month users: ${lastMonthUsersError.message}`);
      
      console.log('Last month users count:', lastMonthUsersCount);

      // Calculate percent changes for users
      let userChange;
      if (lastMonthUsersCount === 0) {
        userChange = usersCount > 0 ? '+100%' : '+0.0%';
      } else {
        userChange = `+${(((usersCount - lastMonthUsersCount) / lastMonthUsersCount) * 100).toFixed(1)}%`;
      }

      // For now, use placeholder values for other metrics until we have historical data
      setStats([
        { 
          title: 'Total Users', 
          value: String(usersCount || 0), 
          change: userChange, 
          trend: 'up', 
          icon: Users 
        },
        { 
          title: 'Pro Subscribers', 
          value: String(proCount || 0), 
          change: '+0.0%', // We don't have historical data yet
          trend: 'up', 
          icon: CreditCard 
        },
        { 
          title: 'Active Today', 
          value: String(activeCount || 0), 
          change: '+0.0%', // We don't have historical data yet
          trend: 'up', 
          icon: CalendarCheck 
        },
        { 
          title: 'Total Words', 
          value: String(wordsCount || 0), 
          change: '+0.0%', // We don't have historical data yet
          trend: 'up', 
          icon: BookOpen 
        },
      ]);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Key metrics and statistics for the vocabulary platform.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#2DCDA5]" />
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <h3 className="text-red-800 font-medium text-lg">Error loading data</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center space-x-1 text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart data will be implemented in a future update</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart data will be implemented in a future update</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;

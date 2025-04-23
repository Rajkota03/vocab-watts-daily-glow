
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, CreditCard, CalendarCheck, BookOpen,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Tooltip, Cell, XAxis, YAxis, Legend
} from 'recharts';

interface StatsData {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
}

const COLORS = ['#2DCDA5', '#D1D5DB']; // Green for pro, gray for free

const OverviewTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData[]>([
    { title: 'Total Users', value: '0', trend: 'up', icon: Users },
    { title: 'Pro Subscribers', value: '0', trend: 'up', icon: CreditCard },
    { title: 'Active Today', value: '0', trend: 'up', icon: CalendarCheck },
    { title: 'Total Words', value: '0', trend: 'up', icon: BookOpen },
  ]);
  const [error, setError] = useState<string | null>(null);

  const [userGrowth, setUserGrowth] = useState<{ date: string, count: number }[]>([]);
  const [subDist, setSubDist] = useState<{ name: string, value: number }[]>([]);

  useEffect(() => {
    fetchStats();
    fetchGrowthData();
    fetchSubscriptionDistribution();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { count: usersCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (profilesError) throw new Error(`Error fetching users: ${profilesError.message}`);

      const { data: proUsers, error: proError } = await supabase
        .from('user_subscriptions')
        .select('user_id, phone_number')
        .eq('is_pro', true);
      if (proError) throw new Error(`Error fetching pro users: ${proError.message}`);

      const uniqueProPhones = new Set(proUsers?.map(item => item.phone_number) || []);
      const proCount = uniqueProPhones.size;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: activeUsers, error: activeError } = await supabase
        .from('user_word_history')
        .select('user_id')
        .gt('date_sent', yesterday.toISOString());
      if (activeError) throw new Error(`Error fetching active users: ${activeError.message}`);

      const uniqueActiveUsers = new Set(activeUsers?.map(item => item.user_id) || []);
      const activeCount = uniqueActiveUsers.size;

      const { count: wordsCount, error: wordsError } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });
      if (wordsError) throw new Error(`Error fetching words: ${wordsError.message}`);

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: lastMonthUsersCount, error: lastMonthUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', lastMonth.toISOString());
      if (lastMonthUsersError) throw new Error(`Error fetching last month users: ${lastMonthUsersError.message}`);

      let userChange;
      if (lastMonthUsersCount === 0) {
        userChange = usersCount > 0 ? '+100%' : '+0.0%';
      } else {
        userChange = `+${(((usersCount - lastMonthUsersCount) / lastMonthUsersCount) * 100).toFixed(1)}%`;
      }

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
          change: '+0.0%',
          trend: 'up',
          icon: CreditCard
        },
        {
          title: 'Active Today',
          value: String(activeCount || 0),
          change: '+0.0%',
          trend: 'up',
          icon: CalendarCheck
        },
        {
          title: 'Total Words',
          value: String(wordsCount || 0),
          change: '+0.0%',
          trend: 'up',
          icon: BookOpen
        },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // User growth: group user signups by month (last 12 months) 
  const fetchGrowthData = async () => {
    // Get all users, group by month
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0,0,0,0);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at');
    if (!profiles) return;

    // Group counts by {month, year}
    const grouped: Record<string, number> = {};
    profiles.forEach((row) => {
      const d = new Date(row.created_at);
      if (d < since) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    // Prepare chart data and cumulative sum (growth)
    const chartData: {date: string, count: number}[] = [];
    let sum = 0;
    const months: string[] = [];
    for (let i=0; i<12; i++) {
      const dt = new Date(since);
      dt.setMonth(dt.getMonth() + i);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
    }
    months.forEach((k) => {
      sum += (grouped[k] || 0);
      chartData.push({ date: k, count: sum });
    });
    setUserGrowth(chartData);
  };

  // Subscription distribution: count pro vs free subscriptions
  const fetchSubscriptionDistribution = async () => {
    const { data: subs } = await supabase
      .from('user_subscriptions')
      .select('is_pro');
    let pro = 0, free = 0;
    (subs || []).forEach(x => {
      if (x.is_pro) pro++;
      else free++;
    });
    setSubDist([
      { name: 'Pro', value: pro },
      { name: 'Free', value: free }
    ]);
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

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Growth Line Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              {userGrowth.length === 0 ? (
                <p className="text-muted-foreground text-sm">No user signups yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={userGrowth}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Total Users" stroke="#2DCDA5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              {(subDist[0]?.value === 0 && subDist[1]?.value === 0) ? (
                <p className="text-muted-foreground text-sm">No subscription data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={subDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {subDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;


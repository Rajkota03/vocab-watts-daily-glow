
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Database } from '@/integrations/supabase/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EditSubscriptionDialog } from '../subscriptions/EditSubscriptionDialog';
import { Pencil, Loader2 } from 'lucide-react';

type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

interface Metric {
  name: string;
  value: string | number;
}

const SubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchSubscriptionsData();
  }, [refreshTrigger]);

  const fetchSubscriptionsData = async () => {
    try {
      setLoading(true);
      
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subsError) throw subsError;
      
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditDialogOpen(true);
  };

  const handleSubscriptionUpdated = () => {
    // Use a counter to trigger a refresh
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteSubscription = () => {
    // Use a counter to trigger a refresh
    setRefreshTrigger(prev => prev + 1);
    setSelectedSubscription(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Analytics</h2>
        <p className="text-muted-foreground">
          Track subscription metrics and conversion rates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="conversion" 
                    stroke="#2DCDA5" 
                    strokeWidth={2}
                    dot={{ fill: '#2DCDA5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">
                  {subscriptions.filter(s => s.is_pro).length} / {subscriptions.length}
                </p>
                <p className="text-sm text-muted-foreground">Pro Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading subscriptions...</p>
              </div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No subscriptions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Trial Ends</TableHead>
                    <TableHead>Subscription Ends</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-gray-50">
                      <TableCell>{sub.phone_number}</TableCell>
                      <TableCell>
                        <Badge className={
                          sub.is_pro 
                            ? 'bg-[#3F3D56]/10 text-[#3F3D56]' 
                            : 'bg-[#2DCDA5]/10 text-[#2DCDA5]'
                        }>
                          {sub.is_pro ? 'Pro' : 'Free Trial'}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.category || '—'}</TableCell>
                      <TableCell>{formatDate(sub.created_at)}</TableCell>
                      <TableCell>{formatDate(sub.trial_ends_at)}</TableCell>
                      <TableCell>{formatDate(sub.subscription_ends_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubscription(sub)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditSubscriptionDialog
        subscription={selectedSubscription}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        onDelete={handleDeleteSubscription}
      />
    </div>
  );
};

export default SubscriptionsTab;

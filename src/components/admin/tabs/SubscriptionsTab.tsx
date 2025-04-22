
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Database } from '@/integrations/supabase/types';

// Define types based on our database schema
type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];

// Mock conversion metrics
const metrics = [
  { name: 'Trial to Pro Conversion', value: '42%' },
  { name: 'Average Subscription Duration', value: '4.2 months' },
  { name: 'Monthly Recurring Revenue', value: '$12,845' },
  { name: 'Churn Rate', value: '5.3%' },
];

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const SubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Failed to load subscriptions",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSubscriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Analytics</h2>
        <p className="text-muted-foreground">
          Track subscription metrics and conversion rates.
        </p>
      </div>

      {/* Key Metrics */}
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

      {/* Analytics Visualization Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart placeholder - Conversion trends</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-muted-foreground text-sm">Chart placeholder - Subscription types</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-gray-50">
                      <TableCell>{sub.phone_number}</TableCell>
                      <TableCell>
                        <Badge className={
                          sub.is_pro 
                            ? 'bg-vocab-purple/10 text-vocab-purple' 
                            : 'bg-vocab-teal/10 text-vocab-teal'
                        }>
                          {sub.is_pro ? 'Pro' : 'Free Trial'}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.category || '—'}</TableCell>
                      <TableCell>{formatDate(sub.created_at)}</TableCell>
                      <TableCell>{formatDate(sub.trial_ends_at)}</TableCell>
                      <TableCell>{formatDate(sub.subscription_ends_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsTab;

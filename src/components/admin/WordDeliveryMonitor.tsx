import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryStats {
  date: string;
  messages_scheduled: number;
  sent_count: number;
  failed_count: number;
  queued_count: number;
}

interface UserDelivery {
  phone: string;
  first_name: string;
  category: string;
  is_pro: boolean;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  last_sent_at: string | null;
  total_messages: number;
  sent_count: number;
  failed_count: number;
  last_message_scheduled: string | null;
}

export function WordDeliveryMonitor() {
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats[]>([]);
  const [userDeliveries, setUserDeliveries] = useState<UserDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryStats = async () => {
    try {
      setLoading(true);
      
      // Get 7-day delivery statistics
      const { data: stats, error: statsError } = await supabase
        .from('outbox_messages')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (statsError) throw statsError;

      // Process stats by date
      const statsByDate: { [key: string]: DeliveryStats } = {};
      
      stats?.forEach(msg => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        if (!statsByDate[date]) {
          statsByDate[date] = {
            date,
            messages_scheduled: 0,
            sent_count: 0,
            failed_count: 0,
            queued_count: 0
          };
        }
        
        statsByDate[date].messages_scheduled++;
        if (msg.status === 'sent') statsByDate[date].sent_count++;
        if (msg.status === 'failed') statsByDate[date].failed_count++;
        if (msg.status === 'queued') statsByDate[date].queued_count++;
      });

      setDeliveryStats(Object.values(statsByDate).sort((a, b) => b.date.localeCompare(a.date)));

      // Get user delivery information
      const { data: userSubs, error: userError } = await supabase
        .from('user_subscriptions')
        .select('phone_number, first_name, category, is_pro, trial_ends_at, subscription_ends_at, last_sent_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (userError) throw userError;

      // Get recent message counts per user
      const { data: messageCounts, error: msgError } = await supabase
        .from('outbox_messages')
        .select('phone, status, created_at')
        .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

      if (msgError) throw msgError;

      // Process user delivery data
      const userDeliveryMap: { [phone: string]: any } = {};
      
      userSubs?.forEach(sub => {
        userDeliveryMap[sub.phone_number] = {
          ...sub,
          phone: sub.phone_number,
          total_messages: 0,
          sent_count: 0,
          failed_count: 0,
          last_message_scheduled: null
        };
      });

      messageCounts?.forEach(msg => {
        if (userDeliveryMap[msg.phone]) {
          userDeliveryMap[msg.phone].total_messages++;
          if (msg.status === 'sent') userDeliveryMap[msg.phone].sent_count++;
          if (msg.status === 'failed') userDeliveryMap[msg.phone].failed_count++;
          
          if (!userDeliveryMap[msg.phone].last_message_scheduled || 
              msg.created_at > userDeliveryMap[msg.phone].last_message_scheduled) {
            userDeliveryMap[msg.phone].last_message_scheduled = msg.created_at;
          }
        }
      });

      setUserDeliveries(Object.values(userDeliveryMap));

    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      toast.error('Failed to fetch delivery statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryStats();
    const interval = setInterval(fetchDeliveryStats, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getDeliveryStatusBadge = (user: UserDelivery) => {
    const now = new Date();
    const lastScheduled = user.last_message_scheduled ? new Date(user.last_message_scheduled) : null;
    const daysSinceLastMessage = lastScheduled ? 
      Math.floor((now.getTime() - lastScheduled.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (!lastScheduled || daysSinceLastMessage === null) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />No Messages</Badge>;
    }

    if (daysSinceLastMessage === 0) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Today</Badge>;
    }

    if (daysSinceLastMessage === 1) {
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Yesterday</Badge>;
    }

    if (daysSinceLastMessage >= 2) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{daysSinceLastMessage} days ago</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Word Delivery Monitor</h2>
        <Button 
          onClick={fetchDeliveryStats} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* 7-Day Overview */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Delivery Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {deliveryStats.map((stat) => (
              <Card key={stat.date} className="p-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">
                    {formatDate(stat.date)}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {stat.messages_scheduled}
                  </div>
                  <div className="flex justify-center gap-1 mt-2 text-xs">
                    <Badge variant="default" className="text-xs">
                      {stat.sent_count} sent
                    </Badge>
                    {stat.failed_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stat.failed_count} failed
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Delivery Status */}
      <Card>
        <CardHeader>
          <CardTitle>User Delivery Status (Last 3 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDeliveries.map((user) => (
                <TableRow key={user.phone}>
                  <TableCell className="font-medium">
                    {user.first_name || 'N/A'}
                    {user.is_pro && <Badge variant="secondary" className="ml-2">Pro</Badge>}
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.category}</TableCell>
                  <TableCell>{getDeliveryStatusBadge(user)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.total_messages} scheduled</div>
                      <div className="text-muted-foreground">
                        {user.sent_count} sent, {user.failed_count} failed
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.last_message_scheduled ? 
                      new Date(user.last_message_scheduled).toLocaleDateString() : 
                      'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
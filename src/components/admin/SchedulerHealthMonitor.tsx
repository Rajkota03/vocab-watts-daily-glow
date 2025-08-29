import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  TrendingDown,
  Users,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetrics {
  schedulerRunning: boolean;
  lastRunTime: string | null;
  queueSize: number;
  failureRate: number;
  usersCovered: number;
  totalUsers: number;
  issueCount: number;
}

interface HealthAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  action?: string;
}

const SchedulerHealthMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    schedulerRunning: false,
    lastRunTime: null,
    queueSize: 0,
    failureRate: 0,
    usersCovered: 0,
    totalUsers: 0,
    issueCount: 0
  });
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);

  useEffect(() => {
    fetchHealthMetrics();
    const interval = setInterval(fetchHealthMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHealthMetrics = async () => {
    try {
      setLoading(true);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Check if scheduler ran today
      const { data: schedulerRuns, error: runsError } = await supabase
        .from('outbox_messages')
        .select('created_at')
        .gte('created_at', `${today}T00:00:00Z`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (runsError) throw runsError;

      // Get queue size
      const { count: queueSize, error: queueError } = await supabase
        .from('outbox_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'queued');

      if (queueError) throw queueError;

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      if (usersError) throw usersError;

      // Get delivery stats for failure rate
      const { data: deliveryStats, error: deliveryError } = await supabase
        .from('whatsapp_message_status')
        .select('status')
        .gte('created_at', `${today}T00:00:00Z`);

      if (deliveryError) throw deliveryError;

      // Calculate metrics
      const schedulerRunning = schedulerRuns && schedulerRuns.length > 0;
      const lastRunTime = schedulerRuns?.[0]?.created_at || null;
      
      const totalDeliveries = deliveryStats?.length || 0;
      const failedDeliveries = deliveryStats?.filter(d => 
        ['failed', 'undelivered'].includes(d.status)
      ).length || 0;
      const failureRate = totalDeliveries > 0 ? (failedDeliveries / totalDeliveries) * 100 : 0;

      // Get users who got messages today
      const { data: usersWithMessages, error: usersMessagesError } = await supabase
        .from('outbox_messages')
        .select('user_id')
        .gte('created_at', `${today}T00:00:00Z`);

      if (usersMessagesError) throw usersMessagesError;

      const uniqueUsersCovered = new Set(
        usersWithMessages?.map(m => m.user_id).filter(Boolean) || []
      ).size;

      // Generate alerts
      const newAlerts: HealthAlert[] = [];
      let issueCount = 0;

      if (!schedulerRunning) {
        newAlerts.push({
          type: 'error',
          message: 'Daily scheduler has not run today',
          action: 'Trigger manual scheduler run'
        });
        issueCount++;
      }

      if ((queueSize || 0) > 100) {
        newAlerts.push({
          type: 'warning',
          message: `Large message queue: ${queueSize} pending messages`,
          action: 'Process outbox messages'
        });
        issueCount++;
      }

      if (failureRate > 20) {
        newAlerts.push({
          type: 'error',
          message: `High failure rate: ${failureRate.toFixed(1)}%`,
          action: 'Check WhatsApp configuration'
        });
        issueCount++;
      } else if (failureRate > 10) {
        newAlerts.push({
          type: 'warning',
          message: `Elevated failure rate: ${failureRate.toFixed(1)}%`,
          action: 'Monitor delivery patterns'
        });
        issueCount++;
      }

      if ((totalUsers || 0) > 0 && uniqueUsersCovered < (totalUsers || 0) * 0.8) {
        newAlerts.push({
          type: 'warning',
          message: `Low user coverage: ${uniqueUsersCovered}/${totalUsers} users`,
          action: 'Review user settings'
        });
        issueCount++;
      }

      setMetrics({
        schedulerRunning,
        lastRunTime,
        queueSize: queueSize || 0,
        failureRate,
        usersCovered: uniqueUsersCovered,
        totalUsers: totalUsers || 0,
        issueCount
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (metrics.issueCount === 0) return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (metrics.issueCount <= 2) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const health = getHealthStatus();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scheduler Health Monitor</span>
          <Button
            onClick={fetchHealthMetrics}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health Status */}
        <div className={`p-4 rounded-lg ${health.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {health.status === 'healthy' ? (
                <CheckCircle className={`h-5 w-5 ${health.color}`} />
              ) : (
                <AlertTriangle className={`h-5 w-5 ${health.color}`} />
              )}
              <span className={`font-medium ${health.color}`}>
                Scheduler Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
              </span>
            </div>
            <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
              {metrics.issueCount} issues
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.queueSize}</div>
            <div className="text-sm text-muted-foreground">Queued Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.failureRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Failure Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.usersCovered}</div>
            <div className="text-sm text-muted-foreground">Users Covered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {metrics.lastRunTime ? new Date(metrics.lastRunTime).toLocaleTimeString() : 'Never'}
            </div>
            <div className="text-sm text-muted-foreground">Last Run</div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Alerts:</h4>
            {alerts.map((alert, index) => (
              <Alert key={index} className={`border-l-4 ${
                alert.type === 'error' ? 'border-red-500' : 
                alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <span>{alert.message}</span>
                    {alert.action && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {alert.action}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">
            Auto-refresh every minute • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulerHealthMonitor;
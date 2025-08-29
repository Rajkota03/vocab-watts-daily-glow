import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  AlertCircle, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  Settings,
  TrendingUp,
  Activity,
  Wrench,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import SchedulerHealthMonitor from '../SchedulerHealthMonitor';

interface SchedulerStats {
  totalUsers: number;
  scheduledToday: number;
  deliveredToday: number;
  failedToday: number;
  pendingMessages: number;
  lastRunTime: string | null;
  nextRunTime: string;
}

interface SchedulerHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

const SchedulerTab = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<SchedulerStats>({
    totalUsers: 0,
    scheduledToday: 0,
    deliveredToday: 0,
    failedToday: 0,
    pendingMessages: 0,
    lastRunTime: null,
    nextRunTime: 'Next run at 00:00 UTC'
  });
  const [health, setHealth] = useState<SchedulerHealth>({
    status: 'healthy',
    issues: [],
    recommendations: []
  });

  useEffect(() => {
    fetchSchedulerData();
    const interval = setInterval(fetchSchedulerData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSchedulerData = async () => {
    try {
      setRefreshing(true);
      
      // Get total active users
      const { count: activeUsersCount, error: usersError } = await supabase
        .from('user_subscriptions')
        .select('user_id', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      if (usersError) throw usersError;

      // Get today's outbox messages
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMessages, error: messagesError } = await supabase
        .from('outbox_messages')
        .select('status, created_at')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (messagesError) throw messagesError;

      // Get pending messages
      const { count: pendingMessagesCount, error: pendingError } = await supabase
        .from('outbox_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'queued');

      if (pendingError) throw pendingError;

      // Get delivery status from today
      const { data: deliveryStatus, error: deliveryError } = await supabase
        .from('whatsapp_message_status')
        .select('status, created_at')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (deliveryError) throw deliveryError;

      const scheduledToday = todayMessages?.length || 0;
      const deliveredToday = deliveryStatus?.filter(msg => 
        ['delivered', 'read'].includes(msg.status)
      ).length || 0;
      const failedToday = deliveryStatus?.filter(msg => 
        ['failed', 'undelivered'].includes(msg.status)
      ).length || 0;

      setStats({
        totalUsers: activeUsersCount || 0,
        scheduledToday,
        deliveredToday,
        failedToday,
        pendingMessages: pendingMessagesCount || 0,
        lastRunTime: todayMessages?.[0]?.created_at || null,
        nextRunTime: 'Next run at 00:00 UTC (Daily)'
      });

      // Assess scheduler health
      assessSchedulerHealth(stats);
    } catch (error) {
      console.error('Error fetching scheduler data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduler data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const assessSchedulerHealth = (currentStats: SchedulerStats) => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check for high failure rate
    const totalDeliveryAttempts = currentStats.deliveredToday + currentStats.failedToday;
    if (totalDeliveryAttempts > 0) {
      const failureRate = (currentStats.failedToday / totalDeliveryAttempts) * 100;
      if (failureRate > 20) {
        status = 'critical';
        issues.push(`High failure rate: ${failureRate.toFixed(1)}%`);
        recommendations.push('Check WhatsApp configuration and provider status');
      } else if (failureRate > 10) {
        status = 'warning';
        issues.push(`Elevated failure rate: ${failureRate.toFixed(1)}%`);
        recommendations.push('Monitor delivery patterns closely');
      }
    }

    // Check for large pending queue
    if (currentStats.pendingMessages > 100) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push(`Large pending queue: ${currentStats.pendingMessages} messages`);
      recommendations.push('Consider manual processing or investigate delays');
    }

    // Check if scheduler ran today
    if (!currentStats.lastRunTime) {
      status = 'critical';
      issues.push('Scheduler has not run today');
      recommendations.push('Manually trigger scheduler or check cron job status');
    }

    // Check for low scheduling vs active users
    if (currentStats.totalUsers > 0 && currentStats.scheduledToday < currentStats.totalUsers * 0.8) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('Low scheduling rate compared to active users');
      recommendations.push('Review user delivery settings and subscription status');
    }

    setHealth({ status, issues, recommendations });
  };

  const triggerDailyScheduler = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('daily-scheduler', {
        body: { manual_trigger: true }
      });

      if (error) throw error;

      toast({
        title: "Scheduler Triggered",
        description: "Daily scheduler has been manually triggered successfully",
      });

      // Refresh data after trigger
      setTimeout(fetchSchedulerData, 2000);
    } catch (error) {
      console.error('Error triggering scheduler:', error);
      toast({
        title: "Error",
        description: "Failed to trigger daily scheduler",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processOutboxMessages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('outbox-processor', {
        body: { manual_trigger: true }
      });

      if (error) throw error;

      toast({
        title: "Outbox Processor Triggered",
        description: "Message processing has been triggered successfully",
      });

      // Refresh data after processing
      setTimeout(fetchSchedulerData, 2000);
    } catch (error) {
      console.error('Error processing outbox:', error);
      toast({
        title: "Error",
        description: "Failed to process outbox messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDeliveryRate = () => {
    const total = stats.deliveredToday + stats.failedToday;
    return total > 0 ? ((stats.deliveredToday / total) * 100).toFixed(1) : '0';
  };

  const repairInvalidDates = async () => {
    try {
      setLoading(true);
      
      // Fix invalid subscription dates
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trial_ends_at: null
        })
        .is('subscription_ends_at', null)
        .eq('is_pro', true);

      if (error) throw error;

      toast({
        title: "Date Repair Complete",
        description: "Fixed invalid subscription dates",
      });

      setTimeout(fetchSchedulerData, 1000);
    } catch (error) {
      console.error('Error repairing dates:', error);
      toast({
        title: "Error",
        description: "Failed to repair invalid dates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const repairDeliverySettings = async () => {
    try {
      setLoading(true);
      
      // Get users without delivery settings
      const { data: usersWithoutSettings, error: usersError } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .not('user_id', 'is', null);

      if (usersError) throw usersError;

      if (usersWithoutSettings) {
        for (const user of usersWithoutSettings) {
          await supabase
            .from('user_delivery_settings')
            .upsert({
              user_id: user.user_id,
              mode: 'auto',
              words_per_day: 3,
              auto_window_start: '09:00:00',
              auto_window_end: '21:00:00',
              timezone: 'UTC'
            }, { onConflict: 'user_id' });
        }
      }

      toast({
        title: "Settings Repair Complete",
        description: `Created delivery settings for ${usersWithoutSettings?.length || 0} users`,
      });

      setTimeout(fetchSchedulerData, 1000);
    } catch (error) {
      console.error('Error repairing settings:', error);
      toast({
        title: "Error",
        description: "Failed to repair delivery settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Remove subscriptions with invalid user_ids
      const { data, error } = await supabase
        .from('user_subscriptions')
        .delete()
        .is('phone_number', null);

      if (error) throw error;

      toast({
        title: "Validation Complete",
        description: "Cleaned invalid subscription records",
      });

      setTimeout(fetchSchedulerData, 1000);
    } catch (error) {
      console.error('Error validating subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to validate subscriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const emergencyReschedule = async () => {
    try {
      setLoading(true);
      
      // Clear today's failed outbox messages and retrigger scheduler
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('outbox_messages')
        .delete()
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`)
        .eq('status', 'failed');

      // Trigger scheduler
      const { error } = await supabase.functions.invoke('daily-scheduler', {
        body: { manual_trigger: true, emergency: true }
      });

      if (error) throw error;

      toast({
        title: "Emergency Reschedule Complete",
        description: "Cleared failed messages and retrigggered scheduler",
      });

      setTimeout(fetchSchedulerData, 2000);
    } catch (error) {
      console.error('Error in emergency reschedule:', error);
      toast({
        title: "Error",
        description: "Failed to perform emergency reschedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Scheduler Control</h2>
          <p className="text-muted-foreground">
            Monitor and manage the daily vocabulary message scheduler
          </p>
        </div>
        <Button
          onClick={fetchSchedulerData}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Health Monitor */}
      <SchedulerHealthMonitor />

      {/* Health Status Alert */}
      {health.status !== 'healthy' && (
        <Alert className={`border-l-4 ${health.status === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                Scheduler Status: {health.status === 'critical' ? 'Critical Issues Detected' : 'Warnings'}
              </p>
              {health.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Issues:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {health.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {health.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Recommendations:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {health.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Scheduler Health</CardTitle>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health.status}</div>
            <p className="text-xs text-muted-foreground">
              {health.issues.length} issues detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Subscribed users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledToday}</div>
            <p className="text-xs text-muted-foreground">
              Messages scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDeliveryRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveredToday}</div>
            <Progress 
              value={stats.deliveredToday + stats.failedToday > 0 ? (stats.deliveredToday / (stats.deliveredToday + stats.failedToday)) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedToday}</div>
            <Progress 
              value={stats.deliveredToday + stats.failedToday > 0 ? (stats.failedToday / (stats.deliveredToday + stats.failedToday)) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingMessages}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Manual Scheduler Trigger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manually trigger the daily scheduler to create today's message schedule for all active users.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Last run: {stats.lastRunTime ? new Date(stats.lastRunTime).toLocaleString() : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.nextRunTime}
              </p>
            </div>
            <Button
              onClick={triggerDailyScheduler}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Trigger Daily Scheduler
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Process Pending Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Process all pending messages in the outbox queue. This sends scheduled messages via WhatsApp.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={stats.pendingMessages > 50 ? "destructive" : stats.pendingMessages > 10 ? "secondary" : "default"}>
                {stats.pendingMessages} pending
              </Badge>
              <span className="text-xs text-muted-foreground">messages in queue</span>
            </div>
            <Button
              onClick={processOutboxMessages}
              disabled={loading || stats.pendingMessages === 0}
              className="w-full"
              variant={stats.pendingMessages > 0 ? "default" : "secondary"}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Process Outbox ({stats.pendingMessages})
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Health Repair Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <h3 className="text-xl font-semibold">Health Repair Controls</h3>
          <Badge variant="outline">Auto-Fix Issues</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-600" />
                Fix Invalid Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Repair subscription dates causing scheduler errors
              </p>
              <Button
                onClick={repairInvalidDates}
                disabled={loading}
                size="sm"
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Database className="mr-2 h-3 w-3" />
                    Repair Dates
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Fix Delivery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Create missing user delivery configurations
              </p>
              <Button
                onClick={repairDeliverySettings}
                disabled={loading}
                size="sm"
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Settings className="mr-2 h-3 w-3" />
                    Repair Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Validate Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Clean invalid or corrupted subscription records
              </p>
              <Button
                onClick={validateSubscriptions}
                disabled={loading}
                size="sm"
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Shield className="mr-2 h-3 w-3" />
                    Validate Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-red-600" />
                Emergency Reschedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Clear failed messages and restart scheduling
              </p>
              <Button
                onClick={emergencyReschedule}
                disabled={loading}
                size="sm"
                className="w-full"
                variant="destructive"
              >
                {loading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Zap className="mr-2 h-3 w-3" />
                    Emergency Fix
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm font-medium">Health Repair Guide:</p>
            <ul className="text-sm mt-1 space-y-1">
              <li><strong>Fix Invalid Dates:</strong> Resolves "Invalid time value" errors by setting proper subscription end dates</li>
              <li><strong>Fix Delivery Settings:</strong> Creates default delivery preferences for users without settings</li>
              <li><strong>Validate Subscriptions:</strong> Removes corrupted subscription records that cause processing failures</li>
              <li><strong>Emergency Reschedule:</strong> Nuclear option - clears today's failed messages and restarts the entire process</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Scheduler Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Scheduler Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">How the Daily Scheduler Works:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Runs automatically every day at 00:00 UTC</li>
                <li>• Creates message schedules for all active users</li>
                <li>• Respects user delivery preferences and quiet hours</li>
                <li>• Generates new vocabulary words if needed</li>
                <li>• Sends admin notification with results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Check user delivery settings if scheduling is low</li>
                <li>• Verify WhatsApp configuration for delivery issues</li>
                <li>• Monitor OpenAI API balance for word generation</li>
                <li>• Review user subscription status if users are skipped</li>
                <li>• Check database constraints for data integrity issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulerTab;
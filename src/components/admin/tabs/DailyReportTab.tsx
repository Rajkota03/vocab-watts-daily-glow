import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Search, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyReportData {
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  category: string;
  scheduled_words: number;
  delivery_times: string[];
  scheduled_messages: number;
  sent_messages: number;
  delivered_messages: number;
  failed_messages: number;
  last_activity: string;
}

const DailyReportTab = () => {
  const [reportData, setReportData] = useState<DailyReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      
      // Get date range for the selected day
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      // Fetch user subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select(`
          user_id,
          first_name,
          last_name,
          phone_number,
          email,
          category
        `)
        .eq('is_pro', true)
        .or(`subscription_ends_at.is.null,subscription_ends_at.gt.${new Date().toISOString()}`);

      if (subsError) throw subsError;

      // Fetch delivery settings
      const { data: deliverySettings, error: deliveryError } = await supabase
        .from('user_delivery_settings')
        .select('user_id, words_per_day, auto_window_start, auto_window_end, timezone');

      if (deliveryError) throw deliveryError;

      // Fetch outbox messages for the selected date
      const { data: outboxMessages, error: outboxError } = await supabase
        .from('outbox_messages')
        .select('user_id, phone, status, send_at')
        .gte('send_at', startDate.toISOString())
        .lte('send_at', endDate.toISOString());

      if (outboxError) throw outboxError;

      // Fetch WhatsApp message status for delivery confirmation
      const { data: messageStatus, error: statusError } = await supabase
        .from('whatsapp_message_status')
        .select('to_number, status, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (statusError) throw statusError;

      // Process and combine the data
      const reportMap = new Map<string, DailyReportData>();

      // Create a map of delivery settings by user_id
      const deliverySettingsMap = new Map();
      deliverySettings?.forEach(setting => {
        deliverySettingsMap.set(setting.user_id, setting);
      });

      // Initialize with subscription data
      subscriptions?.forEach(sub => {
        const key = sub.user_id || sub.phone_number;
        const userDeliverySettings = deliverySettingsMap.get(sub.user_id);
        
        // Calculate delivery times based on words per day and window
        const deliveryTimes: string[] = [];
        if (userDeliverySettings && userDeliverySettings.words_per_day > 0) {
          const startTime = userDeliverySettings.auto_window_start || '09:00:00';
          const endTime = userDeliverySettings.auto_window_end || '21:00:00';
          
          // Simple calculation for evenly spaced delivery times
          for (let i = 0; i < userDeliverySettings.words_per_day; i++) {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
            const interval = totalMinutes / (userDeliverySettings.words_per_day || 1);
            const deliveryMinutes = startHour * 60 + startMin + (interval * i);
            const hours = Math.floor(deliveryMinutes / 60);
            const minutes = Math.floor(deliveryMinutes % 60);
            deliveryTimes.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
          }
        }

        reportMap.set(key, {
          user_id: sub.user_id || '',
          first_name: sub.first_name || '',
          last_name: sub.last_name || '',
          phone_number: sub.phone_number,
          email: sub.email || '',
          category: sub.category || '',
          scheduled_words: userDeliverySettings?.words_per_day || 0,
          delivery_times: deliveryTimes,
          scheduled_messages: 0,
          sent_messages: 0,
          delivered_messages: 0,
          failed_messages: 0,
          last_activity: ''
        });
      });

      // Add outbox message data
      outboxMessages?.forEach(msg => {
        const key = msg.user_id || msg.phone;
        const existing = reportMap.get(key);
        if (existing) {
          existing.scheduled_messages++;
          if (msg.status === 'sent' || msg.status === 'sending') {
            existing.sent_messages++;
          }
          if (msg.status === 'failed') {
            existing.failed_messages++;
          }
          if (!existing.last_activity || msg.send_at > existing.last_activity) {
            existing.last_activity = msg.send_at;
          }
        }
      });

      // Add delivery status data
      messageStatus?.forEach(status => {
        const existing = Array.from(reportMap.values()).find(r => r.phone_number === status.to_number);
        if (existing) {
          if (status.status === 'delivered') {
            existing.delivered_messages++;
          }
        }
      });

      setReportData(Array.from(reportMap.values()));
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast({
        title: "Error",
        description: "Failed to fetch daily report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const filteredData = reportData.filter(item =>
    item.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone_number?.includes(searchTerm) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDeliveryStatusBadge = (item: DailyReportData) => {
    const totalScheduled = item.scheduled_messages;
    const delivered = item.delivered_messages;
    const failed = item.failed_messages;
    
    if (totalScheduled === 0) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />No Messages</Badge>;
    }
    
    if (delivered === totalScheduled) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />All Delivered</Badge>;
    }
    
    if (failed > 0) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Some Failed</Badge>;
    }
    
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Delivery Report</h2>
          <p className="text-gray-600">Track user message deliveries and schedules</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Button onClick={fetchDailyReport} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading report data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Scheduled Words</TableHead>
                    <TableHead>Delivery Times</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No data found for the selected date
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.first_name} {item.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{item.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{item.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.scheduled_words}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.delivery_times.map((time, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1 text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Scheduled:</span>
                              <span>{item.scheduled_messages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sent:</span>
                              <span>{item.sent_messages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivered:</span>
                              <span>{item.delivered_messages}</span>
                            </div>
                            {item.failed_messages > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Failed:</span>
                                <span>{item.failed_messages}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getDeliveryStatusBadge(item)}</TableCell>
                        <TableCell>
                          {item.last_activity ? (
                            <div className="text-sm">
                              {new Date(item.last_activity).toLocaleTimeString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">No activity</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.reduce((sum, item) => sum + item.scheduled_messages, 0)}
                </div>
                <div className="text-sm text-gray-600">Scheduled Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredData.reduce((sum, item) => sum + item.delivered_messages, 0)}
                </div>
                <div className="text-sm text-gray-600">Delivered Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.reduce((sum, item) => sum + item.failed_messages, 0)}
                </div>
                <div className="text-sm text-gray-600">Failed Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyReportTab;
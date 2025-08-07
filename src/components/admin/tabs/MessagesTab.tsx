
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import BulkMessageSender from '../BulkMessageSender';

interface ScheduledMessage {
  id: string;
  phone_number: string;
  message: string | null;
  category: string | null;
  scheduled_time: string;
  status: string;
  is_pro: boolean;
  created_at: string;
}

const statusColors = {
  pending: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const MessagesTab = () => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching scheduled messages:', error);
        toast({
          title: "Failed to load messages",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load scheduled messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Message status changed to ${status}.`,
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Update failed",
        description: "Could not update message status",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMessages = messages.filter(message => 
    message.phone_number.includes(searchQuery) ||
    (message.category?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (message.message?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Message Center</h2>
        <p className="text-muted-foreground">
          Manage scheduled messages and delivery status.
        </p>
      </div>
      
      {/* Bulk Message Sender */}
      <BulkMessageSender />
      {/* Delivery Report - last 24h */}
      <DeliveryReport />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Message Queue</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchMessages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by phone, category, or message content..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">No scheduled messages found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>{message.phone_number}</TableCell>
                      <TableCell>
                        {message.category ? (
                          <Badge variant="outline">{message.category}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(message.scheduled_time)}</TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[message.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                        >
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {message.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateMessageStatus(message.id, 'sent')}
                              >
                                Mark Sent
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateMessageStatus(message.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {message.status === 'failed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateMessageStatus(message.id, 'pending')}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
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

export default MessagesTab;

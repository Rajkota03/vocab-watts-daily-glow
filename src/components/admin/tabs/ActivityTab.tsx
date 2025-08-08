
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WordHistory {
  id: string;
  user_id: string;
  word: string;
  word_id: string;
  category: string;
  date_sent: string;
  source: string;
}

const ActivityTab = () => {
  const [activityLogs, setActivityLogs] = useState<WordHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_word_history')
        .select('*')
        .order('date_sent', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching activity logs:', error);
        toast({
          title: "Failed to load activity data",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setActivityLogs(data || []);
      }
    } catch (error) {
      console.error('Error in fetchActivityLogs:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load activity logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const filteredLogs = activityLogs.filter(log => 
    log.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Monitoring</h2>
        <p className="text-muted-foreground">
          Track user engagement and platform activity.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>User Activity Log</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchActivityLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by word, category, or user ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading activity data...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">No activity logs found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Word</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {formatDateTime(log.date_sent)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{log.word}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.source}</Badge>
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

export default ActivityTab;

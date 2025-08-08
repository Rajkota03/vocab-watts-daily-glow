import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_pro: boolean;
  category: string | null;
  created_at: string;
  last_active: string;
}
const COLORS = ["#80cbb6", "#fde047", "#38bdf8", "#fca5a5", "#b8b8ff", "#fdba74"];
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const groupUsersByMonth = (users: User[]) => {
  const map = new Map();
  users.forEach(user => {
    const month = user.created_at.slice(0, 7);
    map.set(month, (map.get(month) || 0) + 1);
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({
    month,
    count
  }));
};
const getSubscriptionDistribution = (users: User[]) => {
  let pro = 0,
    free = 0;
  users.forEach(user => user.is_pro ? pro++ : free++);
  return [{
    name: 'Pro',
    value: pro
  }, {
    name: 'Free',
    value: free
  }];
};
const UserManagementTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const {
        data: profiles,
        error: profilesError
      } = await supabase.from('profiles').select('*');
      if (profilesError) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const {
        data: subs
      } = await supabase.from('user_subscriptions').select('*');
      const {
        data: activities
      } = await supabase.from('user_word_history').select('user_id, date_sent').order('date_sent', {
        ascending: false
      });
      const subscriptionMap = new Map();
      subs?.forEach(sub => {
        subscriptionMap.set(sub.user_id, {
          is_pro: sub.is_pro,
          category: sub.category
        });
      });
      const latestActivityMap = new Map();
      activities?.forEach(activity => {
        if (!latestActivityMap.has(activity.user_id) || new Date(activity.date_sent) > new Date(latestActivityMap.get(activity.user_id))) {
          latestActivityMap.set(activity.user_id, activity.date_sent);
        }
      });
      const usersData: User[] = profiles?.map(profile => {
        const subscription = subscriptionMap.get(profile.id) || {
          is_pro: false,
          category: 'none'
        };
        const lastActive = latestActivityMap.get(profile.id) || profile.created_at;
        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          is_pro: subscription.is_pro,
          category: subscription.category,
          created_at: profile.created_at,
          last_active: lastActive
        };
      }) || [];
      setUsers(usersData);
      setLoading(false);
    };
    fetchUsers();
  }, []);
  const filteredUsers = users.filter(user => `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || (user.category || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const userGrowthData = groupUsersByMonth(users);
  const subscriptionData = getSubscriptionDistribution(users);
  const handleSendTestEmailAll = async () => {
    if (sending) return;
    setSending(true);
    try {
      const emailList = users.map(u => u.email);
      const categories = users.map(u => u.category || "business-intermediate");
      for (let i = 0; i < users.length; i++) {
        const res = await supabase.functions.invoke('send-vocab-email', {
          body: {
            email: users[i].email,
            category: users[i].category || "business-intermediate",
            wordCount: 5,
            force_new_words: true,
            user_id: users[i].id
          }
        });
        if (res.error) {
          toast({
            title: `Error sending email to ${users[i].email}`,
            description: res.error?.message,
            variant: "destructive"
          });
        }
      }
      toast({
        title: "Test Email Sent!",
        description: "A test vocab email has been sent to ALL user emails."
      });
    } catch (err: any) {
      toast({
        title: "Failed to Send Email",
        description: err.message || "",
        variant: "destructive"
      });
    }
    setSending(false);
  };
  const handleSendWhatsAppAll = async () => {
    if (sending) return;
    setSending(true);
    try {
      const {
        data: subs
      } = await supabase.from('user_subscriptions').select('user_id, phone_number, category');
      const subMap = new Map();
      subs?.forEach(sub => {
        subMap.set(sub.user_id, {
          phone_number: sub.phone_number,
          category: sub.category
        });
      });
      for (let user of users) {
        const sub = subMap.get(user.id);
        if (!sub?.phone_number) continue;
        const res = await supabase.functions.invoke('send-whatsapp', {
          body: {
            to: sub.phone_number,
            category: sub.category || "business-intermediate",
            isPro: user.is_pro,
            skipSubscriptionCheck: true,
            userId: user.id
          }
        });
        if (res.error) {
          toast({
            title: `Error sending WhatsApp to ${user.first_name}`,
            description: res.error?.message,
            variant: "destructive"
          });
        }
      }
      toast({
        title: "Test WhatsApp Sent!",
        description: "Test WhatsApp vocab words have been sent to all users who have numbers."
      });
    } catch (err: any) {
      toast({
        title: "Failed to Send WhatsApp",
        description: err.message || "",
        variant: "destructive"
      });
    }
    setSending(false);
  };
  return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage and monitor user accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        
      </div>

      

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by name, email, or category..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="rounded-md border overflow-hidden">
            {loading ? <div className="py-16 text-center text-muted-foreground">Loading users...</div> : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_pro ? 'bg-vuilder-mint/10 text-vuilder-mint hover:bg-vuilder-mint/20 hover:text-vuilder-mint' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'}>
                          {user.is_pro ? 'Pro' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={user.category || ""}>
                          {user.category}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{formatDate(user.last_active)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default UserManagementTab;

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserGrowthReport from './analytics/UserGrowthReport';
import RevenueDashboard from './analytics/RevenueDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminAnalyticsContent = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTestEmail = async () => {
    if (sending) return;
    if (testEmail && !testEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      if (testEmail) {
        // Send to specific email
        const res = await supabase.functions.invoke('send-vocab-email', {
          body: {
            email: testEmail,
            category: "business-intermediate",
            wordCount: 5,
            force_new_words: true
          }
        });
        
        if (res.error) {
          throw new Error(res.error.message);
        }
        
        toast({
          title: "Test Email Sent!",
          description: `A test vocab email has been sent to ${testEmail}.`,
        });
      } else {
        // Send to all users
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, first_name');
          
        if (error) throw new Error(error.message);
        
        for (const profile of profiles || []) {
          await supabase.functions.invoke('send-vocab-email', {
            body: {
              email: profile.email,
              category: "business-intermediate",
              wordCount: 5,
              force_new_words: true,
              user_id: profile.id
            }
          });
        }
        
        toast({
          title: "Test Emails Sent!",
          description: `Test vocab emails have been sent to all ${profiles?.length || 0} users.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to Send Email",
        description: err.message || "An error occurred while sending the email",
        variant: "destructive"
      });
    }
    setSending(false);
  };

  const handleSendTestWhatsApp = async () => {
    if (sending) return;
    if (testPhone && testPhone.length < 6) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      if (testPhone) {
        // Send to specific phone number
        const res = await supabase.functions.invoke('send-whatsapp', {
          body: {
            to: testPhone,
            category: "business-intermediate",
            isPro: true,
            skipSubscriptionCheck: true
          }
        });
        
        if (res.error) {
          throw new Error(res.error.message);
        }
        
        toast({
          title: "Test WhatsApp Sent!",
          description: `A test WhatsApp message has been sent to ${testPhone}.`,
        });
      } else {
        // Send to all users with phone numbers
        const { data: subs, error } = await supabase
          .from('user_subscriptions')
          .select('user_id, phone_number, category');
          
        if (error) throw new Error(error.message);
        
        let sentCount = 0;
        for (const sub of subs || []) {
          if (sub.phone_number) {
            await supabase.functions.invoke('send-whatsapp', {
              body: {
                to: sub.phone_number,
                category: sub.category || "business-intermediate",
                isPro: true,
                skipSubscriptionCheck: true,
                userId: sub.user_id
              }
            });
            sentCount++;
          }
        }
        
        toast({
          title: "Test WhatsApp Messages Sent!",
          description: `Test WhatsApp messages have been sent to ${sentCount} users with phone numbers.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to Send WhatsApp",
        description: err.message || "An error occurred while sending the WhatsApp message",
        variant: "destructive"
      });
    }
    setSending(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-vuilder-indigo">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">View and analyze user growth and platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input 
                  placeholder="Enter test email address (optional)" 
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendTestEmail}
                disabled={sending}
                className="flex items-center gap-2 bg-vuilder-mint text-white"
              >
                <Mail className="h-4 w-4" />
                {testEmail ? 'Send Test Email' : 'Send to All Users'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {testEmail 
                ? "Send a test vocabulary email to the specified address" 
                : "Leave blank to send test emails to all registered users"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input 
                  placeholder="Enter WhatsApp number with country code" 
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendTestWhatsApp}
                disabled={sending}
                className="flex items-center gap-2 bg-green-500 text-white"
              >
                <MessageSquare className="h-4 w-4" />
                {testPhone ? 'Send Test WhatsApp' : 'Send to All Users'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {testPhone 
                ? "Send a test WhatsApp message to the specified number (include country code)" 
                : "Leave blank to send test WhatsApp messages to all users with registered numbers"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement" disabled>Engagement</TabsTrigger>
          <TabsTrigger value="retention" disabled>Retention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth" className="focus-visible:outline-none focus-visible:ring-0">
          <UserGrowthReport />
        </TabsContent>
        
        <TabsContent value="revenue">
          <RevenueDashboard />
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="p-8 border rounded-lg bg-white shadow-sm">
            <p className="text-gray-500">Engagement metrics coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="retention">
          <div className="p-8 border rounded-lg bg-white shadow-sm">
            <p className="text-gray-500">Retention metrics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsContent;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkMessageResult {
  success: number;
  failed: number;
  errors: string[];
}

const BulkMessageSender = () => {
  const [category, setCategory] = useState<string>('');
  const [provider, setProvider] = useState<'twilio' | 'aisensy'>('aisensy');
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [result, setResult] = useState<BulkMessageResult | null>(null);

  // Available categories for bulk messaging
  const categories = [
    'daily-beginner',
    'daily-intermediate', 
    'daily-advanced',
    'business-beginner',
    'business-intermediate',
    'business-advanced',
    'gre',
    'ielts',
    'toefl',
    'cat',
    'gmat',
    'standardized',
    'general',
    'interview',
    'eloquent',
    'expressive'
  ];

  const fetchUserCount = async (selectedCategory: string) => {
    try {
      const { count, error } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('category', selectedCategory)
        .not('phone_number', 'is', null);

      if (error) {
        console.error('Error fetching user count:', error);
        return;
      }

      setUserCount(count || 0);
    } catch (error) {
      console.error('Error in fetchUserCount:', error);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setResult(null);
    fetchUserCount(selectedCategory);
  };

  const sendBulkMessages = async () => {
    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a category before sending messages.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First, get all users for the selected category
      const { data: users, error: usersError } = await supabase
        .from('user_subscriptions')
        .select('phone_number, is_pro, first_name, last_name')
        .eq('category', category)
        .not('phone_number', 'is', null);

      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      if (!users || users.length === 0) {
        toast({
          title: "No Users Found",
          description: `No users found for category: ${category}`,
          variant: "destructive"
        });
        return;
      }

      console.log(`Sending bulk messages to ${users.length} users in category: ${category}`);

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Send messages to each user
      for (const user of users) {
        try {
          const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              to: user.phone_number,
              category: category,
              isPro: user.is_pro,
              sendImmediately: true,
              provider: provider,
              message: `📚 Your Daily Vocabulary Words (${category}) - Admin Broadcast\n\nHello ${user.first_name || 'there'}! Here are your vocabulary words for today.`
            }
          });

          if (error) {
            failedCount++;
            errors.push(`${user.phone_number}: ${error.message}`);
            console.error(`Failed to send to ${user.phone_number}:`, error);
          } else if (data?.success) {
            successCount++;
            console.log(`Successfully sent to ${user.phone_number}`);
          } else {
            failedCount++;
            errors.push(`${user.phone_number}: ${data?.error || 'Unknown error'}`);
          }

          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          failedCount++;
          errors.push(`${user.phone_number}: ${error.message}`);
          console.error(`Error sending to ${user.phone_number}:`, error);
        }
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

      toast({
        title: "Bulk Message Complete",
        description: `Sent: ${successCount}, Failed: ${failedCount}`,
      });

    } catch (error: any) {
      console.error('Error in bulk message sending:', error);
      toast({
        title: "Bulk Message Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Message Sender
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send vocabulary words to all users in a specific category
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <Select value={provider} onValueChange={(value: 'twilio' | 'aisensy') => setProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aisensy">AiSensy</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {userCount !== null && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Target Users</AlertTitle>
            <AlertDescription>
              {userCount} users will receive messages for category: <Badge variant="outline">{category}</Badge>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={sendBulkMessages}
          disabled={!category || loading || userCount === 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Messages...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to {userCount || 0} Users
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.failed > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
            {result.failed > 0 ? (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle>Bulk Message Results</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex gap-4">
                  <span className="text-green-600">✓ Success: {result.success}</span>
                  <span className="text-red-600">✗ Failed: {result.failed}</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm">Recent Errors:</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="truncate">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkMessageSender;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';

interface AppSettingsForm {
  sendingFrequency: string;
  welcomeMessage: string;
  systemEnabled: boolean;
}

interface NotificationSettingsForm {
  adminEmail: string;
  errorNotifications: boolean;
  userSignupNotifications: boolean;
}

const SettingsTab = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  const appSettingsForm = useForm<AppSettingsForm>({
    defaultValues: {
      sendingFrequency: '24',
      welcomeMessage: 'Welcome to VocabBuilder! You will receive daily vocabulary words to help expand your knowledge.',
      systemEnabled: true,
    },
  });

  const notificationSettingsForm = useForm<NotificationSettingsForm>({
    defaultValues: {
      adminEmail: 'admin@example.com',
      errorNotifications: true,
      userSignupNotifications: true,
    },
  });

  const handleSaveAppSettings = (data: AppSettingsForm) => {
    console.log('App settings saved:', data);
    toast({
      title: "Settings saved",
      description: "Application settings have been updated successfully.",
    });
  };

  const handleSaveNotificationSettings = (data: NotificationSettingsForm) => {
    console.log('Notification settings saved:', data);
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure platform settings and defaults.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure global application settings and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appSettingsForm}>
                <form onSubmit={appSettingsForm.handleSubmit(handleSaveAppSettings)} className="space-y-6">
                  <FormField
                    control={appSettingsForm.control}
                    name="sendingFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Sending Frequency (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          How often vocabulary words are sent to users by default.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appSettingsForm.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the welcome message sent to new users"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The message sent to users when they first subscribe.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appSettingsForm.control}
                    name="systemEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">System Status</FormLabel>
                          <FormDescription>
                            Enable or disable the entire vocabulary system.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure when and how you want to receive system notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationSettingsForm}>
                <form onSubmit={notificationSettingsForm.handleSubmit(handleSaveNotificationSettings)} className="space-y-6">
                  <FormField
                    control={notificationSettingsForm.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Notification Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address where system notifications will be sent.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationSettingsForm.control}
                    name="errorNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">System Error Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications about system errors and failures.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationSettingsForm.control}
                    name="userSignupNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">New User Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications when new users sign up.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Notification Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab;

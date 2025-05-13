
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import WhatsAppTester from "@/components/WhatsAppTester";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppWebhookValidator from '@/components/WhatsAppWebhookValidator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConfigStatus {
  accountSid?: boolean;
  authToken?: boolean;
  fromNumber?: boolean;
  messagingService?: boolean;
  overallStatus: 'checking' | 'configured' | 'partial' | 'missing';
  error?: string;
}

const WhatsAppTest = () => {
  const navigate = useNavigate();
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    overallStatus: 'checking'
  });
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [isBusinessAccount, setIsBusinessAccount] = useState<boolean>(true); // Default to true for upgraded account
  
  useEffect(() => {
    // Check Twilio configuration
    const checkConfiguration = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("send-whatsapp", {
          body: { testTwilioConnection: true }
        });
        
        if (error) {
          console.error("Error checking Twilio configuration:", error);
          setConfigStatus({
            overallStatus: 'missing',
            error: `Failed to check configuration: ${error.message}`
          });
          return;
        }
        
        if (data && data.success) {
          // Successfully connected to Twilio account
          setConfigStatus({
            accountSid: true,
            authToken: true,
            fromNumber: true, // We assume this is correct if account verification worked
            messagingService: true,
            overallStatus: 'configured'
          });
          
          // Check account type to determine if this is a business account
          if (data.accountType) {
            setIsBusinessAccount(data.accountType !== 'Trial');
          }
          
          // Try to extract the Twilio WhatsApp number if available
          if (data.fromNumber) {
            setTwilioNumber(data.fromNumber.replace('whatsapp:', ''));
          }
        } else {
          // Could connect but there's an issue
          setConfigStatus({
            accountSid: data?.accountSidPrefix ? true : false,
            authToken: false,
            overallStatus: 'partial',
            error: data?.error || "Failed to verify Twilio credentials"
          });
        }
      } catch (err) {
        setConfigStatus({
          overallStatus: 'missing',
          error: String(err)
        });
      }
    };
    
    checkConfiguration();
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">WhatsApp Integration Test</h1>
      
      {configStatus.overallStatus === 'checking' && (
        <div className="p-6 text-center">
          <div className="animate-pulse">Checking WhatsApp configuration...</div>
        </div>
      )}
      
      {configStatus.overallStatus === 'missing' && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            <p>The WhatsApp integration is not configured properly.</p>
            <p className="text-sm mt-2">Make sure you have set the following secrets in your Supabase project:</p>
            <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
              <li>TWILIO_ACCOUNT_SID</li>
              <li>TWILIO_AUTH_TOKEN</li>
              <li>TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID</li>
              <li>WHATSAPP_VERIFY_TOKEN</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {configStatus.overallStatus === 'partial' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-800" />
          <AlertTitle className="text-yellow-800">Partial Configuration</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <p>Some Twilio credentials appear to be configured, but there might be issues.</p>
            <p className="text-sm mt-2">{configStatus.error}</p>
          </AlertDescription>
        </Alert>
      )}
      
      {configStatus.overallStatus === 'configured' && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-800" />
          <AlertTitle className="text-green-800">Configuration Verified</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>Your Twilio WhatsApp Business integration is properly configured!</p>
            {isBusinessAccount && (
              <p className="text-sm mt-1">You're using a Twilio WhatsApp Business account with template messaging capability.</p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Business Account Information */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            WhatsApp Business API Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-3">Your account is configured as a WhatsApp Business API account with the following capabilities:</p>
          
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">
            <li><strong>Template Messages:</strong> Can be sent anytime without 24-hour session limitations</li>
            <li><strong>Session Messages:</strong> Can be sent only within 24 hours of the last user message</li>
            <li><strong>WhatsApp Number:</strong> {twilioNumber || "Your Twilio WhatsApp number"}</li>
          </ul>
          
          <p className="text-sm">For best results, use template messages when initiating conversations with users. They provide higher delivery reliability and can be sent at any time.</p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="send-test">
        <TabsList className="mb-4">
          <TabsTrigger value="send-test">Send Test Message</TabsTrigger>
          <TabsTrigger value="webhook">Webhook Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send-test">
          <WhatsAppTester />
        </TabsContent>
        
        <TabsContent value="webhook">
          <div className="bg-white p-4 border rounded-lg mb-6">
            <h3 className="font-medium mb-3">Verify WhatsApp Webhook Configuration</h3>
            <WhatsAppWebhookValidator />
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Setup Instructions:</h3>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>You're using a WhatsApp Business API account which supports template messaging.</li>
          <li>Make sure to configure your message templates in the Twilio console for best results.</li>
          <li>Set the webhook URL in your Twilio account's WhatsApp settings to receive status updates.</li>
          <li>Use the <strong>WHATSAPP_VERIFY_TOKEN</strong> from your Supabase secrets when configuring the webhook.</li>
          <li>Template messages can be sent anytime, while session messages are restricted to 24-hour windows.</li>
        </ol>
      </div>
      
      <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded border">
        <p><strong>Troubleshooting:</strong> If messages are not being delivered:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Check that your template messages are approved in the Twilio console</li>
          <li>Verify that recipient phone numbers are formatted correctly with country codes</li>
          <li>Ensure the recipient's phone number has WhatsApp installed and active</li>
          <li>Check <a href="https://console.twilio.com/us1/develop/sms/logs/errors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio's Error Logs</a> for detailed error information</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppTest;

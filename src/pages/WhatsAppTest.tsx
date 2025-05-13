
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import WhatsAppTester from "@/components/WhatsAppTester";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <p>Your Twilio WhatsApp integration is properly configured!</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Sandbox Instructions Card - ALWAYS show this for new users */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Important: WhatsApp Sandbox Opt-In Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-3">For Twilio WhatsApp sandbox testing, recipients <strong>must first opt in</strong> by sending a message to your Twilio WhatsApp number:</p>
          
          <div className="bg-white p-3 rounded-md border border-blue-200 mb-3">
            <p className="font-mono text-center mb-1">Send <strong>"join &lt;your-sandbox-code&gt;"</strong> to:</p>
            <p className="font-mono text-center font-bold">{twilioNumber || "Your Twilio WhatsApp number"}</p>
          </div>
          
          <p className="text-sm">The error code 63016 means the recipient hasn't completed this opt-in process. Find your sandbox code in the <a href="https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox" target="_blank" rel="noopener noreferrer" className="underline">Twilio Console</a>.</p>
        </CardContent>
      </Card>
      
      <WhatsAppTester />
      
      <Separator className="my-8" />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Setup Instructions:</h3>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>To use WhatsApp with Twilio, make sure all your Twilio credentials are set in Supabase Edge Function secrets.</li>
          <li>For sandbox testing, recipients must send "join &lt;your-sandbox-word&gt;" to your Twilio WhatsApp number first.</li>
          <li>For production use, you'll need to register a Business Profile and submit a WhatsApp API application.</li>
          <li>Check the <a href="https://www.twilio.com/console/sms/whatsapp/learn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio WhatsApp Guide</a> for more details on setup.</li>
        </ol>
      </div>
      
      <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded border">
        <p><strong>Troubleshooting:</strong> If messages are not being delivered:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Check that the recipient has joined your sandbox if you're using Twilio's sandbox environment</li>
          <li>Verify your Twilio account is active and not in trial mode (some features may be restricted)</li>
          <li>Ensure the recipient's phone number has WhatsApp installed and active</li>
          <li>Check <a href="https://console.twilio.com/us1/develop/sms/logs/errors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio's Error Logs</a> for detailed error information</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppTest;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhatsAppWebhookValidator from '@/components/WhatsAppWebhookValidator';

interface MetaConfigStatus {
  accessToken?: boolean;
  phoneNumberId?: boolean;
  overallStatus: 'checking' | 'configured' | 'partial' | 'missing';
  error?: string;
}

const WhatsAppTest = () => {
  const navigate = useNavigate();
  const [configStatus, setConfigStatus] = useState<MetaConfigStatus>({
    overallStatus: 'checking'
  });
  
  useEffect(() => {
    const checkMetaConfiguration = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("send-whatsapp", {
          body: { checkConfig: true }
        });
        
        if (error) {
          console.error("Error checking Meta configuration:", error);
          setConfigStatus({
            overallStatus: 'missing',
            error: `Failed to check configuration: ${error.message}`
          });
          return;
        }
        
        if (data && data.success) {
          setConfigStatus({
            accessToken: true,
            phoneNumberId: true,
            overallStatus: 'configured'
          });
        } else {
          setConfigStatus({
            accessToken: data?.configStatus?.accessToken === "configured",
            phoneNumberId: data?.configStatus?.phoneNumberId === "configured",
            overallStatus: 'partial',
            error: data?.error || "Failed to verify Meta WhatsApp API credentials"
          });
        }
      } catch (err) {
        setConfigStatus({
          overallStatus: 'missing',
          error: String(err)
        });
      }
    };
    
    checkMetaConfiguration();
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
      
      <h1 className="text-2xl font-bold mb-6">Meta WhatsApp Business API</h1>
      
      <div className="space-y-6">
        {configStatus.overallStatus === 'checking' && (
          <div className="p-6 text-center">
            <div className="animate-pulse">Checking Meta WhatsApp API configuration...</div>
          </div>
        )}
        
        {configStatus.overallStatus === 'missing' && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              <p>The Meta WhatsApp Business API integration is not configured properly.</p>
              <p className="text-sm mt-2">Make sure you have set the following secrets in your Supabase project:</p>
              <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                <li>META_ACCESS_TOKEN</li>
                <li>META_PHONE_NUMBER_ID</li>
                <li>WA_WABA_ID (optional for templates)</li>
                <li>WHATSAPP_VERIFY_TOKEN (for webhooks)</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {configStatus.overallStatus === 'partial' && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertTitle className="text-yellow-800">Partial Configuration</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p>Some Meta WhatsApp API credentials appear to be configured, but there might be issues.</p>
              <p className="text-sm mt-2">{configStatus.error}</p>
            </AlertDescription>
          </Alert>
        )}
        
        {configStatus.overallStatus === 'configured' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-800" />
            <AlertTitle className="text-green-800">Configuration Verified</AlertTitle>
            <AlertDescription className="text-green-700">
              <p>Your Meta WhatsApp Business API integration is properly configured!</p>
              <p className="text-sm mt-1">You're using Meta's official WhatsApp Business API with full messaging capabilities.</p>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Business Account Information */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Meta WhatsApp Business API Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-3">Your account is configured to use Meta's official WhatsApp Business API with the following capabilities:</p>
            
            <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">
              <li><strong>Text Messages:</strong> Send direct text messages with high delivery rates</li>
              <li><strong>Template Messages:</strong> Can be sent anytime without 24-hour session limitations</li>
              <li><strong>Rich Media:</strong> Support for images, videos, documents, and interactive messages</li>
              <li><strong>Official API:</strong> Direct integration with Meta's WhatsApp Business platform</li>
            </ul>
            
            <p className="text-sm">Meta's official API provides the most reliable message delivery and is the industry standard for WhatsApp Business messaging.</p>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <WhatsAppWebhookValidator />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Meta WhatsApp API Setup Instructions:</h3>
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
            <li>You're using Meta's official WhatsApp Business API for optimal message delivery.</li>
            <li>Configure your message templates in the Meta Business Manager for best results.</li>
            <li>Set the webhook URL in your Meta App settings to receive status updates.</li>
            <li>Use the <strong>WHATSAPP_VERIFY_TOKEN</strong> from your Supabase secrets when configuring the webhook.</li>
            <li>Template messages can be sent anytime, while session messages are restricted to 24-hour windows.</li>
          </ol>
        </div>
        
        <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded border">
          <p><strong>Troubleshooting:</strong> If messages are not being delivered:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Check that your template messages are approved in Meta Business Manager</li>
            <li>Verify that recipient phone numbers are formatted correctly with country codes</li>
            <li>Ensure the recipient's phone number has WhatsApp installed and active</li>
            <li>Check Meta Business Manager for detailed error information and analytics</li>
            <li>Verify your Meta Access Token and Phone Number ID are correctly configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTest;

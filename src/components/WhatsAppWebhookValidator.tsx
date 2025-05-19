
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WebhookValidatorProps {
  defaultProvider?: 'twilio' | 'aisensy';
}

const WhatsAppWebhookValidator: React.FC<WebhookValidatorProps> = ({ defaultProvider = 'twilio' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>(defaultProvider);
  const { toast } = useToast();
  
  const getWebhookInfo = async (testWebhook = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('verify-whatsapp-webhook', {
        body: { 
          action: testWebhook ? 'test' : 'info',
          provider
        }
      });
      
      if (error) {
        console.error("Error verifying webhook:", error);
        setError(error.message);
        toast({
          title: "Verification Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setWebhookInfo(data.webhook);
      if (data.webhook.testResult) {
        setTestResult(data.webhook.testResult);
        
        if (data.webhook.testResult.success) {
          toast({
            title: "Webhook Verification Successful",
            description: "The webhook URL verified successfully!",
          });
        } else {
          toast({
            title: "Webhook Verification Failed",
            description: "Please check the error details below.",
            variant: "destructive",
          });
        }
      }
      
    } catch (err) {
      setError(String(err));
      console.error("Error in webhook validation:", err);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "URL copied successfully",
    });
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);
    setWebhookInfo(null);
    setTestResult(null);
    setError(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col sm:flex-row">
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twilio">Twilio</SelectItem>
            <SelectItem value="aisensy">AiSensy</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => getWebhookInfo(false)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Get Webhook Info
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => getWebhookInfo(true)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Webhook Verification
          </Button>
        </div>
      </div>
      
      {webhookInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">WhatsApp Webhook Configuration for {provider}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Webhook URL</label>
              <div className="flex">
                <Input 
                  readOnly 
                  value={webhookInfo.url} 
                  className="flex-1 font-mono text-xs"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(webhookInfo.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use this URL in your {provider === 'twilio' ? 'Twilio' : 'AiSensy'} WhatsApp configuration
              </p>
            </div>
            
            {webhookInfo.verifyTokenConfigured ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Verify Token Configured</AlertTitle>
                <AlertDescription>
                  The WHATSAPP_VERIFY_TOKEN is properly configured in your Supabase Edge Function secrets.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verify Token Missing</AlertTitle>
                <AlertDescription>
                  You need to set the WHATSAPP_VERIFY_TOKEN in your Supabase Edge Function secrets.
                  This is required for webhook verification.
                </AlertDescription>
              </Alert>
            )}
            
            {testResult && (
              <Alert className={testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                {testResult.success ? 
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                }
                <AlertTitle>
                  {testResult.success ? 'Webhook Test Successful' : 'Webhook Test Failed'}
                </AlertTitle>
                <AlertDescription>
                  {testResult.success ? 
                    'The webhook verification is working correctly!' : 
                    `Status: ${testResult.status || 'Error'}, Response: ${testResult.body || testResult.error || 'Unknown error'}`
                  }
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Setup Instructions for {provider === 'twilio' ? 'Twilio' : 'AiSensy'}</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>
                  Make sure the <code className="bg-gray-100 px-1 rounded">WHATSAPP_VERIFY_TOKEN</code> is set in your 
                  <a 
                    href="https://supabase.com/dashboard/project/pbpmtqcffhqwzboviqfw/settings/functions" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-blue-600 hover:underline mx-1 inline-flex items-center"
                  >
                    Supabase Edge Function secrets
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                {provider === 'twilio' ? (
                  <>
                    <li>Configure this webhook URL in your Twilio WhatsApp settings</li>
                    <li>Use this as your status callback URL</li>
                    <li>Add the verify token when prompted</li>
                  </>
                ) : (
                  <>
                    <li>Configure this webhook URL in your AiSensy account settings</li>
                    <li>Use this URL in the webhook configuration section</li>
                    <li>Add the verify token when prompted during setup</li>
                  </>
                )}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WhatsAppWebhookValidator;

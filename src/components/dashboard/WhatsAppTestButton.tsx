
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, AlertCircle, Info, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WhatsAppTestButtonProps {
  category: string;
  phoneNumber?: string; // Make phoneNumber optional
}

interface FunctionErrorDetails {
  status?: number;
  statusText?: string;
  responseText?: string;
  message?: string;
  providedNumber?: string;
  tip?: string;
  suggestion?: string;
  configurationStatus?: Record<string, string>;
  originalError?: string;
  twilioError?: any;
}

interface FunctionResponse {
  success: boolean;
  error?: string;
  details?: FunctionErrorDetails | any;
  messageId?: string;
  status?: string;
  instructions?: string[];
  troubleshooting?: Record<string, string>;
  webhookUrl?: string;
  twilioResponse?: any;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ category, phoneNumber }) => {
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [inputPhoneNumber, setInputPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [lastErrorDetails, setLastErrorDetails] = useState<string | null>(null);
  const [twilioDetails, setTwilioDetails] = useState<any>(null);
  const [showAdvancedDiagnostics, setShowAdvancedDiagnostics] = useState(false);

  // Check WhatsApp configuration status when component mounts
  React.useEffect(() => {
    checkConfig();
  }, []);

  // Function to check Twilio configuration
  const checkConfig = async () => {
    try {
      setConfigLoading(true);
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { checkOnly: true }
      });
      
      if (!error && data) {
        setConfigStatus(data);
        console.log("WhatsApp configuration status:", data);
      } else if (error) {
        console.error("Error checking WhatsApp config:", error);
        setConfigStatus({ 
          success: false, 
          error: 'Failed to check config',
          details: String(error)
        });
      }
    } catch (err) {
      console.error("Exception checking WhatsApp config:", err);
      setConfigStatus({ 
        success: false, 
        error: 'Exception during config check',
        details: String(err)
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // Test the Twilio connection directly
  const testTwilioConnection = async () => {
    try {
      setLoading(true);
      setLastErrorDetails(null);
      setTwilioDetails(null);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { testTwilioConnection: true }
      });
      
      if (error) {
        console.error("Error testing Twilio connection:", error);
        toast({
          title: "Connection Test Failed",
          description: "Could not connect to Twilio API",
          variant: "destructive",
        });
        setLastErrorDetails(`Failed to test Twilio connection: ${String(error)}`);
        return;
      }
      
      if (!data.success) {
        toast({
          title: "Twilio Connection Failed",
          description: data.error || "Could not connect to Twilio API",
          variant: "destructive",
        });
        setLastErrorDetails(data.details?.responseText || data.error || "Unknown error");
        setTwilioDetails(data.twilioResponse || null);
        return;
      }
      
      setTwilioDetails(data);
      toast({
        title: "Twilio Connection Successful",
        description: `Connected to account: ${data.accountName || 'Unknown'}`,
      });
      
    } catch (err) {
      console.error("Exception testing Twilio connection:", err);
      toast({
        title: "Connection Test Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setLastErrorDetails(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setLastErrorDetails(null); // Clear previous errors
    setTwilioDetails(null);
    
    try {
      const phoneToUse = showPhoneInput ? inputPhoneNumber : (phoneNumber || '');
      
      if (showPhoneInput && (!phoneToUse || phoneToUse.trim().length < 10)) {
        toast({
          title: "Valid phone number required",
          description: "Please enter a valid WhatsApp number with country code (e.g., +1234567890).",
          variant: "destructive"
        });
        return;
      }

      if (!phoneToUse && !showPhoneInput) {
        setShowPhoneInput(true);
        return;
      }

      setLoading(true);
      console.log(`Sending WhatsApp test message to: ${phoneToUse}`);

      const { data, error } = await supabase.functions.invoke<FunctionResponse>('send-whatsapp', {
        body: {
          to: phoneToUse,
          category: category || "general", // Use general if category is empty
          isPro: false,
          sendImmediately: true,
          debugMode: true,
          extraDebugging: true
        }
      });

      // Handle function invocation error (network, permissions etc.)
      if (error) {
        console.error("Supabase function invocation error:", error);
        toast({
          title: "Function Error",
          description: "Could not call the send-whatsapp function. Check console for details.",
          variant: "destructive",
        });
        setLastErrorDetails(`Function call error: ${String(error)}`);
        return;
      }

      // Handle errors reported by the function itself
      if (!data || !data.success) {
        console.error("WhatsApp function returned error:", data);
        const errorTitle = data?.error || "Failed to send WhatsApp message";
        let errorDescription = "An unknown error occurred.";
        
        if (data?.details) {
          if (typeof data.details === 'string') {
            errorDescription = data.details;
          } else if (data.details.message) {
            errorDescription = data.details.message;
            if (data.details.tip) errorDescription += ` Tip: ${data.details.tip}`;
            if (data.details.suggestion) errorDescription += ` Suggestion: ${data.details.suggestion}`;
          } else if (data.details.responseText) {
             errorDescription = `Twilio API Error: ${data.details.responseText.substring(0, 150)}...`;
          }
        }
        
        setLastErrorDetails(errorDescription); // Store detailed error for display
        setTwilioDetails(data.details?.twilioError || null);
        
        toast({
          title: errorTitle,
          description: "See details below the button.",
          variant: "destructive",
        });
        return; // Stop processing on function error
      }

      // Handle successful send
      console.log("WhatsApp test send response:", data);
      let successDescription = `Test message accepted by Twilio (ID: ${data.messageId || 'N/A'}). Status: ${data.status || 'unknown'}.`;
      if (data.instructions && data.instructions.length > 0) {
        successDescription += ` ${data.instructions[0]}`;
      }
      
      toast({
        title: "WhatsApp Message Sent",
        description: successDescription,
        variant: "success",
      });

      // Optionally display troubleshooting tips even on success
      if (data.troubleshooting) {
        const tips = Object.entries(data.troubleshooting)
          .map(([key, value]) => `- ${value}`)
          .join('\n');
        setLastErrorDetails(`Troubleshooting Tips:\n${tips}`);
      }

      // Store any Twilio details for advanced diagnostics
      if (data.twilioResponse) {
        setTwilioDetails(data.twilioResponse);
      }

      setInputPhoneNumber('');
      setShowPhoneInput(false);

    } catch (err: any) {
      // Catch client-side errors (e.g., network issues before function call)
      console.error("Client-side error sending WhatsApp message:", err);
      const errorMessage = err.message || "An unexpected error occurred. Check the browser console.";
      setLastErrorDetails(errorMessage);
      toast({
        title: "Failed to Send",
        description: "See details below the button.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Display configuration status issues if any
  const getTwilioIssues = () => {
    if (!configStatus) return "Loading configuration status...";
    if (configStatus.success === false) return configStatus.error || 'Failed to check configuration.';
    if (!configStatus.twilioConfigured) return "Twilio credentials (SID/Token) missing in Supabase.";
    if (!configStatus.fromNumberConfigured && !configStatus.messagingServiceConfigured) 
      return "Neither TWILIO_FROM_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is set in Supabase.";
    return null;
  };

  const twilioIssue = getTwilioIssues();
  const hasTwilioConfig = configStatus?.twilioConfigured && 
    (configStatus?.fromNumberConfigured || configStatus?.messagingServiceConfigured);

  return (
    <div className="space-y-4">
      {/* Configuration Status */}
      {!hasTwilioConfig && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Issue</AlertTitle>
          <AlertDescription>
            {twilioIssue}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConfig}
                disabled={configLoading}
              >
                {configLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Refresh Status
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Phone Input Form */}
      {showPhoneInput ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Enter WhatsApp number with country code
            </label>
            <div className="flex gap-2">
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={inputPhoneNumber}
                onChange={(e) => setInputPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="WhatsApp phone number input"
              />
              <Button 
                onClick={handleSendTest}
                disabled={loading || !inputPhoneNumber || inputPhoneNumber.trim().length < 10 || !hasTwilioConfig}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                Send
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowPhoneInput(false); setLastErrorDetails(null); }}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Make sure to include the country code (e.g., +1 for US, +91 for India)
          </div>
        </div>
      ) : (
        <Button
          onClick={handleSendTest}
          variant="default"
          disabled={loading || !hasTwilioConfig} // Disable if config issue
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
          Test WhatsApp Message
        </Button>
      )}
      
      {/* Helper Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testTwilioConnection}
          disabled={loading || configLoading || !configStatus?.twilioConfigured}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
          Test Twilio Connection
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedDiagnostics(!showAdvancedDiagnostics)}
        >
          <Info className="h-3 w-3 mr-1" />
          {showAdvancedDiagnostics ? "Hide" : "Show"} Diagnostics
        </Button>
      </div>
      
      {/* Display last error details */} 
      {lastErrorDetails && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Details</AlertTitle>
          <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>{lastErrorDetails}</AlertDescription>
        </Alert>
      )}
      
      {/* Twilio Connection Status */}
      {twilioDetails && (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Twilio Status</CardTitle>
              {twilioDetails.success ? 
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Connected</Badge> :
                <Badge variant="destructive">Error</Badge>
              }
            </div>
            <CardDescription className="text-xs">
              {twilioDetails.accountName ? `Account: ${twilioDetails.accountName}` : 
               twilioDetails.error ? `Error: ${twilioDetails.error}` : "Connection details"}
            </CardDescription>
          </CardHeader>
          {showAdvancedDiagnostics && (
            <CardContent className="py-2">
              <pre className="text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
                {JSON.stringify(twilioDetails, null, 2)}
              </pre>
            </CardContent>
          )}
        </Card>
      )}
      
      {/* Advanced Configuration Status */}
      {showAdvancedDiagnostics && configStatus && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Configuration Details</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <pre className="text-xs overflow-auto max-h-32 bg-muted p-2 rounded">
              {JSON.stringify(configStatus, null, 2)}
            </pre>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
            These details can help troubleshoot WhatsApp integration issues.
          </CardFooter>
        </Card>
      )}

      {/* Display success/config info */} 
      {configStatus && configStatus.success && configStatus.twilioConfigured && !twilioIssue && !lastErrorDetails && (
        <div className="text-xs text-green-600 mt-1">
          ✓ WhatsApp configuration seems OK.
        </div>
      )}
    </div>
  );
};

export default WhatsAppTestButton;

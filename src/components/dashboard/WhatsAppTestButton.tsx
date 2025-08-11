import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, AlertCircle, Info, ExternalLink, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Default template ID - using the provided one
const DEFAULT_TEMPLATE_ID = "HXabe0b61588dacdb93c6f458288896582";

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
  apiVersionInfo?: string;
  from?: string;
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
  const [accountSidPrefix, setAccountSidPrefix] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(false); // Default to using direct messages

  // Check WhatsApp configuration status when component mounts
  React.useEffect(() => {
    checkConfig();
  }, []);

  // Function to check Twilio configuration and detect issues
  const checkConfig = async () => {
    try {
      setConfigLoading(true);
      setLastErrorDetails(null);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { 
          checkConfig: true,
          verifyCredentials: true // Add flag to request credential verification
        }
      });
      
      if (!error && data) {
        setConfigStatus(data);
        
        // Check for account SID prefix to help with troubleshooting
        if (data.configStatus?.accountSid) {
          const sid = data.configStatus.accountSid;
          if (typeof sid === 'string' && sid.startsWith('AC')) {
            setAccountSidPrefix(sid.substring(0, 6) + '...');
          }
        }
        
        console.log("WhatsApp configuration status:", data);
        
        // Show appropriate notifications based on config
        if (data.success === false) {
          toast({
            title: "WhatsApp Configuration Issue",
            description: data.error || "There's a problem with your WhatsApp configuration",
            variant: "destructive"
          });
        } else if (data.twilioConfigured && data.accountVerified === false) {
          toast({
            title: "Account Verification Failed",
            description: "Your Twilio account credentials could not be verified",
            variant: "destructive"
          });
        } else if (data.twilioConfigured && data.accountVerified === true) {
          toast({
            title: "Twilio Account Verified",
            description: data.accountName ? `Connected to: ${data.accountName}` : "Your Twilio account is active",
            variant: "success"
          });
        }
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
      
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { 
          checkConfig: true,
          detailed: true
        }
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
        
        // Provide more specific error details
        if (data.errorCode === 20404) {
          setLastErrorDetails(`Account SID Error: The Twilio Account SID (${data.accountSidPrefix || 'unknown'}...) does not exist or has been deactivated. Please verify your Account SID in the Twilio Console.`);
        } else {
          setLastErrorDetails(data.details?.responseText || data.error || "Unknown error");
        }
        
        setTwilioDetails(data.twilioResponse || null);
        return;
      }
      
      setTwilioDetails(data);
      toast({
        title: "Twilio Connection Successful",
        description: `Connected to account: ${data.accountName || 'Unknown'} (${data.accountStatus || 'status unknown'})`,
        variant: "success"
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
    setLastErrorDetails(null);
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

      // Create test payload - prioritize direct messages
      const templateId = DEFAULT_TEMPLATE_ID;
      
      // Create request payload
      const requestPayload: any = {
        to: phoneToUse,
        category: category || "general", 
        isPro: false,
        sendImmediately: true,
        debugMode: true,
        forceDirectMessage: true // Always use direct messages
      };
      
      // Only add template if specifically requested
      if (useTemplate) {
        requestPayload.templateId = templateId;
        requestPayload.templateValues = {
          name: "User",
          otp: "123456",
          expiryMinutes: "10"
        };
        console.log(`Adding template as fallback with ID: ${templateId}`);
      }
      
      // Always include a message (primary content)
      requestPayload.message = `This is a test message for ${category} category. Sent at: ${new Date().toLocaleTimeString()}`;
      console.log("Using direct message content:", requestPayload.message);

      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: requestPayload
      });

      // Handle function invocation error
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
        
        // Parse error details
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
        
        setLastErrorDetails(errorDescription || "Unknown error"); 
        setTwilioDetails(data.details?.twilioError || null);
        
        toast({
          title: errorTitle,
          description: "See details below the button.",
          variant: "destructive",
        });
        return; 
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

      // Update UI with API version info if available
      if (data.apiVersionInfo) {
        setLastErrorDetails(`API Version Note: ${data.apiVersionInfo}\n\n${data.from ? `From: ${data.from}` : ""}`);
      } else if (data.troubleshooting) {
        const tips = Object.entries(data.troubleshooting)
          .map(([key, value]) => `- ${value}`)
          .join('\n');
        setLastErrorDetails(`Troubleshooting Tips:\n${tips}`);
      }

      if (data.twilioResponse) {
        setTwilioDetails(data.twilioResponse);
      } else if (data.details) {
        setTwilioDetails(data.details);
      }

      setInputPhoneNumber('');
      setShowPhoneInput(false);

    } catch (err: any) {
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
    if (configStatus.accountVerified === false) return "Invalid Twilio credentials. Account could not be verified.";
    if (!configStatus.fromNumberConfigured && !configStatus.messagingServiceConfigured) 
      return "Neither TWILIO_FROM_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is set in Supabase.";
    return null;
  };

  const twilioIssue = getTwilioIssues();
  const hasTwilioConfig = configStatus?.twilioConfigured && 
    (configStatus?.fromNumberConfigured || configStatus?.messagingServiceConfigured);
  const isAccountVerified = configStatus?.accountVerified === true;

  return (
    <div className="space-y-4">
      {/* Account Status Badge */}
      {configStatus && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Twilio Account Status:</span>
          {isAccountVerified ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : hasTwilioConfig ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unverified
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              Not Configured
            </Badge>
          )}
        </div>
      )}
      
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

      {/* Account specific issue */}
      {hasTwilioConfig && !isAccountVerified && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Verification Failed</AlertTitle>
          <AlertDescription>
            The Twilio Account SID {accountSidPrefix ? `(${accountSidPrefix}...)` : ""} could not be verified. 
            This typically means the Account SID is incorrect or the account has been deactivated.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testTwilioConnection}
                disabled={loading}
                className="bg-white text-red-600 border-red-300 hover:bg-red-50"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Test Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Template Mode Option - updated text to discourage template usage */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="template-mode" className="text-sm">Use Template Message</Label>
          <div className="text-xs text-muted-foreground">Not recommended - direct messages preferred</div>
        </div>
        <Switch
          id="template-mode"
          checked={useTemplate}
          onCheckedChange={setUseTemplate}
        />
      </div>
      
      {/* New Direct Message Alert */}
      <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
        Using direct messages for better delivery reliability
      </div>
      
      {/* Display template status */}
      {useTemplate && (
        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border">
          Using template ID: <span className="font-mono">{DEFAULT_TEMPLATE_ID}</span>
        </div>
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
          Test WhatsApp {useTemplate ? 'Template' : 'Message'}
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
      
      {/* Display last error details or API info */} 
      {lastErrorDetails && (
        <Alert className={lastErrorDetails.includes("API Version Note") ? "bg-blue-50 border-blue-200" : "variant-destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{lastErrorDetails.includes("API Version Note") ? "Information" : "Details"}</AlertTitle>
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
      {configStatus && configStatus.success && configStatus.twilioConfigured && isAccountVerified && !twilioIssue && !lastErrorDetails && (
        <div className="text-xs text-green-600 mt-1">
          ✓ WhatsApp configuration is verified and ready.
        </div>
      )}
    </div>
  );
};

export default WhatsAppTestButton;

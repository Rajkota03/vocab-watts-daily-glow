
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
}

interface FunctionResponse {
  success: boolean;
  error?: string;
  details?: FunctionErrorDetails | any; // Allow for various detail structures
  messageId?: string;
  status?: string;
  instructions?: string[];
  troubleshooting?: Record<string, string>;
  webhookUrl?: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ category, phoneNumber }) => {
  const [loading, setLoading] = useState(false);
  const [inputPhoneNumber, setInputPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [lastErrorDetails, setLastErrorDetails] = useState<string | null>(null);

  // Check WhatsApp configuration status when component mounts
  React.useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
          body: { checkOnly: true }
        });
        
        if (!error && data) {
          setConfigStatus(data);
          console.log("WhatsApp configuration status:", data);
        } else if (error) {
          console.error("Error checking WhatsApp config:", error);
          setConfigStatus({ success: false, error: 'Failed to check config' });
        }
      } catch (err) {
        console.error("Exception checking WhatsApp config:", err);
        setConfigStatus({ success: false, error: 'Exception during config check' });
      }
    };
    
    checkConfig();
  }, []);

  const handleSendTest = async () => {
    setLastErrorDetails(null); // Clear previous errors
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
        throw new Error(error.message || "Failed to invoke the send-whatsapp function.");
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
            if (data.details.responseText) errorDescription += ` Response: ${data.details.responseText.substring(0, 100)}...`;
          } else if (data.details.responseText) {
             errorDescription = `Twilio API Error: ${data.details.responseText.substring(0, 150)}...`;
          }
        }
        setLastErrorDetails(errorDescription); // Store detailed error for display
        toast({
          title: errorTitle,
          description: "See details below the button.",
          variant: "destructive",
          duration: 7000, // Show longer
        });
        return; // Stop processing on function error
      }

      // Handle successful send
      console.log("WhatsApp test send response:", data);
      let successDescription = `Test message accepted by Twilio (ID: ${data.messageId || 'N/A'}). Status: ${data.status || 'unknown'}.`;
      if (data.instructions && data.instructions.length > 0) {
        successDescription += ` Instructions: ${data.instructions.join(' ')}`;
      }
      
      toast({
        title: "WhatsApp Message Sent",
        description: successDescription,
        duration: 9000, // Show longer for instructions
      });

      // Optionally display troubleshooting tips even on success
      if (data.troubleshooting) {
        const tips = Object.entries(data.troubleshooting)
          .map(([key, value]) => `- ${value}`)
          .join('\n');
        setLastErrorDetails(`Troubleshooting Tips:\n${tips}`);
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
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Display configuration status issues if any
  const getTwilioIssues = () => {
    if (!configStatus) return null;
    if (configStatus.success === false) return configStatus.error || 'Failed to check configuration.';
    if (configStatus.twilioConfigured === false) return "Twilio credentials (SID/Token) missing in Supabase.";
    if (configStatus.fromNumberConfigured === false && configStatus.messagingServiceConfigured === false) return "Neither TWILIO_FROM_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is set in Supabase.";
    return null;
  };

  const twilioIssue = getTwilioIssues();

  return (
    <div className="space-y-4">
      {twilioIssue && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Issue</AlertTitle>
          <AlertDescription>{twilioIssue}</AlertDescription>
        </Alert>
      )}
      
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
                disabled={loading || !inputPhoneNumber || inputPhoneNumber.trim().length < 10}
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
          disabled={loading || !!twilioIssue} // Disable if config issue
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
          Test WhatsApp Message
        </Button>
      )}
      
      {/* Display last error details */} 
      {lastErrorDetails && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Details</AlertTitle>
          <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>{lastErrorDetails}</AlertDescription>
        </Alert>
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


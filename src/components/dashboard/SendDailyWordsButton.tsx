
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SendDailyWordsButtonProps {
  phoneNumber?: string;
  category: string;
  isPro: boolean;
}

interface FunctionResponse {
  success: boolean;
  error?: string;
  details?: any;
  messageId?: string;
  status?: string;
  instructions?: string[];
  troubleshooting?: Record<string, string>;
}

const SendDailyWordsButton: React.FC<SendDailyWordsButtonProps> = ({ phoneNumber, category, isPro }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [lastErrorDetails, setLastErrorDetails] = useState<string | null>(null);
  const [provider, setProvider] = useState<'twilio' | 'aisensy'>('twilio');
  const [providerStatus, setProviderStatus] = useState<{
    twilio: boolean;
    aisensy: boolean;
  }>({
    twilio: false,
    aisensy: false
  });

  // Check which providers are configured when component mounts
  useEffect(() => {
    const checkProviders = async () => {
      // Check Twilio
      try {
        const { data: twilioData } = await supabase.functions.invoke<FunctionResponse>('send-whatsapp', {
          body: {
            checkConfig: true,
            provider: 'twilio'
          }
        });
        
        setProviderStatus(prev => ({
          ...prev,
          twilio: twilioData?.success || false
        }));
        
        if (twilioData?.success) {
          setProvider('twilio');
        }
      } catch (e) {
        console.error("Error checking Twilio config:", e);
      }
      
      // Check AiSensy
      try {
        const { data: aisensyData } = await supabase.functions.invoke<FunctionResponse>('send-whatsapp', {
          body: {
            checkConfig: true,
            provider: 'aisensy'
          }
        });
        
        setProviderStatus(prev => ({
          ...prev,
          aisensy: aisensyData?.success || false
        }));
        
        // If AiSensy is configured and Twilio isn't, use AiSensy
        if (aisensyData?.success && !providerStatus.twilio) {
          setProvider('aisensy');
        }
      } catch (e) {
        console.error("Error checking AiSensy config:", e);
      }
    };
    
    checkProviders();
  }, []);

  const handleSendWords = async () => {
    setLastErrorDetails(null); // Clear previous errors

    if (!phoneNumber) {
      toast({
        title: "Phone Number Missing",
        description: "Your WhatsApp number is not configured in your profile.",
        variant: "destructive"
      });
      setLastErrorDetails("Cannot send words: Phone number not found in your subscription details. Please update your profile to include your WhatsApp number.");
      return;
    }

    setLoading(true);
    console.log(`Requesting daily words for ${phoneNumber}, category: ${category}, isPro: ${isPro}, provider: ${provider}`);

    try {
      const { data, error } = await supabase.functions.invoke<FunctionResponse>('send-whatsapp', {
        body: {
          to: phoneNumber,
          category: category,
          isPro: isPro,
          sendImmediately: true, // Send now as it's a manual trigger
          debugMode: true, // Include additional debug information
          provider: provider, // Specify the provider
          // Always include a direct message
          message: `Here are your daily vocabulary words for ${category}. Enjoy learning!`
        }
      });

      // Handle function invocation error
      if (error) {
        console.error("Supabase function invocation error:", error);
        throw new Error(error.message || "Failed to invoke the send-whatsapp function.");
      }

      // Handle errors reported by the function
      if (!data || !data.success) {
        console.error("WhatsApp function returned error:", data);
        const errorTitle = data?.error || "Failed to send daily words";
        let errorDescription = "An unknown error occurred.";
        
        if (data?.details) {
          if (typeof data.details === 'string') {
            errorDescription = data.details;
          } else if (data.details.message) {
            errorDescription = data.details.message;
            // Add tips/suggestions if available
            if (data.details.tip) errorDescription += ` Tip: ${data.details.tip}`;
            if (data.details.suggestion) errorDescription += ` Suggestion: ${data.details.suggestion}`;
          } else if (data.details.responseText) {
             errorDescription = `API Error: ${data.details.responseText.substring(0, 150)}...`;
          }
        }
        setLastErrorDetails(errorDescription);
        toast({
          title: errorTitle,
          description: "See details below the button.",
          variant: "destructive",
        });
        return;
      }

      // Handle successful send
      console.log("Daily words send response:", data);
      let successDescription = `Your daily words request was accepted (ID: ${data.messageId || 'N/A'}). Status: ${data.status || 'unknown'}.`;
      if (data.instructions && data.instructions.length > 0) {
        successDescription += ` Instructions: ${data.instructions.join(' ')}`;
      }
      
      toast({
        title: "Daily Words Sent!",
        description: successDescription,
      });

      // Display troubleshooting tips if provided
      if (data.troubleshooting) {
        const tips = Object.entries(data.troubleshooting)
          .map(([key, value]) => `- ${value}`)
          .join('\n');
        setLastErrorDetails(`Troubleshooting Tips:\n${tips}`);
      }

    } catch (err: any) {
      // Catch client-side errors
      console.error("Client-side error sending daily words:", err);
      const errorMessage = err.message || "An unexpected error occurred. Check the browser console.";
      setLastErrorDetails(errorMessage);
      toast({
        title: "Failed to Send Words",
        description: "See details below the button.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (value: string) => {
    setProvider(value as 'twilio' | 'aisensy');
  };

  return (
    <div className="space-y-4">
      {(providerStatus.twilio && providerStatus.aisensy) && (
        <div className="mb-2">
          <label htmlFor="provider" className="block text-sm font-medium mb-1">WhatsApp Provider</label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger id="provider" className="w-full">
              <SelectValue placeholder="Select WhatsApp Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="aisensy">AiSensy</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {provider === 'aisensy' 
              ? "AiSensy offers better delivery rates especially for US numbers"
              : "Twilio is the default provider"}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleSendWords}
        variant="default"
        disabled={loading || !phoneNumber}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        Send Today's Words {provider === 'aisensy' ? '(via AiSensy)' : ''}
      </Button>
      {!phoneNumber && (
         <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Phone Number</AlertTitle>
          <AlertDescription>Please ensure your WhatsApp number is saved in your profile/subscription to receive words.</AlertDescription>
        </Alert>
      )}
      {/* Display last error details */} 
      {lastErrorDetails && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Details</AlertTitle>
          <AlertDescription style={{ whiteSpace: 'pre-wrap' }}>{lastErrorDetails}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SendDailyWordsButton;

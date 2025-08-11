
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const handleSendWords = async () => {
    setLastErrorDetails(null);
    console.log('=== SEND WORDS DEBUG START ===');
    console.log('PhoneNumber:', phoneNumber);
    console.log('Category:', category);
    console.log('IsPro:', isPro);

    if (!phoneNumber) {
      console.log('ERROR: No phone number provided');
      toast({
        title: "Phone Number Missing",
        description: "Your WhatsApp number is not configured in your profile.",
        variant: "destructive"
      });
      setLastErrorDetails("Cannot send words: Phone number not found in your subscription details. Please update your profile to include your WhatsApp number.");
      return;
    }

    setLoading(true);
    console.log(`Requesting daily words for ${phoneNumber}, category: ${category}, isPro: ${isPro}`);

    try {
      console.log('About to call supabase.functions.invoke...');
      const { data, error } = await supabase.functions.invoke<FunctionResponse>('whatsapp-send', {
        body: {
          to: phoneNumber,
          category: category,
          isPro: isPro,
          sendImmediately: true,
          debugMode: true,
          message: `Here are your daily vocabulary words for ${category}. Enjoy learning!`
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error("Supabase function invocation error:", error);
        throw new Error(error.message || "Failed to invoke the send-whatsapp function.");
      }

      if (!data || !data.success) {
        console.error("WhatsApp function returned error:", data);
        const errorTitle = data?.error || "Failed to send daily words";
        let errorDescription = "An unknown error occurred.";
        
        if (data?.details) {
          if (typeof data.details === 'string') {
            errorDescription = data.details;
          } else if (data.details.message) {
            errorDescription = data.details.message;
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

      console.log("Daily words send response:", data);
      let successDescription = `Your daily words request was accepted (ID: ${data.messageId || 'N/A'}). Status: ${data.status || 'unknown'}.`;
      if (data.instructions && data.instructions.length > 0) {
        successDescription += ` Instructions: ${data.instructions.join(' ')}`;
      }
      
      toast({
        title: "Daily Words Sent!",
        description: successDescription,
      });

      if (data.troubleshooting) {
        const tips = Object.entries(data.troubleshooting)
          .map(([key, value]) => `- ${value}`)
          .join('\n');
        setLastErrorDetails(`Troubleshooting Tips:\n${tips}`);
      }

    } catch (err: any) {
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

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSendWords}
        variant="default"
        disabled={loading || !phoneNumber}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        Send Today's Words
      </Button>
      {!phoneNumber && (
         <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Phone Number</AlertTitle>
          <AlertDescription>Please ensure your WhatsApp number is saved in your profile/subscription to receive words.</AlertDescription>
        </Alert>
      )}
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

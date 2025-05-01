
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppTestButtonProps {
  category: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ category }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  const [configStatus, setConfigStatus] = useState<any>(null);

  // Check WhatsApp configuration status when component mounts
  React.useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
          body: { checkOnly: true }
        });
        
        if (!error) {
          setConfigStatus(data);
          console.log("WhatsApp configuration status:", data);
        }
      } catch (err) {
        console.error("Error checking WhatsApp config:", err);
      }
    };
    
    checkConfig();
  }, []);

  const handleSendTest = async () => {
    try {
      if (showPhoneInput && (!phoneNumber || phoneNumber.trim().length < 10)) {
        toast({
          title: "Valid phone number required",
          description: "Please enter a valid WhatsApp number with country code.",
          variant: "destructive"
        });
        return;
      }

      const phoneToUse = showPhoneInput ? phoneNumber : '';
      
      if (!phoneToUse && !showPhoneInput) {
        setShowPhoneInput(true);
        return;
      }

      setLoading(true);
      console.log(`Sending WhatsApp test message to: ${phoneToUse}`);

      // Log phone number details for debugging
      console.log("Phone number details:", {
        original: phoneToUse,
        length: phoneToUse.length,
        hasCountryCode: phoneToUse.includes('+'),
        digits: phoneToUse.replace(/[^0-9]/g, '').length
      });

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: phoneToUse,
          category: category || "daily-beginner",
          isPro: false,
          sendImmediately: true,
          debugMode: true,
          extraDebugging: true
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to send WhatsApp message");
      }

      console.log("WhatsApp test send response:", data);
      
      // Log message delivery details for debugging
      console.log("Message delivery details:", {
        messageId: data?.messageId,
        status: data?.status,
        to: data?.to,
        from: data?.from,
        usingMessagingService: data?.usingMessagingService,
        usingMetaIntegration: data?.usingMetaIntegration
      });

      toast({
        title: "WhatsApp Message Sent",
        description: `Test message for ${category || "general"} vocabulary sent to ${phoneToUse}.`,
      });

      setPhoneNumber('');
      setShowPhoneInput(false);
    } catch (err: any) {
      console.error("Error sending WhatsApp message:", err);
      toast({
        title: "Failed to send WhatsApp message",
        description: err.message || "An error occurred. Check developer console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Display configuration status issues if any
  const getTwilioIssues = () => {
    if (!configStatus) return null;
    
    if (configStatus.twilioConfigured === false) {
      return "Twilio credentials are missing. Please configure them in your Supabase settings.";
    }
    
    if (configStatus.configRequired?.TWILIO_AUTH_TOKEN === true) {
      return "Twilio AUTH TOKEN is missing. Please add it to your Supabase secrets.";
    }
    
    if (configStatus.fromNumberConfigured === false) {
      return "WhatsApp sender number is not configured. Please add TWILIO_FROM_NUMBER to your Supabase secrets.";
    }
    
    return null;
  };

  const twilioIssue = getTwilioIssues();

  return (
    <div className="space-y-4">
      {twilioIssue && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-md text-sm">
          ⚠️ {twilioIssue}
        </div>
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
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSendTest}
                disabled={loading || !phoneNumber || phoneNumber.trim().length < 10}
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
              onClick={() => setShowPhoneInput(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Make sure to include the country code (e.g., +1 for US, +91 for India)
          </div>
        </div>
      ) : (
        <Button
          onClick={handleSendTest}
          variant="default"
          disabled={loading}
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
          Test WhatsApp Message
        </Button>
      )}
      
      {configStatus && configStatus.twilioConfigured && configStatus.configRequired?.TWILIO_AUTH_TOKEN === false && (
        <div className="text-xs text-green-600 mt-1">
          ✓ WhatsApp is configured and ready to use
        </div>
      )}
    </div>
  );
};

export default WhatsAppTestButton;

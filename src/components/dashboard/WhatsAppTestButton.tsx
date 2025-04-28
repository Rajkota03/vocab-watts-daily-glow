
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberDialog } from '@/components/payment/PhoneNumberDialog'; 
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppTestButtonProps {
  category: string;
  phoneNumber?: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ 
  category,
  phoneNumber: initialPhoneNumber 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!phoneNumber) {
      setShowPhoneDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      // Call the Supabase edge function to send a WhatsApp message
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: phoneNumber,
          category: category || 'general',
          isPro: false,
          sendImmediately: true
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to send test message');
      }
      
      console.log('WhatsApp test send response:', data);
      
      toast({
        title: "Message Sent!",
        description: `A test message has been sent to ${phoneNumber}. Don't forget to join the Twilio Sandbox by sending 'join part-every' to +1 415 523 8886 on WhatsApp.`,
      });
    } catch (error: any) {
      console.error('Error sending test message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogSubmit = async () => {
    setShowPhoneDialog(false);
    handleSendTest();
  };

  return (
    <>
      <Button 
        onClick={handleSendTest} 
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Test WhatsApp Message
          </>
        )}
      </Button>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h4 className="font-medium text-amber-800">Important: First-time WhatsApp Setup</h4>
        <p className="text-sm text-amber-700 mt-1">
          Before receiving messages, you must join the Twilio WhatsApp Sandbox:
        </p>
        <ol className="list-decimal ml-5 mt-2 text-sm text-amber-700 space-y-1">
          <li>Add this number to your contacts: <span className="font-medium">+1 415 523 8886</span></li>
          <li>Send this exact message on WhatsApp: <span className="font-medium">join part-every</span></li>
          <li>Wait for confirmation before testing</li>
        </ol>
      </div>

      <PhoneNumberDialog 
        open={showPhoneDialog}
        onOpenChange={setShowPhoneDialog}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        onSubmit={handleDialogSubmit}
        isProcessing={isLoading}
      />
    </>
  );
};

export default WhatsAppTestButton;

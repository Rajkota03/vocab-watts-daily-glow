
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumberDialog } from '@/components/payment/PhoneNumberDialog'; 

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message Sent!",
        description: `A test message has been sent to ${phoneNumber}`,
      });
    } catch (error: any) {
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


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!phoneNumber) {
      setShowPhoneDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('Sending WhatsApp test message to:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: phoneNumber,
          category: category || 'general',
          isPro: false,
          sendImmediately: true
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        setError(`Edge function error: ${error.message}`);
        setDebugInfo(error);
        throw new Error(error.message || 'Failed to send test message');
      }
      
      if (!data) {
        setError('No response data from Twilio API');
        throw new Error('No response data from Twilio API');
      }
      
      if (data.error) {
        console.error('Twilio API error:', data.error);
        setError(`Twilio API error: ${data.error}`);
        setDebugInfo(data);
        throw new Error(data.error || 'Failed to send test message');
      }
      
      // Store the debug info for display
      setDebugInfo(data);
      console.log('WhatsApp test send response:', data);
      
      toast({
        title: "Message Sent!",
        description: `A test message has been sent to ${phoneNumber}`,
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
      <div className="flex flex-col space-y-4">
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
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error sending message</p>
              <p>{error}</p>
              {debugInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium">Debug information</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs overflow-x-auto max-h-40">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
        
        {debugInfo && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
            <p className="font-medium">Message sent successfully!</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium">Debug information</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs overflow-x-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}
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

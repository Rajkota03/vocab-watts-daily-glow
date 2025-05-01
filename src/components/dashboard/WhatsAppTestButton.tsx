
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle, Info, Settings } from 'lucide-react';
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
  const [fromNumber, setFromNumber] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [configInputs, setConfigInputs] = useState({
    fromNumber: '+918978354242',
    verifyToken: '',
  });
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!phoneNumber) {
      setShowPhoneDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setFromNumber(null);
    
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
      setFromNumber(data.from || null);
      console.log('WhatsApp test send response:', data);
      
      toast({
        title: "Message Sent!",
        description: `A test message has been sent to ${phoneNumber}`,
        variant: "success"
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

  const handleConfigSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-whatsapp-settings', {
        body: {
          fromNumber: configInputs.fromNumber,
          verifyToken: configInputs.verifyToken || undefined,
        }
      });
      
      if (error) {
        console.error('Failed to update WhatsApp settings:', error);
        throw new Error(error.message || 'Failed to update WhatsApp settings');
      }
      
      console.log('WhatsApp settings updated:', data);
      toast({
        title: "Settings Updated",
        description: "WhatsApp webhook settings have been updated. Remember to update your Supabase secrets!",
        variant: "success"
      });
      
      setConfiguring(false);
      setDebugInfo(data);
    } catch (error: any) {
      console.error('Error updating WhatsApp settings:', error);
      setError(error.message || 'Failed to update WhatsApp settings');
      toast({
        title: "Error",
        description: error.message || "Failed to update WhatsApp settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {!configuring ? (
          <>
            <div className="flex space-x-2">
              <Button 
                onClick={handleSendTest} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
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
              <Button
                onClick={() => setConfiguring(true)}
                variant="outline"
                className="border-gray-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {phoneNumber && !isLoading && !error && !debugInfo && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Info className="h-4 w-4 mr-1" />
                <span>Will send to: {phoneNumber}</span>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 border border-gray-200 rounded-lg space-y-3">
            <h3 className="font-medium text-sm">Configure WhatsApp Settings</h3>
            
            <div className="space-y-2">
              <label className="block text-xs text-gray-700">
                WhatsApp Business Phone Number (without "whatsapp:" prefix)
              </label>
              <input
                type="text"
                value={configInputs.fromNumber}
                onChange={(e) => setConfigInputs({...configInputs, fromNumber: e.target.value})}
                placeholder="Example: +918978354242"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500">
                This number should be registered with WhatsApp Business API
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs text-gray-700">
                Webhook Verification Token (optional)
              </label>
              <input
                type="text"
                value={configInputs.verifyToken}
                onChange={(e) => setConfigInputs({...configInputs, verifyToken: e.target.value})}
                placeholder="Create a unique verification token"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                onClick={handleConfigSubmit} 
                disabled={isLoading || !configInputs.fromNumber}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Settings"
                )}
              </Button>
              <Button
                onClick={() => setConfiguring(false)}
                variant="outline"
                className="border-gray-300"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
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
            <div className="mt-2 space-y-2">
              <div className="flex flex-col">
                <span className="font-medium">From:</span> 
                <span className="text-xs break-all">{(debugInfo.from || "").replace("whatsapp:", "")} {debugInfo.usingMetaIntegration ? "(WhatsApp Business)" : "(Twilio Sandbox)"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">To:</span> 
                <span className="text-xs break-all">{(debugInfo.to || "").replace("whatsapp:", "")}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Status:</span> 
                <span className="text-xs">{debugInfo.status || "unknown"}</span>
              </div>
            </div>
            
            {!debugInfo.usingMetaIntegration && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                <p className="font-medium text-xs">Using Twilio Sandbox</p>
                <p className="text-xs mt-1">
                  You need to join the Twilio Sandbox first by sending 'join part-every' to +1 415 523 8886 on WhatsApp.
                </p>
              </div>
            )}
            
            {debugInfo.webhookUrl && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                <p className="font-medium text-xs">WhatsApp Webhook Configuration</p>
                <p className="text-xs mt-1">Use this webhook URL in your WhatsApp Business account:</p>
                <code className="block bg-blue-100 p-1 rounded mt-1 text-xs break-all">
                  {debugInfo.webhookUrl}
                </code>
                <div className="mt-2">
                  <p className="font-medium text-xs">Required Steps:</p>
                  <ul className="text-xs list-disc pl-4 mt-1">
                    {debugInfo.instructions?.map((instruction: string, i: number) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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

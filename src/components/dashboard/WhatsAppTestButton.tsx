
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, AlertCircle, Info, Settings, ExternalLink, HelpCircle, CheckCircle, PhoneCall } from 'lucide-react';
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
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [configInputs, setConfigInputs] = useState({
    fromNumber: '',
    verifyToken: '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Check config status when component loads
  React.useEffect(() => {
    if (!configuring) {
      checkTwilioConfig();
    }
  }, []);

  const checkTwilioConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('update-whatsapp-settings', {
        body: { checkOnly: true }
      });
      
      if (error) {
        console.error('Failed to check Twilio config:', error);
        setConfigStatus({
          error: true,
          message: "Failed to check Twilio configuration"
        });
      } else {
        setConfigStatus(data);
        // If we have a from number, pre-fill it
        if (data?.fromNumber) {
          setConfigInputs(prev => ({...prev, fromNumber: data.fromNumber}));
        }
        console.log("WhatsApp configuration status:", data);
      }
    } catch (err) {
      console.error('Error checking Twilio config:', err);
      setConfigStatus({
        error: true,
        message: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTwilioConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    
    try {
      // First check if configuration exists
      const { data: configData, error: configError } = await supabase.functions.invoke('send-whatsapp', {
        body: { checkOnly: true }
      });
      
      if (configError) {
        throw new Error(`Configuration check failed: ${configError.message}`);
      }
      
      // If we have valid configuration, try to test the direct Twilio connection
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          testTwilioConnection: true
        }
      });
      
      if (error) {
        throw new Error(`Connection test failed: ${error.message}`);
      }
      
      setConnectionTestResult({
        success: true,
        configStatus: configData,
        connectionDetails: data
      });
      
      toast({
        title: "Connection Test Complete",
        description: data?.success ? 
          "Successfully connected to Twilio API" : 
          "Connection test completed with issues",
        variant: data?.success ? "success" : "destructive"
      });
      
    } catch (err: any) {
      console.error('Error testing Twilio connection:', err);
      setConnectionTestResult({
        success: false,
        error: err.message || "Unknown error testing connection"
      });
      
      toast({
        title: "Connection Test Failed",
        description: err.message || "Failed to test Twilio connection",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTest = async () => {
    if (!phoneNumber) {
      setShowPhoneDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setFromNumber(null);
    setDeliveryStatus('sending');
    
    try {
      console.log('Sending WhatsApp test message to:', phoneNumber);
      
      // Add more detailed logs about the phone number format
      console.log('Phone number details:', {
        original: phoneNumber,
        length: phoneNumber.length,
        hasCountryCode: phoneNumber.startsWith('+'),
        digits: phoneNumber.replace(/[^\d]/g, '').length
      });
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: phoneNumber,
          category: category || 'general',
          isPro: false,
          sendImmediately: true,
          debugMode: true, // Enable detailed logging
          extraDebugging: true // Request additional debugging info
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        setError(`Edge function error: ${error.message}`);
        setDebugInfo(error);
        setDeliveryStatus('failed');
        throw new Error(error.message || 'Failed to send test message');
      }
      
      if (!data) {
        setError('No response data from Twilio API');
        setDeliveryStatus('failed');
        throw new Error('No response data from Twilio API');
      }
      
      if (data.error) {
        console.error('Twilio API error:', data.error);
        setError(`Twilio API error: ${data.error}`);
        setDebugInfo(data);
        setDeliveryStatus('failed');
        throw new Error(data.error || 'Failed to send test message');
      }
      
      // Store the debug info for display
      setDebugInfo(data);
      setFromNumber(data.from || null);
      setDeliveryStatus(data.status || 'unknown');
      console.log('WhatsApp test send response:', data);
      
      toast({
        title: "Message Sent!",
        description: `A test message has been sent to ${phoneNumber} (Status: ${data.status || 'unknown'})`,
        variant: "success"
      });
      
      // Show more detailed information about the message in the console
      console.log('Message delivery details:', {
        messageId: data.messageId,
        status: data.status,
        to: data.to,
        from: data.from,
        usingMetaIntegration: data.usingMetaIntegration
      });
      
      // If there are delivery instructions, log them too
      if (data.instructions) {
        console.log('Delivery instructions:', data.instructions);
      }
    } catch (error: any) {
      console.error('Error sending test message:', error);
      setDeliveryStatus('error');
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
        description: "WhatsApp webhook settings have been generated. Follow the next steps shown below.",
        variant: "success"
      });
      
      setConfiguring(false);
      setDebugInfo(data);
      setConfigStatus(data);
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

  // Helper to determine if we're using the Twilio sandbox
  const isUsingSandbox = () => {
    if (configStatus?.currentFromNumber === '+14155238886') {
      return true;
    }
    if (debugInfo?.from === 'whatsapp:+14155238886') {
      return true;
    }
    return false;
  };

  // Format phone number for display with country code highlighting
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return '';
    
    // Remove any 'whatsapp:' prefix
    const cleanPhone = phone.replace(/^whatsapp:/, '');
    
    // If it doesn't have a + sign, it might be missing country code
    if (!cleanPhone.startsWith('+')) {
      return <span className="text-red-600">{cleanPhone} <span className="text-xs">(missing country code)</span></span>;
    }
    
    // Split country code from the rest
    const match = cleanPhone.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      return (
        <span>
          <span className="font-semibold">{match[1]}</span>{match[2]}
        </span>
      );
    }
    
    return cleanPhone;
  };

  // Render the sandbox join instructions if needed
  const renderSandboxInstructions = () => {
    if (!isUsingSandbox()) return null;
    
    return (
      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <p className="font-medium text-xs">Important: Join the Twilio Sandbox First</p>
        <ol className="text-xs mt-2 space-y-1 list-decimal pl-4">
          <li>Open WhatsApp on your phone</li>
          <li>Send the message <strong>"join part-every"</strong> to <strong>+1 415 523 8886</strong></li>
          <li>Wait for confirmation that you've joined</li>
          <li>Then try sending the test message again</li>
        </ol>
      </div>
    );
  };

  // Show phone number format guidance
  const renderPhoneNumberGuidance = () => {
    if (!phoneNumber) return null;
    
    const hasCountryCode = phoneNumber.startsWith('+');
    const isProperlyFormatted = hasCountryCode && phoneNumber.replace(/[^\d+]/g, '').length >= 10;
    
    if (!isProperlyFormatted) {
      return (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <p className="font-medium">Phone Number Format</p>
          <p>Your phone number should include the country code with a + sign.</p>
          <p className="mt-1"><strong>Correct format:</strong> +[country code][number]</p>
          <p><strong>Examples:</strong> +12025550123 (US), +447911123456 (UK), +919876543210 (India)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {configStatus && configStatus.error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
            <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Twilio Configuration Check</p>
              <p>There was an error checking your Twilio configuration. This may affect message delivery.</p>
            </div>
          </div>
        )}

        {configStatus && !configStatus.error && !configStatus.twilioConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
            <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Twilio Not Fully Configured</p>
              <p>Your Twilio WhatsApp integration is not fully configured. Please set the required secrets in Supabase.</p>
              <div className="mt-2">
                <a 
                  href="https://supabase.com/dashboard/project/pbpmtqcffhqwzboviqfw/settings/functions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs flex items-center text-amber-900 hover:text-amber-800 font-medium"
                >
                  <span>Configure Supabase Secrets</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Phone Number Format Guidance */}
        {renderPhoneNumberGuidance()}

        {!configuring ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleSendTest} 
                disabled={isLoading || testingConnection}
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
                    Send Test Message
                  </>
                )}
              </Button>
              
              <Button
                onClick={testTwilioConnection}
                disabled={isLoading || testingConnection}
                variant="secondary"
                className="border-green-300"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setConfiguring(true)}
                disabled={isLoading || testingConnection}
                variant="outline"
                className="border-gray-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {phoneNumber && !isLoading && !error && !debugInfo && !connectionTestResult && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Info className="h-4 w-4 mr-1" />
                <span>Will send to: {formatPhoneForDisplay(phoneNumber)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 border border-gray-200 rounded-lg space-y-3">
            <h3 className="font-medium text-sm">Configure WhatsApp Settings</h3>
            
            <div className="space-y-2">
              <label className="block text-xs text-gray-700">
                WhatsApp Business Phone Number (with country code)
              </label>
              <input
                type="text"
                value={configInputs.fromNumber}
                onChange={(e) => setConfigInputs({...configInputs, fromNumber: e.target.value})}
                placeholder="Example: +918978354242"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter with country code (e.g., +1 for US, +91 for India)
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs text-gray-700">
                Webhook Verification Token (required)
              </label>
              <input
                type="text"
                value={configInputs.verifyToken}
                onChange={(e) => setConfigInputs({...configInputs, verifyToken: e.target.value})}
                placeholder="Create a unique verification token"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500">
                You'll need this same token when setting up the webhook in WhatsApp
              </p>
            </div>
            
            <div className="mt-1">
              <a 
                href="https://supabase.com/dashboard/project/pbpmtqcffhqwzboviqfw/settings/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs flex items-center text-blue-600 hover:text-blue-800"
              >
                <span>Go to Supabase Secrets</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
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
        
        {/* Show connection test results */}
        {connectionTestResult && (
          <div className={`p-3 ${connectionTestResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg text-xs`}>
            <div className="flex items-center mb-2">
              {connectionTestResult.success ? 
                <CheckCircle className="h-4 w-4 mr-2" /> : 
                <AlertCircle className="h-4 w-4 mr-2" />
              }
              <p className="font-medium">
                {connectionTestResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
              </p>
            </div>
            
            {connectionTestResult.success ? (
              <div className="space-y-2">
                <div className="mt-2">
                  <p className="font-medium">Twilio Configuration:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Account SID: {connectionTestResult.configStatus?.configStatus?.accountSid || 'Not configured'}</li>
                    <li>Auth Token: {connectionTestResult.configStatus?.configStatus?.authToken || 'Not configured'}</li>
                    <li>From Number: {connectionTestResult.configStatus?.configStatus?.fromNumber || 'Not configured'}</li>
                    <li>Verify Token: {connectionTestResult.configStatus?.configStatus?.verifyToken || 'Not configured'}</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">API Connection:</p>
                  <p>{connectionTestResult.connectionDetails?.message || 'Connection established'}</p>
                </div>
                
                {connectionTestResult.connectionDetails?.accountInfo && (
                  <div>
                    <p className="font-medium">Account Information:</p>
                    <pre className="bg-green-100 p-1 rounded overflow-x-auto text-xs mt-1">
                      {JSON.stringify(connectionTestResult.connectionDetails.accountInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>{connectionTestResult.error}</p>
                <p className="mt-2">Please check your Twilio configuration in Supabase secrets and try again.</p>
              </div>
            )}
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
                  <pre className="mt-2 whitespace-pre-wrap text-xs overflow-x-auto max-h-40 bg-red-100 p-2 rounded">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
        
        {/* Render sandbox instructions if needed */}
        {isUsingSandbox() && renderSandboxInstructions()}
        
        {debugInfo && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              <p className="font-medium">Message sent successfully!</p>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex flex-col">
                <span className="font-medium">From:</span> 
                <span className="text-xs break-all">{(debugInfo.from || "").replace("whatsapp:", "")} {debugInfo.usingMetaIntegration ? "(WhatsApp Business)" : "(Twilio Sandbox)"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">To:</span> 
                <span className="text-xs break-all">{formatPhoneForDisplay((debugInfo.to || "").replace("whatsapp:", ""))}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Status:</span> 
                <span className={`text-xs font-medium ${
                  debugInfo.status === 'queued' ? 'text-yellow-600' :
                  debugInfo.status === 'sent' ? 'text-green-600' :
                  debugInfo.status === 'delivered' ? 'text-green-700' : 'text-blue-600'
                }`}>
                  {debugInfo.status || "unknown"}
                </span>
              </div>
              
              {debugInfo.status === 'queued' && (
                <div className="text-xs bg-yellow-50 p-2 border border-yellow-200 rounded">
                  Message is queued but not yet delivered. This is normal - delivery typically takes a few seconds.
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="font-medium">Message ID:</span> 
                <span className="text-xs break-all font-mono">{debugInfo.messageId}</span>
              </div>
            </div>
            
            {/* Always show sandbox instructions if using the sandbox number */}
            {isUsingSandbox() && renderSandboxInstructions()}
            
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
              <p className="font-medium text-xs mb-1">Troubleshooting Delivery Issues:</p>
              <ol className="text-xs list-decimal pl-4 space-y-1">
                <li>Make sure your phone has a working internet connection</li>
                <li>Check that your WhatsApp is open and notifications are enabled</li>
                <li><strong>Verify your phone number includes the country code</strong> (e.g., +1 for US)</li>
                <li>If using Twilio Sandbox: Send "join part-every" to +1 415 523 8886</li>
                <li>If using WhatsApp Business API: Verify your template messages are approved</li>
                <li>Try restarting your WhatsApp application</li>
                <li>Wait a few minutes as sometimes there are delays in delivery</li>
              </ol>
            </div>
            
            {debugInfo.webhookUrl && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                <p className="font-medium text-xs">WhatsApp Webhook Configuration</p>
                <p className="text-xs mt-1">Use this webhook URL in your WhatsApp Business account:</p>
                <code className="block bg-blue-100 p-1 rounded mt-1 text-xs break-all">
                  {debugInfo.webhookUrl}
                </code>
                
                <div className="mt-3 border-t border-blue-200 pt-2">
                  <p className="font-medium text-xs mb-1">Required Steps:</p>
                  <ol className="text-xs list-decimal pl-4 mt-1 space-y-1">
                    {debugInfo.instructions?.map((instruction: string, i: number) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium">Debug information</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs overflow-x-auto max-h-40 bg-green-100 p-2 rounded">
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


import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Check, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"; 
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface PhoneLoginFormProps {
  onLoginSuccess: () => void;
}

// Define interfaces for message status
interface WhatsAppMessageStatus {
  id: string;
  message_sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
  to_number: string;
  from_number?: string;
  created_at: string;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({ onLoginSuccess }) => {
  // Check if there's a prefilled phone number from preview word feature
  const [phone, setPhone] = useState(() => {
    const storedPhone = localStorage.getItem('previewPhoneNumber');
    if (storedPhone) {
      localStorage.removeItem('previewPhoneNumber'); // Clear after use
      return storedPhone;
    }
    return '';
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const { toast } = useToast();

  // Format phone number to ensure it has country code
  const formatPhoneNumber = (input: string) => {
    let formatted = input.trim();
    // Ensure it has a + prefix
    if (!formatted.startsWith('+')) {
      formatted = `+${formatted}`;
    }
    return formatted;
  };
  
  // Check message status from webhook
  const checkMessageStatus = async (msgId: string) => {
    if (!msgId) return;
    
    try {
      // Use the new database function to check message status
      const { data, error } = await supabase.rpc(
        'get_whatsapp_message_status',
        { message_sid_param: msgId }
      );
        
      if (error) {
        console.error("Error checking message status:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const statusData = data[0] as WhatsAppMessageStatus;
        console.log("Latest message status:", statusData);
        
        if (statusData.status === 'undelivered') {
          setError(`Message delivery failed: ${statusData.error_message || 'The message could not be delivered to WhatsApp'}`);
        }
      }
    } catch (e) {
      console.error("Exception checking message status:", e);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    
    // Basic validation
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(phone);
    
    setIsLoading(true);
    try {
      console.log("Sending OTP to:", formattedPhone);
      
      // Get template ID from environment or use default
      const templateId = import.meta.env.VITE_WHATSAPP_TEMPLATE_SID || undefined;
      console.log("Using template ID:", templateId || "None specified (will use server default)");
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { 
          phoneNumber: formattedPhone,
          templateId: templateId // Optional template ID from environment
        }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to send OTP.');

      // Store message ID if available for status checking
      if (data?.messageId) {
        setMessageId(data.messageId);
        // Set up status check after a delay
        setTimeout(() => checkMessageStatus(data.messageId), 5000);
      }
      
      // Store debug information
      setDebugInfo(data);
      
      // Add info about template usage
      if (data?.usingTemplate) {
        setDebugInfo({
          ...data,
          templateInfo: "Using a WhatsApp template to bypass opt-in requirement"
        });
      }
      
      setOtpSent(true);
      setSuccess("OTP sent! Check your WhatsApp for the verification code.");
      toast({ 
        title: "OTP Sent", 
        description: "Check your WhatsApp for the verification code",
        variant: "default" 
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
      toast({ 
        title: "Error Sending OTP", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    
    setIsVerifying(true);
    try {
      console.log("Verifying OTP for:", phone);
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: phone, otp: otp }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to verify OTP.');
      
      // Show success message
      setSuccess("Verification successful! Logging you in...");
      toast({ 
        title: "Verification Successful", 
        description: "Logging you in...",
        variant: "default"
      });
      
      // Wait a moment before redirect to show success state
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
      
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
      toast({ 
        title: "Verification Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {otpSent && !debugInfo?.usingTemplate && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            <span className="font-medium">WhatsApp delivery may take a moment. </span> 
            If you don't receive it, check that:
            <ul className="list-disc ml-5 mt-1 text-xs space-y-1">
              <li>Your number is correct and has WhatsApp</li>
              <li>You've messaged the sender number first (required for testing)</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {otpSent && debugInfo?.usingTemplate && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            <span className="font-medium">WhatsApp verification code sent! </span> 
            Using a message template to bypass the opt-in requirement.
          </AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="debug">
            <AccordionTrigger className="text-xs text-gray-500">
              Debug Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-xs bg-slate-50 p-2 rounded">
                Message ID: {debugInfo.messageId || 'N/A'}<br/>
                Status: {debugInfo.status || 'N/A'}<br/>
                {debugInfo.webhookUrl && (<>Webhook URL: {debugInfo.webhookUrl}<br/></>)}
                Using Template: {debugInfo.usingTemplate ? 'Yes' : 'No'}<br/>
                {debugInfo.templateId && (<>Template ID: {debugInfo.templateId}<br/></>)}
                Provider: {debugInfo.usingMetaIntegration ? 'Meta WhatsApp API' : 'Twilio'}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {debugInfo.troubleshooting && (
                  <>
                    <div className="font-medium">Troubleshooting Tips:</div>
                    <ul className="list-disc ml-4 mt-1">
                      {Object.values(debugInfo.troubleshooting).map((tip: any, i: number) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
        {!otpSent ? (
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+91... (with country code)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
              disabled={isLoading}
              className="focus-visible:ring-[#9b87f5]"
            />
            <p className="text-xs text-muted-foreground">
              Enter your phone number with country code (e.g., +1 for US)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp" className="block mb-1">Enter 6-Digit OTP</Label>
            <InputOTP 
              maxLength={6} 
              value={otp} 
              onChange={setOtp}
              disabled={isVerifying}
              className="gap-2 justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
                <InputOTPSlot index={1} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
                <InputOTPSlot index={2} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
                <InputOTPSlot index={3} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
                <InputOTPSlot index={4} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
                <InputOTPSlot index={5} className="border-[#9b87f5]/50 focus-within:border-[#9b87f5] h-12 w-10 text-lg" />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Enter the verification code sent to your WhatsApp
            </p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white" 
          disabled={isLoading || isVerifying}
        >
          {(isLoading || isVerifying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {otpSent ? (isVerifying ? 'Verifying...' : 'Verify OTP') : (isLoading ? 'Sending OTP...' : 'Send OTP')}
        </Button>

        {otpSent && (
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">
              Didn't receive the code? 
            </p>
            <Button 
              variant="link" 
              type="button" 
              onClick={() => { setOtpSent(false); setOtp(''); setSuccess(null); setDebugInfo(null); }} 
              className="text-sm text-[#9b87f5] w-full"
              disabled={isVerifying}
            >
              Use a different phone number
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={handleSendOtp}
              className="text-sm text-gray-500 w-full"
              disabled={isLoading || isVerifying}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Resending OTP...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

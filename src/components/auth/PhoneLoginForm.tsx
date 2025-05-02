import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhoneLoginFormProps {
  onLoginSuccess: () => void;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({ title: "Phone number required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // TODO: Implement Supabase function call 'send-otp'
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: phone }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to send OTP.');

      setOtpSent(true);
      toast({ title: "OTP Sent", description: "Check your WhatsApp for the OTP." });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({ title: "Error Sending OTP", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({ title: "OTP required", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      // TODO: Implement Supabase function call 'verify-otp'
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: phone, otp: otp }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to verify OTP.');
      
      // Assuming verify-otp returns session info on success
      // Need to manually set the session if verify-otp doesn't handle it
      if (data.session) {
         const { error: sessionError } = await supabase.auth.setSession(data.session);
         if (sessionError) {
            throw new Error(`Failed to set session: ${sessionError.message}`);
         }
         console.log("Session set successfully after OTP verification.");
         toast({ title: "Login Successful", description: "Welcome!" });
         onLoginSuccess(); // Callback to navigate to dashboard
      } else {
         // Fallback if verify-otp doesn't return session but confirms success
         // This might require a page reload or further action
         console.warn("OTP verified, but no session returned from function.");
         toast({ title: "Verification Successful", description: "Attempting to refresh session..." });
         // Attempt to refresh or get session manually
         const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
         if (session) {
            onLoginSuccess();
         } else {
            throw new Error("Could not establish session after OTP verification.");
         }
      }

    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast({ title: "Error Verifying OTP", description: error.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
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
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input 
            id="otp" 
            type="text" 
            inputMode="numeric" 
            autoComplete="one-time-code"
            placeholder="Enter OTP received on WhatsApp" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required 
            disabled={isVerifying}
          />
        </div>
      )}
      
      <Button type="submit" className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white" disabled={isLoading || isVerifying}>
        {(isLoading || isVerifying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {otpSent ? (isVerifying ? 'Verifying...' : 'Verify OTP') : (isLoading ? 'Sending OTP...' : 'Send OTP')}
      </Button>

      {otpSent && (
         <Button variant="link" type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-sm text-gray-500 w-full">
            Use a different phone number?
         </Button>
      )}
    </form>
  );
};


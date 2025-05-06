import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2, Send, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('evening');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  // Step 1: Send OTP to the phone number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName.trim()) {
      toast({ title: "Missing information", description: "Please enter your first name.", variant: "destructive" });
      return;
    }
    if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({ title: "Invalid phone number", description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the phone number
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Call the send-otp function
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { 
          phoneNumber: formattedPhone,
          templateId: import.meta.env.VITE_WHATSAPP_TEMPLATE_SID // Optional template ID
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to send OTP');
      }

      // Show OTP verification step
      setShowOtpVerification(true);
      toast({
        title: "OTP Sent",
        description: "Check your WhatsApp for the verification code.",
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and create subscription
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast({ title: "Invalid OTP", description: "Please enter the complete 6-digit OTP", variant: "destructive" });
      return;
    }

    setIsVerifying(true);

    try {
      // Format the phone number
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // First, verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: formattedPhone, otp }
      });

      if (verifyError || !verifyData?.success) {
        throw new Error(verifyError?.message || verifyData?.error || 'Failed to verify OTP');
      }

      // OTP verified, now create the subscription
      const { data: functionResult, error: functionError } = await supabase.functions.invoke(
        'create-free-subscription',
        {
          body: {
            phoneNumber: formattedPhone,
            firstName: firstName.trim(),
            deliveryTime: deliveryTime,
          }
        }
      );

      if (functionError || !functionResult?.success) {
        throw new Error(functionError?.message || functionResult?.error || 'Failed to create subscription');
      }

      // Show success state
      setSuccess(true);
      toast({
        title: "You're all set!",
        description: "Your free trial has started. Check WhatsApp for your first words!",
      });

      // Reset form after success
      setTimeout(() => {
        setPhoneNumber('');
        setFirstName('');
        setDeliveryTime('evening');
        setShowOtpVerification(false);
        setOtp('');
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error processing verification:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center p-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Success!</h3>
        <p className="text-gray-600 mb-4">Your free trial is active. Check WhatsApp for your first words!</p>
      </div>
    );
  }

  // OTP Verification Form
  if (showOtpVerification) {
    return (
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">Verify Your Phone</h3>
          <p className="text-gray-600 text-sm">Enter the 6-digit code sent to your WhatsApp</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                <InputOTPSlot index={0} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
                <InputOTPSlot index={1} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
                <InputOTPSlot index={2} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
                <InputOTPSlot index={3} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
                <InputOTPSlot index={4} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
                <InputOTPSlot index={5} className="border-primary/50 focus-within:border-primary h-12 w-10 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full font-medium", 
              isVerifying && "opacity-80"
            )}
            disabled={isVerifying || otp.length < 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>
            <Button
              type="button" 
              variant="ghost" 
              onClick={handleSendOtp}
              className="text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Resending...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setShowOtpVerification(false)}
              className="text-sm"
              disabled={isSubmitting || isVerifying}
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Initial Form
  return (
    <div className="relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Start Your Free Trial</h3>
        <p className="text-gray-600 text-sm">Get vocabulary words via WhatsApp for 3 days</p>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-4">
        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone">WhatsApp Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+91... (with country code)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">We'll send your daily words to this number</p>
        </div>

        {/* Delivery Time */}
        <div>
          <Label htmlFor="deliveryTime">Preferred Time</Label>
          <Select value={deliveryTime} onValueChange={setDeliveryTime}>
            <SelectTrigger id="deliveryTime">
              <SelectValue placeholder="Select delivery time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (7 AM)</SelectItem>
              <SelectItem value="noon">Noon (12 PM)</SelectItem>
              <SelectItem value="evening">Evening (7 PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={cn(
            "w-full font-medium", 
            isSubmitting && "opacity-80"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending OTP...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Get Verification Code
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-2">
          No credit card required. Cancel anytime.
        </p>
      </form>
    </div>
  );
};

export default SignupForm;

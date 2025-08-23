import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Send, Phone, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  step: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    step: 1,
    title: "Enter Your Details",
    description: "We'll send you a verification code on WhatsApp"
  },
  {
    step: 2, 
    title: "Verify Your Number",
    description: "Enter the 6-digit code we sent to your WhatsApp"
  }
];

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please enter your first name.", 
        variant: "destructive" 
      });
      return;
    }
    if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({ 
        title: "Invalid phone number", 
        description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { 
          phoneNumber: formattedPhone,
          templateId: import.meta.env.VITE_WHATSAPP_TEMPLATE_SID
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Failed to send OTP');
      }

      setCurrentStep(2);
      toast({
        title: "Code Sent!",
        description: "Check your WhatsApp for the verification code.",
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to send code",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast({ 
        title: "Invalid code", 
        description: "Please enter the complete 6-digit code", 
        variant: "destructive" 
      });
      return;
    }

    setIsVerifying(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // First, verify the OTP and create Supabase Auth user
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-trial-signup', {
        body: { 
          phoneNumber: formattedPhone, 
          otp,
          firstName: firstName.trim(),
          lastName: ''
        }
      });

      if (verifyError || !verifyData?.success) {
        throw new Error(verifyError?.message || verifyData?.error || 'Failed to verify code');
      }

      // Show success state
      setSuccess(true);
      toast({
        title: "🎉 You're in!",
        description: "Your first word will arrive shortly on WhatsApp.",
      });

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Glintup!</h3>
              <p className="text-gray-600 mb-6">Your free trial is active. Your first vocabulary word will arrive on WhatsApp shortly.</p>
              <div className="flex items-center justify-center space-x-2 text-primary">
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step) => (
                <div key={step.step} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep >= step.step 
                      ? "bg-primary text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {step.step}
                  </div>
                  {step.step < steps.length && (
                    <div className={cn(
                      "h-0.5 w-16 mx-2",
                      currentStep > step.step ? "bg-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
            </div>
          </div>

          {/* Current step content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Step 1: Phone number and name */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <Label htmlFor="firstName" className="text-base font-medium">First Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="pl-12 h-14 text-base border-2 rounded-2xl focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium">WhatsApp Number</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91... (with country code)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="pl-12 h-14 text-base border-2 rounded-2xl focus:border-primary"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">We'll send your vocabulary words to this number</p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                No credit card required • 3 days free • Cancel anytime
              </p>
            </form>
          )}

          {/* Step 2: OTP verification */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="otp" className="block text-base font-medium text-center">Enter Verification Code</Label>
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  disabled={isVerifying}
                  className="gap-3 justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                    <InputOTPSlot index={1} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                    <InputOTPSlot index={2} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                    <InputOTPSlot index={3} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                    <InputOTPSlot index={4} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                    <InputOTPSlot index={5} className="border-2 border-primary/30 focus-within:border-primary h-14 w-12 text-lg rounded-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={isVerifying || otp.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-500">Didn't receive the code?</p>
                <Button
                  type="button" 
                  variant="ghost" 
                  onClick={handleSendOtp}
                  className="text-sm text-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Resending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-gray-500"
                  disabled={isSubmitting || isVerifying}
                >
                  Change Phone Number
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
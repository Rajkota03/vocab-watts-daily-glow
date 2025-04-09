
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Setup form for OTP
  const form = useForm({
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic formatting - remove non-digit characters
    const formattedPhone = e.target.value.replace(/\D/g, '');
    setPhoneNumber(formattedPhone);
  };

  // Send OTP code to the phone number
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the phone with international code if not provided
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code sent to your phone",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the phone with international code if not provided
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+${phoneNumber}`;

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome to VocabSpark!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-10 w-10 text-vocab-teal" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {otpSent ? 'Verify your phone' : 'Login with phone'}
          </CardTitle>
          <CardDescription>
            {otpSent 
              ? 'Enter the code sent to your phone' 
              : 'Login to access your VocabSpark dashboard'}
          </CardDescription>
        </CardHeader>
        
        {!otpSent ? (
          // Step 1: Enter phone number
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="bg-gray-100 px-3 flex items-center rounded-l-md border border-r-0 border-input">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 1234567890"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="rounded-l-none"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Include your country code (e.g., +91 for India)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="vocab-btn w-full" 
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? 'Sending...' : 'Send verification code'}
              </Button>
            </CardFooter>
          </form>
        ) : (
          // Step 2: Enter OTP
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center py-2">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} index={index} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="vocab-btn w-full" 
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="text-sm"
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
              >
                Use a different phone number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Login;

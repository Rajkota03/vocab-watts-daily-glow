
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, Info, Send, Loader2 } from 'lucide-react';
import { sendVocabWords } from '@/services/whatsappService';
import { supabase } from '@/integrations/supabase/client';
import { createSubscription } from '@/services/subscriptionService';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if form was submitted successfully
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate inputs (basic validation)
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid WhatsApp number.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (step === 2) {
        if (!deliveryTime) {
          toast({
            title: "Please select a delivery time",
            description: "Choose when you want to receive your daily words.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        if (!email || !password) {
          toast({
            title: "Email and password required",
            description: "Please enter your email and create a password.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: "Password too short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log("Submitting form with:", { phoneNumber, deliveryTime, email });
      
      // Check if user already exists with this phone number
      const { data: existingSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .limit(1);
        
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        toast({
          title: "Phone number already registered",
          description: "This number is already registered for our service.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create user account with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || "User",
            last_name: lastName || "",
            whatsapp_number: phoneNumber
          }
        }
      });
      
      if (signUpError) {
        console.error("Error signing up:", signUpError);
        toast({
          title: "Account creation failed",
          description: signUpError.message || "Could not create your account. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create free trial subscription (not pro)
      const isPro = false;
      const subscriptionSuccess = await createSubscription({
        phoneNumber,
        deliveryTime,
        isPro, 
        category: 'daily' // Default category for free trial users
      });
      
      if (!subscriptionSuccess) {
        throw new Error('Failed to create subscription');
      }
      
      // Send first vocabulary words via WhatsApp
      const messageResult = await sendVocabWords({
        phoneNumber,
        deliveryTime
      });
      
      if (!messageResult) {
        console.warn('WhatsApp message sending failed, but subscription was created');
      }
      
      setSuccess(true);
      toast({
        title: "You're all set!",
        description: "Your 3-day free trial has started. You'll receive your first words shortly on WhatsApp.",
      });
      
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "We couldn't process your request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message if form was submitted successfully
  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your free trial has been activated. Your first vocabulary words will be sent to your WhatsApp shortly.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="space-y-2 mb-6">
        <h3 className="text-2xl font-bold mb-2 text-center">Get Started with GLINTUP</h3>
        <div className="flex items-center justify-center gap-2 bg-accent/10 text-dark px-3 py-2 rounded-lg">
          <Clock className="h-5 w-5" />
          <p className="font-medium">3-Day Free Trial</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                Enter WhatsApp number (+91...)
              </label>
              <Input 
                id="phone"
                type="tel" 
                placeholder="+91 your WhatsApp number" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="h-12"
              />
              <p className="mt-1.5 text-xs text-gray-500 flex items-start">
                <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                We never spam or share your number
              </p>
            </div>
            
            <Button 
              type="button" 
              className="w-full py-6 h-auto text-base"
              disabled={!phoneNumber || phoneNumber.trim().length < 10}
              onClick={() => {
                if(phoneNumber && phoneNumber.trim().length >= 10) {
                  setStep(2);
                } else {
                  toast({
                    title: "Invalid phone number",
                    description: "Please enter a valid WhatsApp number.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Continue
            </Button>
            
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-5">
            <div className="mb-2 animate-fade-in space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Create Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
                <p className="mt-1.5 text-xs text-gray-500 flex items-start">
                  <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                  Create a secure password for your account
                </p>
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium mb-1.5">
                  Choose delivery time
                </label>
                <Select value={deliveryTime} onValueChange={setDeliveryTime} required>
                  <SelectTrigger id="deliveryTime" className="h-12">
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">7:00 AM - Morning boost</SelectItem>
                    <SelectItem value="noon">12:00 PM - Lunch break learning</SelectItem>
                    <SelectItem value="evening">7:00 PM - Evening review</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-gray-500 flex items-start">
                  <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                  Pick when you want to receive your daily words
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting || !deliveryTime || !email || !password}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </>
                )}
              </Button>
            </div>
            
            <div className="pt-2 text-center">
              <p className="text-sm font-medium text-gray-800 mb-1">3-day free trial</p>
              <p className="text-xs text-gray-600">
                No credit card required. 5 words daily for 3 days.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignupForm;

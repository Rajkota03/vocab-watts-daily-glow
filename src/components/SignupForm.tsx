import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, Info, Send, Loader2, User } from 'lucide-react';
import { sendVocabWords } from '@/services/whatsappService';
import { supabase } from '@/integrations/supabase/client';
import { completeSubscription, checkSubscriptionExists } from '@/services/paymentService';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('evening'); // Default delivery time
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    checkSession();

    // Load Razorpay script for pro users (not needed for free trial, but keeping for future use)
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      console.log('Razorpay script loaded successfully');
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate phone number (basic validation)
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid WhatsApp number.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate required name fields
      if (!firstName.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter your first name.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (step === 2 && !deliveryTime) {
        toast({
          title: "Please select a delivery time",
          description: "Choose when you want to receive your daily words.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Submitting form with:", { phoneNumber, email, firstName, lastName, deliveryTime });
      
      // Check if subscription already exists for this phone number
      const exists = await checkSubscriptionExists(phoneNumber);
      if (exists) {
        toast({
          title: "Phone number already registered",
          description: "This WhatsApp number already has an active subscription. Please use a different number.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // First attempt to create the subscription
      // This relies on our updated RLS policy to allow unauthenticated inserts
      console.log("Creating free trial subscription...");
      const subscriptionResult = await completeSubscription({
        phoneNumber,
        deliveryTime,
        isPro: false, // Free trial
      });
      
      if (!subscriptionResult.success) {
        const errorMessage = subscriptionResult.error instanceof Error 
          ? subscriptionResult.error.message 
          : String(subscriptionResult.error || 'Unknown error');
          
        console.error("Failed to create subscription:", errorMessage);
        
        toast({
          title: "Something went wrong",
          description: errorMessage.includes('phone_number_key') 
            ? "This phone number already has an active subscription. Please use a different number."
            : `Failed to create subscription: ${errorMessage}`,
          variant: "destructive"
        });
        
        setIsSubmitting(false);
        return;
      }
      
      console.log("Subscription created successfully:", subscriptionResult.data);
      
      // If subscription is successful and we have an email, proceed with user creation
      if (email && password) {
        try {
          console.log("Creating user account with email:", email);
          
          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName || firstName,
                whatsapp_number: phoneNumber,
                delivery_time: deliveryTime
              }
            }
          });
          
          if (error) {
            console.error("Error signing up:", error);
            // We don't fail the process here since the subscription was already created
            toast({
              title: "Note",
              description: "Your trial was created but we couldn't create an account. You can still use the service via WhatsApp.",
            });
          } else {
            console.log("User created successfully:", data);
            toast({
              title: "Account created!",
              description: "Check your email to confirm your account.",
            });
          }
        } catch (authErr) {
          console.error("Auth error:", authErr);
          // We don't fail the process here since the subscription was already created
          toast({
            title: "Note",
            description: "Your trial was created but there was an issue with account creation. You can still use the service via WhatsApp.",
          });
        }
      } else {
        console.log("No email provided, skipping user creation");
      }
      
      // Now that subscription is created, send vocabulary words via WhatsApp
      try {
        console.log("Sending initial vocabulary words to:", phoneNumber);
        const messageResult = await sendVocabWords({
          phoneNumber,
          deliveryTime,
          sendImmediately: true // Flag to indicate immediate delivery
        });
        
        if (!messageResult) {
          console.warn('WhatsApp message sending failed, but subscription was created');
        } else {
          console.log('WhatsApp message sent successfully');
        }
      } catch (whatsappErr) {
        console.error('Error sending welcome WhatsApp message:', whatsappErr);
        // We don't fail the process here since the subscription was already created
      }
      
      // Show success message
      setSuccess(true);
      toast({
        title: "You're all set!",
        description: "You'll receive your first words shortly on WhatsApp.",
        variant: "success"
      });
      
      // Reset form after success
      setTimeout(() => {
        setPhoneNumber('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setDeliveryTime('evening');
        setStep(1);
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "We couldn't process your request. Please try again later.",
        variant: "destructive"
      });
      setIsSubmitting(false);
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
          Your first vocabulary words will be sent to your WhatsApp shortly.
        </p>
        <Button 
          onClick={() => {
            setPhoneNumber('');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            setDeliveryTime('evening');
            setStep(1);
            setSuccess(false);
          }}
        >
          Sign up another number
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
              <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="firstName"
                  type="text" 
                  placeholder="Your first name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 pl-10"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                Last Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                  id="lastName"
                  type="text" 
                  placeholder="Your last name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
            </div>
            
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
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email (optional)
              </label>
              <Input 
                id="email"
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            
            <Button 
              type="button" 
              className="w-full py-6 h-auto text-base"
              disabled={!phoneNumber || phoneNumber.trim().length < 10 || !firstName.trim()}
              onClick={() => {
                if(phoneNumber && phoneNumber.trim().length >= 10 && firstName.trim()) {
                  setStep(2);
                } else if (!firstName.trim()) {
                  toast({
                    title: "Missing information",
                    description: "Please enter your first name.",
                    variant: "destructive"
                  });
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
            <div className="mb-2 animate-fade-in">
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
              <p className="mt-1.5 text-xs text-green-600 flex items-start">
                <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                You'll get your first words immediately after signup!
              </p>
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
                disabled={isSubmitting || !deliveryTime}
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

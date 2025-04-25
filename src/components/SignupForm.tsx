
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, Info, Send, Loader2 } from 'lucide-react';
import { sendVocabWords } from '@/services/whatsappService';
import { supabase } from '@/integrations/supabase/client';
import { createRazorpayOrder, completeSubscription } from '@/services/paymentService';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Define the type for payment result
interface PaymentResult {
  success: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  error?: string;
}

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
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

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (orderData: any): Promise<PaymentResult> => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment system is loading",
        description: "Please wait a moment and try again.",
        variant: "destructive"
      });
      return { success: false, error: "Payment system not loaded" };
    }

    // If it's a free trial signup (not pro), skip payment
    if (orderData.freeSignup) {
      return { success: true };
    }

    return new Promise<PaymentResult>((resolve) => {
      const options = {
        key: 'rzp_test_YourTestKeyHere', // Replace with your Razorpay test key
        amount: orderData.amount,
        currency: 'INR',
        name: 'GLINTUP',
        description: 'Vocabulary Pro Subscription',
        order_id: orderData.id,
        prefill: {
          contact: phoneNumber
        },
        theme: {
          color: '#3F3D56'
        },
        handler: function(response: any) {
          // Payment successful
          console.log('Payment success:', response);
          resolve({
            success: true,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id
          });
        },
        modal: {
          ondismiss: function() {
            // Payment canceled
            console.log('Payment canceled');
            resolve({ success: false, error: 'Payment canceled' });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

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
      
      if (step === 2 && !deliveryTime) {
        toast({
          title: "Please select a delivery time",
          description: "Choose when you want to receive your daily words.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Submitting form with:", { phoneNumber, deliveryTime });
      
      // If not logged in, create an anonymous session
      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
          toast({
            title: "Authentication error",
            description: "We couldn't create a session for you. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Default to free trial
      const isPro = false;
      
      // Create Razorpay order
      const orderResult = await createRazorpayOrder({
        phoneNumber,
        deliveryTime,
        isPro
      });
      
      if (!orderResult.success) {
        throw new Error('Failed to create payment order');
      }
      
      // Initialize payment if needed
      const paymentResult = await handlePayment(orderResult.data);
      
      if (!paymentResult.success && !orderResult.data.freeSignup) {
        throw new Error('Payment failed or was canceled');
      }
      
      // Complete subscription process
      const subscriptionResult = await completeSubscription({
        phoneNumber,
        deliveryTime,
        isPro,
        razorpayOrderId: paymentResult.razorpayOrderId,
        razorpayPaymentId: paymentResult.razorpayPaymentId
      });
      
      if (!subscriptionResult.success) {
        throw new Error('Failed to create subscription');
      }
      
      // Send vocabulary words via WhatsApp
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
        description: "You'll receive your first words shortly on WhatsApp.",
      });
      
      // Reset form after success
      setTimeout(() => {
        setPhoneNumber('');
        setDeliveryTime('');
        setStep(1);
        setSuccess(false);
      }, 3000);
    } catch (error) {
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
          Your first vocabulary words will be sent to your WhatsApp shortly.
        </p>
        <Button 
          onClick={() => {
            setPhoneNumber('');
            setDeliveryTime('');
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

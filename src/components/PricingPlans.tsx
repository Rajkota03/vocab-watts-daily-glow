
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createRazorpayOrder, completeSubscription } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

const PricingPlans = () => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPlan, setCurrentPlan] = useState<{isPro: boolean, category?: string} | null>(null);
  
  const features = [
    "5 vocabulary words daily",
    "WhatsApp delivery",
    "Daily practice quizzes",
    "Example sentences"
  ];

  const proFeatures = [
    "Choose your category",
    "Custom delivery time",
    "Personalized difficulty",
    "Progress tracking",
    "10 vocabulary words daily"
  ];

  const handlePhoneNumberSubmit = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid WhatsApp number.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // If not logged in, create an anonymous session
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Error signing in anonymously:", error);
          throw new Error("Authentication error");
        }
      }
      
      if (!currentPlan) {
        throw new Error("No plan selected");
      }
      
      const { isPro, category } = currentPlan;
      
      // Create Razorpay order
      const orderResult = await createRazorpayOrder({
        phoneNumber,
        category,
        isPro,
        deliveryTime: 'morning' // Default delivery time
      });
      
      if (!orderResult.success) {
        throw new Error('Failed to create payment order');
      }
      
      // If it's a free trial signup (not pro), we complete the subscription directly
      if (!isPro) {
        const subscriptionResult = await completeSubscription({
          phoneNumber,
          deliveryTime: 'morning',
          isPro: false
        });
        
        if (!subscriptionResult.success) {
          throw new Error('Failed to create subscription');
        }
        
        toast({
          title: "Success!",
          description: "Your free trial is activated. You'll receive your first words shortly on WhatsApp.",
        });
        
        setOpenDialog(false);
        navigate('/dashboard');
        return;
      }
      
      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_YourTestKeyHere', // Replace with your Razorpay test key
        amount: orderResult.data.amount,
        currency: 'INR',
        name: 'GLINTUP',
        description: 'Vocabulary Pro Subscription',
        order_id: orderResult.data.id,
        prefill: {
          contact: phoneNumber
        },
        theme: {
          color: '#3F3D56'
        },
        handler: async function(response: any) {
          try {
            // Complete subscription after successful payment
            const subscriptionResult = await completeSubscription({
              phoneNumber,
              category,
              isPro: true,
              deliveryTime: 'morning',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            });
            
            if (!subscriptionResult.success) {
              throw new Error('Payment was successful but subscription creation failed');
            }
            
            toast({
              title: "Payment Successful!",
              description: "Your Pro subscription is now active. You'll receive your words on WhatsApp.",
            });
            
            setOpenDialog(false);
            navigate('/dashboard');
          } catch (error) {
            console.error('Error completing subscription after payment:', error);
            toast({
              title: "Error Completing Subscription",
              description: "Your payment was received but we couldn't complete your subscription setup. Please contact support.",
              variant: "destructive"
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process. Feel free to try again.",
              variant: "default"
            });
            setIsProcessingPayment(false);
            setOpenDialog(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "We couldn't set up your payment. Please try again later.",
        variant: "destructive"
      });
    } finally {
      if (!currentPlan?.isPro) {
        setIsProcessingPayment(false);
      }
    }
  };

  const handleSubscribe = (isPro: boolean, category?: string) => {
    setCurrentPlan({ isPro, category });
    setOpenDialog(true);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
        {/* Free Trial Card */}
        <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-2xl">Free Trial</CardTitle>
            <CardDescription>Try GLINTUP for 3 days</CardDescription>
            <div className="mt-4 text-3xl font-bold">₹0</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSubscribe(false)} 
              variant="outline" 
              className="w-full" 
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : "Start Free Trial"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan Card */}
        <Card className="border-2 border-primary shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold py-1 px-3 rounded-bl">
            MOST POPULAR
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro Plan</CardTitle>
            <CardDescription>All features unlocked</CardDescription>
            <div className="mt-4">
              <div className="text-3xl font-bold">₹149 <span className="text-sm font-normal text-gray-500">/month</span></div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[...features, ...proFeatures].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${index >= features.length ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={index >= features.length ? 'font-medium' : ''}>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSubscribe(true, 'business')} 
              className="w-full group" 
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : (
                <>
                  Subscribe Now
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Phone Number Collection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your WhatsApp Number</DialogTitle>
            <DialogDescription>
              Please enter your WhatsApp number with country code to receive vocabulary words.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. +919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Include country code (e.g., +91 for India)
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setOpenDialog(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePhoneNumberSubmit}
              disabled={isProcessingPayment || !phoneNumber.trim()}
            >
              {isProcessingPayment ? "Processing..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricingPlans;

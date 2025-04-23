import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createRazorpayOrder, completeSubscription } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingPlans = () => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPlan, setCurrentPlan] = useState<{isPro: boolean, category?: string} | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  useEffect(() => {
    const loadRazorpay = async () => {
      if (typeof window.Razorpay === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          setRazorpayLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          toast({
            title: "Payment System Error",
            description: "Failed to load payment system. Please try again later.",
            variant: "destructive"
          });
        };
        document.body.appendChild(script);
      } else {
        setRazorpayLoaded(true);
      }
    };

    loadRazorpay();
  }, []);

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

  const handleSubscribeFree = () => {
    setCurrentPlan({ isPro: false });
    setOpenDialog(true);
  };

  const handleSubscribePro = () => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment System Loading",
        description: "Please wait while we initialize the payment system.",
        variant: "default"
      });
      return;
    }
    setCurrentPlan({ isPro: true, category: 'business' });
    setOpenDialog(true);
  };

  const handlePhoneNumberSubmit = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid WhatsApp number with country code.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (!currentPlan) throw new Error("No plan selected");
      const { isPro, category } = currentPlan;
      
      const orderResult = await createRazorpayOrder({
        phoneNumber,
        category,
        isPro
      });
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      if (!isPro) {
        const subscriptionResult = await completeSubscription({
          phoneNumber,
          isPro: false,
          deliveryTime: 'morning'
        });
        
        if (!subscriptionResult.success) {
          throw new Error('Failed to create subscription');
        }
        
        toast({
          title: "Success!",
          description: "Your free trial is activated. You'll receive your first words shortly.",
        });
        
        setOpenDialog(false);
        navigate('/dashboard');
        return;
      }

      const options = {
        key: orderResult.data.key,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: 'GLINTUP',
        description: 'Vocabulary Pro Subscription',
        order_id: orderResult.data.id,
        handler: async function(response: any) {
          try {
            const subscriptionResult = await completeSubscription({
              phoneNumber,
              category,
              isPro: true,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              deliveryTime: 'morning'
            });

            if (!subscriptionResult.success) {
              throw new Error('Payment successful but subscription creation failed');
            }

            toast({
              title: "Payment Successful!",
              description: "Your Pro subscription is now active.",
            });

            setOpenDialog(false);
            navigate('/dashboard');
          } catch (error) {
            console.error('Error completing subscription:', error);
            toast({
              title: "Error",
              description: "Payment successful but subscription setup failed. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Feel free to try again.",
            });
          }
        },
        prefill: {
          contact: phoneNumber
        },
        theme: {
          color: '#3F3D56'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "We couldn't process your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
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
              onClick={handleSubscribeFree}
              variant="outline" 
              className="w-full" 
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : "Start Free Trial"}
            </Button>
          </CardFooter>
        </Card>

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
              onClick={handleSubscribePro}
              className="w-full group" 
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe Now
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

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
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricingPlans;

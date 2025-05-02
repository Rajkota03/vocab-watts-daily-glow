
import React, { useState } from 'react'; // Added useState for loading state
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from '@/components/auth/RegisterForm'; // Assuming this handles user input
import { Button } from '@/components/ui/button'; // Import Button if RegisterForm doesn't handle submit
import { ArrowRight, BadgeDollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { RegisterFormValues } from '@/types/auth';
import { completeSubscription } from '@/services/paymentService'; // Import completeSubscription

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRO_PLAN_AMOUNT_PAISA = 24900; // ₹249 in paisa
const PRO_PLAN_DISPLAY_PRICE = "₹249";

const Upgrade = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePaymentVerification = async (response: any, values: RegisterFormValues) => {
    setIsLoading(true);
    console.log("Razorpay response received:", response);
    try {
      // Call a new Supabase function to verify the payment on the server-side
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          // Pass user details needed to create/update subscription
          email: values.email,
          password: values.password, // Consider security implications of passing password
          firstName: values.firstName,
          lastName: values.lastName,
          whatsappNumber: values.whatsappNumber,
          // Add deliveryTime if needed for Pro subscription creation
        }
      });

      if (verificationError) {
        console.error("Payment verification failed:", verificationError);
        throw new Error(verificationError.message || "Payment verification failed. Please contact support.");
      }

      if (!verificationData?.success) {
         console.error("Payment verification unsuccessful:", verificationData?.error);
         throw new Error(verificationData?.error || "Payment verification failed. Please contact support.");
      }

      // Payment verified successfully, user/subscription created/updated on backend
      console.log("Payment verified and subscription updated:", verificationData);
      toast({
        title: "Welcome to Glintup Pro! 🎉",
        description: "Your Pro subscription is now active.",
        variant: "success"
      });
      navigate('/dashboard'); // Redirect to dashboard on success

    } catch (error: any) {
      console.error("Error during payment verification or user creation:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred during payment verification. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    console.log("Starting Pro upgrade process for:", values.email);
    try {
      // 1. Create Razorpay Order
      console.log("Creating Razorpay order with amount:", PRO_PLAN_AMOUNT_PAISA);
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: PRO_PLAN_AMOUNT_PAISA } // Use the correct amount
      });

      if (orderError) {
        console.error("Error creating Razorpay order:", orderError);
        throw new Error(orderError.message || "Could not initiate payment. Please try again.");
      }

      if (!orderData?.id) {
        console.error("Invalid order data received:", orderData);
        throw new Error("Failed to get payment order details. Please try again.");
      }

      console.log("Razorpay order created:", orderData);

      // 2. Configure and Open Razorpay Checkout
      const options = {
        key: orderData.key, // Use key from orderData
        amount: orderData.amount,
        currency: "INR",
        name: "Glintup",
        description: "Pro Plan Subscription",
        order_id: orderData.id,
        prefill: {
          name: `${values.firstName} ${values.lastName || ''}`.trim(),
          email: values.email,
          contact: values.whatsappNumber
        },
        theme: {
          color: "#9b87f5" // Theme color
        },
        handler: (response: any) => {
          // This function is called upon successful payment capture by Razorpay
          // Now, verify the payment on the backend
          handlePaymentVerification(response, values);
        },
        modal: {
          ondismiss: () => {
            console.log("Razorpay checkout modal dismissed");
            setIsLoading(false); // Re-enable button if modal is closed
            toast({ title: "Payment Cancelled", description: "The payment process was cancelled.", variant: "default" });
          }
        }
      };

      // Ensure Razorpay script is loaded (should ideally be checked earlier)
      if (!window.Razorpay) {
        console.error("Razorpay SDK not loaded");
        throw new Error("Payment gateway is not available. Please refresh the page.");
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      // Note: We don't set isLoading to false here, it's handled by the handler or ondismiss

    } catch (error: any) {
      console.error("Error during upgrade process:", error);
      toast({
        title: "Upgrade Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false); // Ensure loading is stopped on error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Upgrade to Glintup Pro
        </h1>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left side - Registration form */}
          <Card className="border border-gray-200 shadow-lg bg-white rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-semibold text-gray-800">1. Create Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pass onSubmit and isLoading to RegisterForm */}
              <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
              {/* If RegisterForm doesn't have its own submit button, add one here */}
              {/* Example: */}
              {/* <Button type="submit" form="register-form-id" disabled={isLoading} className="w-full mt-4"> */}
              {/*   {isLoading ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'} */}
              {/* </Button> */}
            </CardContent>
          </Card>

          {/* Right side - Pricing box */}
          <Card className="border-2 border-purple-500 shadow-xl bg-white rounded-xl sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-gray-800">
                <BadgeDollarSign className="h-6 w-6 text-purple-600" />
                2. Pro Plan Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-center">
                 <span className="text-4xl font-bold text-purple-600">{PRO_PLAN_DISPLAY_PRICE}</span>
                 <span className="text-base font-normal text-gray-500"> / month</span>
              </div>

              <ul className="space-y-2.5 text-sm text-gray-700">
                {[
                  "Up to 5 vocabulary words daily",
                  "All categories unlocked (Business, Exams, etc.)",
                  "Advanced difficulty levels",
                  "Custom delivery time scheduling",
                  "Detailed progress tracking",
                  "Example sentences & usage context",
                  "Priority support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-800 text-center">
                  Complete your account details and proceed to secure payment via Razorpay. Your Pro access activates instantly upon successful payment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;


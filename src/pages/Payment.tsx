
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ArrowRight, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import type { RegisterFormValues } from '@/types/auth';

interface LocationState {
  plan: {
    isPro: boolean;
    price?: number;
    category?: string;
  };
}

const Payment = () => {
  const location = useLocation();
  const { plan } = (location.state as LocationState) || {};
  const { toast } = useToast();
  const navigate = useNavigate();
  const razorpayLoaded = useRazorpay();
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    if (!razorpayLoaded) {
      toast({
        title: "Payment system loading",
        description: "Please wait for the payment system to load and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: 249 * 100 } // Convert to paise (₹249)
      });

      if (orderError) throw orderError;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "GLINTUP",
        description: "Pro Plan Subscription",
        order_id: orderData.id,
        prefill: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          contact: values.whatsappNumber
        },
        theme: {
          color: "#9b87f5"
        },
        handler: async function(response: any) {
          try {
            // Create user account
            const { error: signUpError } = await supabase.auth.signUp({
              email: values.email,
              password: values.password,
              options: {
                data: {
                  first_name: values.firstName,
                  last_name: values.lastName,
                  nick_name: values.nickName || null,
                  whatsapp_number: values.whatsappNumber,
                  is_pro: true,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id
                }
              }
            });

            if (signUpError) throw signUpError;

            toast({
              title: "Welcome to GLINTUP Pro! 🎉",
              description: "Your account has been created successfully.",
            });

            navigate('/dashboard');
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!plan) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9b87f5]/10 to-[#7E69AB]/10 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] to-[#7E69AB]">
          Subscribe to Pro Plan - ₹249/month
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Registration form */}
          <Card className="border border-gray-100/50 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <RegisterForm onSubmit={handleSubmit} isLoading={isProcessingPayment} />
            </CardContent>
          </Card>

          {/* Right side - Pricing box */}
          <Card className="border-2 border-[#9b87f5] shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Pro Plan Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-3xl font-bold text-[#9b87f5]">
                ₹249 <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              
              <ul className="space-y-3">
                {[
                  "10 vocabulary words daily",
                  "Choose your category",
                  "Custom delivery time",
                  "Personalized difficulty",
                  "Progress tracking",
                  "Example sentences",
                  "Daily practice quizzes",
                  "Priority support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <ArrowRight className="h-4 w-4 text-[#9b87f5]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-800">
                  Fill in your details and click "Create Account" to proceed with secure Razorpay payment. Your Pro access will be activated immediately after successful payment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;


import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
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
        description: "GLINTUP Pro Plan - Learn vocabulary on WhatsApp",
        image: "https://your-domain.com/logo.svg",
        order_id: orderData.id,
        prefill: {
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          contact: values.whatsappNumber
        },
        theme: {
          color: "#00A79D" // Use brand primary color
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <div className="w-full py-4 px-6 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <Link to="/" className="flex items-center">
            <img src="/logo-horizontal.svg" alt="GLINTUP" className="h-8" />
          </Link>
          
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscribe to Pro Plan
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                ₹249/month - Premium vocabulary learning experience
              </p>
              <div className="flex items-center gap-2 justify-center">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">Secure Payment with Razorpay</span>
              </div>
            </div>
            
            {/* Registration form */}
            <RegisterForm onSubmit={handleSubmit} isLoading={isProcessingPayment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

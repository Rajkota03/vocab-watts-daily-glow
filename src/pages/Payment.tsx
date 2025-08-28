
import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
import { usePricing } from '@/hooks/usePricing';
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
  const { getEffectivePrice, getPriceDisplay, getOriginalPriceDisplay, hasActiveDiscount, isLoading } = usePricing();

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
      const currentPrice = getEffectivePrice();
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: currentPrice * 100 } // Convert to paise (current price)
      });

      if (orderError) throw orderError;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "GLINTUP",
        description: `GLINTUP Pro Plan - Learn vocabulary on WhatsApp - ${getPriceDisplay()}/month`,
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
      {/* Header - Consistent with Home Page */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 shadow-md backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" alt="Glintup" className="h-8" />
          </Link>
          
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* Content */}
      <div className="flex items-center justify-center p-4 pt-24">{/* Added pt-24 for navbar spacing */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscribe to Pro Plan
              </h2>
              {isLoading ? (
                <p className="text-gray-600 text-sm mb-4">
                  Loading pricing...
                </p>
              ) : (
                <div className="mb-4">
                  {hasActiveDiscount() ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-lg font-bold text-primary">{getPriceDisplay()}/month</span>
                        <span className="text-sm text-gray-500 line-through">{getOriginalPriceDisplay()}/month</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                          LIMITED OFFER!
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Premium vocabulary learning experience - Special discount applied!
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {getPriceDisplay()}/month - Premium vocabulary learning experience
                    </p>
                  )}
                </div>
              )}
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

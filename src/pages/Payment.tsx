
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneNumberDialog } from '@/components/payment/PhoneNumberDialog';
import { usePaymentHandler } from '@/hooks/usePaymentHandler';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Lock, CreditCard, DollarSign, CheckCircle } from 'lucide-react';

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
  const razorpayLoaded = useRazorpay();
  
  const {
    isProcessingPayment,
    openDialog,
    setOpenDialog,
    phoneNumber,
    setPhoneNumber,
    handlePhoneNumberSubmit,
  } = usePaymentHandler({ razorpayLoaded });

  if (!plan) {
    return <Navigate to="/" replace />;
  }

  const features = plan.isPro ? [
    "10 vocabulary words daily",
    "Choose your category",
    "Custom delivery time",
    "Personalized difficulty",
    "Progress tracking"
  ] : [
    "5 vocabulary words daily",
    "WhatsApp delivery",
    "Daily practice quizzes",
    "Example sentences"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your {plan.isPro ? 'Pro' : 'Free Trial'} Subscription
          </h1>
          <p className="text-gray-600">
            You're just one step away from expanding your vocabulary
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="font-medium">Plan</span>
                  <span className="text-primary font-semibold">
                    {plan.isPro ? 'Pro Plan' : 'Free Trial'}
                  </span>
                </div>
                {plan.isPro && (
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="font-medium">Amount</span>
                    <span className="text-xl font-bold">₹149/month</span>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium">Included Features:</h4>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.isPro ? (
                  <>
                    <Lock className="h-5 w-5 text-primary" />
                    Payment Details
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-primary" />
                    Activate Trial
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {plan.isPro 
                  ? "Secure payment processed by Razorpay"
                  : "Start your free trial now"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">How it works:</p>
                      <p className="text-sm text-blue-800 mt-1">
                        1. {plan.isPro ? "Complete your payment" : "Start your free trial"}
                        <br />
                        2. Add your WhatsApp number
                        <br />
                        3. Start receiving daily vocabulary words
                      </p>
                    </div>
                  </div>
                </div>
                {plan.isPro && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>Your payment is secured with 256-bit encryption</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <button
                onClick={() => setOpenDialog(true)}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>Processing...</>
                ) : plan.isPro ? (
                  <>
                    <DollarSign className="h-5 w-5" />
                    Proceed to Payment
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <PhoneNumberDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        onSubmit={handlePhoneNumberSubmit}
        isProcessing={isProcessingPayment}
      />
    </div>
  );
};

export default Payment;

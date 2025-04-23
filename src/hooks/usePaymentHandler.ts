
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { createRazorpayOrder, completeSubscription } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';

interface PaymentHandlerOptions {
  razorpayLoaded: boolean;
}

export const usePaymentHandler = ({ razorpayLoaded }: PaymentHandlerOptions) => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPlan, setCurrentPlan] = useState<{isPro: boolean, category?: string} | null>(null);

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

  return {
    isProcessingPayment,
    openDialog,
    setOpenDialog,
    phoneNumber,
    setPhoneNumber,
    currentPlan,
    handlePhoneNumberSubmit,
    handleSubscribeFree,
    handleSubscribePro
  };
};

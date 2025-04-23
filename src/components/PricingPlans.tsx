
import React from 'react';
import { PricingPlanCard } from './payment/PricingPlanCard';
import { PhoneNumberDialog } from './payment/PhoneNumberDialog';
import { useRazorpay } from '@/hooks/useRazorpay';
import { usePaymentHandler } from '@/hooks/usePaymentHandler';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PricingPlans = () => {
  const razorpayLoaded = useRazorpay();
  const {
    isProcessingPayment,
    openDialog,
    setOpenDialog,
    phoneNumber,
    setPhoneNumber,
    currentPlan,
    handlePhoneNumberSubmit,
    handleSubscribeFree,
    handleSubscribePro
  } = usePaymentHandler({ razorpayLoaded });

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
        <PricingPlanCard 
          onSubscribe={handleSubscribeFree}
          isProcessing={isProcessingPayment}
        />
        <PricingPlanCard 
          isPro
          onSubscribe={handleSubscribePro}
          isProcessing={isProcessingPayment}
        />
      </div>

      <PhoneNumberDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        onSubmit={handlePhoneNumberSubmit}
        isProcessing={isProcessingPayment}
      />
    </>
  );
};

export default PricingPlans;

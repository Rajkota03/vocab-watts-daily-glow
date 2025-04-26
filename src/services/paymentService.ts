
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

export interface PaymentData {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
  deliveryTime?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

// Create a payment order with Razorpay
export const createRazorpayOrder = async (data: Omit<PaymentData, 'razorpayOrderId' | 'razorpayPaymentId'>) => {
  try {
    // For free trial, skip Razorpay order creation
    if (!data.isPro) {
      console.log('Free trial signup, skipping Razorpay order creation');
      return { success: true, data: { freeSignup: true } };
    }

    const { data: orderData, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        phoneNumber: data.phoneNumber,
        category: data.category,
        isPro: data.isPro
      }
    });

    if (error) {
      console.error('Error creating Razorpay order:', error);
      return { success: false, error };
    }

    console.log('Razorpay order created:', orderData);
    return { success: true, data: orderData.data };
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    return { success: false, error };
  }
};

// Complete subscription after successful payment
export const completeSubscription = async (data: PaymentData) => {
  try {
    // Get current authenticated user
    const { data: authData } = await supabase.auth.getSession();
    
    // If not authenticated, we'll store the subscription without a user_id
    const userId = authData.session?.user?.id;
    
    // Calculate trial end date (3 days from now)
    const trialEndsAt = addDays(new Date(), 3).toISOString();
    
    // Calculate subscription end date for pro users (30 days from now)
    const subscriptionEndsAt = data.isPro 
      ? addDays(new Date(), 30).toISOString() 
      : null;
    
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        phone_number: data.phoneNumber,
        is_pro: data.isPro,
        category: data.isPro ? data.category : null,
        trial_ends_at: trialEndsAt,
        subscription_ends_at: subscriptionEndsAt,
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: data.razorpayPaymentId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error };
    }
    
    console.log('Subscription created:', subscription);
    return { success: true, data: subscription };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return { success: false, error };
  }
};

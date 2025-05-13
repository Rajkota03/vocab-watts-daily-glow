import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { ManualSubscriptionValues } from '@/types/auth';

export interface PaymentData {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
  deliveryTime?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  userId?: string; // Add userId parameter
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

// Check if a subscription exists for a phone number
export const checkSubscriptionExists = async (phoneNumber: string) => {
  try {
    console.log('Checking if subscription exists for phone number:', phoneNumber);
    const { data, error, count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact' })
      .eq('phone_number', phoneNumber);
    
    if (error) {
      console.error('Error checking for existing subscription:', error);
      throw error;
    }
    
    console.log('Subscription check result:', { count, exists: count && count > 0 });
    return count && count > 0;
  } catch (error) {
    console.error('Failed to check subscription:', error);
    throw error;
  }
};

// Complete subscription after successful payment
export const completeSubscription = async (data: PaymentData) => {
  try {
    console.log('Completing subscription with data:', {
      phoneNumber: data.phoneNumber,
      isPro: data.isPro,
      category: data.category || null,
      deliveryTime: data.deliveryTime || null,
      userId: data.userId || null
    });
    
    // First check if subscription already exists
    let subscriptionExists = false;
    try {
      subscriptionExists = await checkSubscriptionExists(data.phoneNumber);
      if (subscriptionExists) {
        console.log('Subscription already exists for phone number:', data.phoneNumber);
        return { 
          success: false, 
          error: 'A subscription already exists for this phone number. Please use a different number.' 
        };
      }
    } catch (checkError) {
      console.error('Error during subscription check:', checkError);
      // Continue with subscription creation even if check fails
    }
    
    // Get current authenticated user if no userId was provided
    let userId = data.userId;
    if (!userId) {
      const { data: authData } = await supabase.auth.getSession();
      userId = authData.session?.user?.id;
    }
    
    console.log('User ID for subscription:', userId || 'No user ID available');
    
    // Calculate trial end date (3 days from now)
    const trialEndsAt = addDays(new Date(), 3).toISOString();
    
    // Calculate subscription end date for pro users (30 days from now)
    const subscriptionEndsAt = data.isPro 
      ? addDays(new Date(), 30).toISOString() 
      : null;
    
    // Prepare subscription data
    let subscriptionData: any = {
      phone_number: data.phoneNumber,
      is_pro: data.isPro,
      category: data.isPro ? data.category : null,
      trial_ends_at: trialEndsAt,
      subscription_ends_at: subscriptionEndsAt,
    };
    
    // Add user_id only if we have one
    if (userId) {
      subscriptionData.user_id = userId;
      console.log(`Associating subscription with user ID: ${userId}`);
    } else {
      console.log('Creating subscription without user ID (unauthenticated)');
    }
    
    // Only add Razorpay data for paid subscriptions
    if (data.isPro && data.razorpayOrderId && data.razorpayPaymentId) {
      subscriptionData.razorpay_order_id = data.razorpayOrderId;
      subscriptionData.razorpay_payment_id = data.razorpayPaymentId;
    }

    console.log('Inserting subscription with data:', JSON.stringify(subscriptionData));

    // Use public access for subscription creation
    // The RLS policy now allows public insertions
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      if (error.code === '23505' && error.message?.includes('user_subscriptions_phone_number_key')) {
        return { 
          success: false, 
          error: 'This phone number already has an active subscription. Please use a different number.' 
        };
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Subscription created successfully:', subscription);
    
    // For free trial, also trigger the WhatsApp message to be sent
    if (!data.isPro) {
      try {
        console.log('Sending welcome WhatsApp message to:', data.phoneNumber);
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            to: data.phoneNumber,
            category: 'general',
            isPro: false,
            sendImmediately: true
          }
        });
        
        if (whatsappError) {
          console.error('Error sending welcome WhatsApp message:', whatsappError);
          // We don't fail the subscription creation if WhatsApp fails
        } else {
          console.log('Welcome WhatsApp message sent:', whatsappResult);
        }
      } catch (whatsappErr) {
        console.error('Failed to send welcome WhatsApp message:', whatsappErr);
      }
    }
    
    return { success: true, data: subscription };
  } catch (error: any) {
    console.error('Failed to create subscription:', error);
    return { success: false, error: error.message || 'Failed to create subscription' };
  }
};

// Add a new function to manually add a subscription
export const addManualSubscription = async (data: ManualSubscriptionValues) => {
  try {
    console.log('Adding manual subscription with data:', {
      phoneNumber: data.phoneNumber,
      userId: data.userId || null,
      isPro: data.isPro !== undefined ? data.isPro : false,
      category: data.category || 'daily-beginner',
      deliveryTime: data.deliveryTime || null
    });
    
    // Check if a subscription already exists for this phone number
    const exists = await checkSubscriptionExists(data.phoneNumber);
    if (exists) {
      return { 
        success: false, 
        error: 'A subscription already exists for this phone number.' 
      };
    }
    
    // Format the phone number if needed
    const formattedPhone = data.phoneNumber.startsWith('+') 
      ? data.phoneNumber 
      : `+${data.phoneNumber}`;
    
    // Calculate trial end date (3 days from now)
    const trialEndsAt = addDays(new Date(), 3).toISOString();
    
    // Calculate subscription end date for pro users (30 days from now)
    const subscriptionEndsAt = data.isPro 
      ? addDays(new Date(), 30).toISOString() 
      : null;
    
    // Prepare subscription data
    let subscriptionData: any = {
      phone_number: formattedPhone,
      is_pro: data.isPro !== undefined ? data.isPro : false,
      category: data.category || 'daily-beginner',
      trial_ends_at: trialEndsAt,
      subscription_ends_at: subscriptionEndsAt,
      delivery_time: data.deliveryTime || null
    };
    
    // Add user_id only if we have one
    if (data.userId) {
      subscriptionData.user_id = data.userId;
    }
    
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      return { 
        success: false, 
        error: `Failed to add subscription: ${error.message}` 
      };
    }
    
    return { 
      success: true, 
      data: subscription 
    };
    
  } catch (error: any) {
    console.error('Failed to add manual subscription:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to add subscription' 
    };
  }
};

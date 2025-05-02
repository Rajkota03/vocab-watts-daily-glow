
import { supabase } from '@/integrations/supabase/client';
import { addDays, isAfter } from 'date-fns'; // Added isAfter
import { Database } from '@/integrations/supabase/types';

export interface SubscriptionData {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
  deliveryTime?: string;
}

// Define types for our database tables
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row'];

/**
 * Checks if the user associated with the given userId has an active Pro subscription.
 * @param userId The ID of the user to check.
 * @returns True if the user has an active Pro subscription, false otherwise.
 */
export const checkUserProStatus = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.log('checkUserProStatus: No userId provided.');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('is_pro, subscription_ends_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        console.log(`checkUserProStatus: No subscription found for user ${userId}`);
        return false;
      }
      console.error(`checkUserProStatus: Error fetching subscription for user ${userId}:`, error);
      return false; // Assume not Pro if there's an error
    }

    if (!data) {
        console.log(`checkUserProStatus: No subscription data returned for user ${userId}`);
        return false;
    }

    // Check if is_pro is true and the subscription end date is in the future
    const isActivePro = data.is_pro === true && 
                        data.subscription_ends_at && 
                        isAfter(new Date(data.subscription_ends_at), new Date());

    console.log(`checkUserProStatus for user ${userId}: is_pro=${data.is_pro}, ends_at=${data.subscription_ends_at}, isActivePro=${isActivePro}`);
    return isActivePro;

  } catch (error) {
    console.error(`checkUserProStatus: Unexpected error for user ${userId}:`, error);
    return false;
  }
};


/* --- Deprecated Function ---
 * Subscription creation is now handled by the paymentService and verify-razorpay-payment function.
 *
export const createSubscription = async (data: SubscriptionData) => {
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
        subscription_ends_at: subscriptionEndsAt
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subscription:', error);
      return false;
    }
    
    console.log('Subscription created:', subscription);
    return true;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return false;
  }
};
*/

/* --- Potentially Deprecated Function ---
 * Word fetching logic might be better placed in wordService.ts
 *
export const getVocabWordsByCategory = async (category?: string) => {
  try {
    let query = supabase
      .from('vocabulary_words')
      .select('*');
    
    if (category) {
      query = query.eq('category', category);
    } else {
      query = query.eq('category', 'general');
    }
    
    query = query.limit(5);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching vocabulary words:', error);
      return null;
    }
    
    return data as VocabularyWord[];
  } catch (error) {
    console.error('Failed to fetch vocabulary words:', error);
    return null;
  }
};
*/


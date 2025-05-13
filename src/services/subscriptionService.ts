
import { supabase } from '@/integrations/supabase/client';
import { isAfter, addDays } from 'date-fns'; 
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

/**
 * Ensures that a user has a subscription record with the correct user_id
 * This helps maintain consistency between the profiles and user_subscriptions tables
 * @param userId The ID of the user
 * @param phoneNumber Optional phone number to use
 */
export const ensureUserSubscription = async (userId: string, phoneNumber?: string): Promise<void> => {
  if (!userId) {
    console.log('ensureUserSubscription: No userId provided.');
    return;
  }
  
  try {
    // First, check if a subscription exists
    const { data, error, count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
      
    if (error) {
      console.error(`ensureUserSubscription: Error checking subscription for user ${userId}:`, error);
      return;
    }
    
    // If no subscription exists, create one
    if (!count || count === 0) {
      // If we don't have a phone number provided, try to get it from the profile
      let phoneToUse = phoneNumber;
      
      if (!phoneToUse) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('whatsapp_number')
          .eq('id', userId)
          .single();
          
        if (profileData && profileData.whatsapp_number) {
          phoneToUse = profileData.whatsapp_number;
        }
      }
      
      // Create a new subscription with default values
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          phone_number: phoneToUse || '',
          is_pro: false,
          category: 'daily-beginner'
        });
        
      if (insertError) {
        console.error(`ensureUserSubscription: Error creating subscription for user ${userId}:`, insertError);
      } else {
        console.log(`ensureUserSubscription: Created new subscription for user ${userId}`);
      }
    }
  } catch (error) {
    console.error(`ensureUserSubscription: Unexpected error for user ${userId}:`, error);
  }
};

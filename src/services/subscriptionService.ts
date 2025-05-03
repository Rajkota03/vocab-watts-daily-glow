
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

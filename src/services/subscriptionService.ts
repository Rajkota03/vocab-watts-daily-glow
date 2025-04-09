
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';

export interface SubscriptionData {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
}

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
    
    return data;
  } catch (error) {
    console.error('Failed to fetch vocabulary words:', error);
    return null;
  }
};

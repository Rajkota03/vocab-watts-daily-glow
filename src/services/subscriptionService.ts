
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
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
        category: data.isPro ? data.category : 'daily', // Free trial users only get the daily category
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
    
    // Save trial end date in user metadata for easy access
    if (userId) {
      await supabase.auth.updateUser({
        data: { 
          trial_ends_at: trialEndsAt,
          subscription_ends_at: subscriptionEndsAt,
          is_pro: data.isPro,
          category: data.isPro ? data.category : 'daily'
        }
      });
    }
    
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
    
    return data as VocabularyWord[];
  } catch (error) {
    console.error('Failed to fetch vocabulary words:', error);
    return null;
  }
};

// Check subscription status to see if a user's trial or subscription is still valid
export const checkSubscriptionStatus = async (userId?: string): Promise<{isActive: boolean, isPro: boolean, trialEndsAt?: Date | null, subscriptionEndsAt?: Date | null}> => {
  try {
    if (!userId) {
      const { data } = await supabase.auth.getSession();
      userId = data.session?.user?.id;
      if (!userId) return { isActive: false, isPro: false };
    }
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('is_pro, trial_ends_at, subscription_ends_at')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error checking subscription status:', error);
      return { isActive: false, isPro: false };
    }
    
    const now = new Date();
    const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
    const subscriptionEndsAt = data.subscription_ends_at ? new Date(data.subscription_ends_at) : null;
    
    // Check if trial is still active
    const isTrialActive = trialEndsAt ? now < trialEndsAt : false;
    
    // Check if paid subscription is active
    const isSubscriptionActive = subscriptionEndsAt ? now < subscriptionEndsAt : false;
    
    return {
      isActive: isTrialActive || isSubscriptionActive,
      isPro: data.is_pro && isSubscriptionActive,
      trialEndsAt,
      subscriptionEndsAt
    };
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return { isActive: false, isPro: false };
  }
};

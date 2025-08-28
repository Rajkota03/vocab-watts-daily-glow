import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingData {
  original_price: number;
  discounted_price?: number;
  discount_enabled: boolean;
  currency: string;
  billing_cycle: string;
}

export const usePricing = (planName: string = 'pro') => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use direct table query for better real-time updates
      const { data, error } = await supabase
        .from('pricing_config')
        .select('original_price, discounted_price, discount_enabled, currency, billing_cycle')
        .eq('plan_name', planName)
        .single();

      if (error) throw error;

      if (data) {
        setPricing({
          original_price: Number(data.original_price),
          discounted_price: data.discounted_price ? Number(data.discounted_price) : undefined,
          discount_enabled: data.discount_enabled,
          currency: data.currency,
          billing_cycle: data.billing_cycle
        });
      }
    } catch (err: any) {
      console.error('Error fetching pricing:', err);
      setError(err.message);
      // Fallback to default pricing if fetch fails
      setPricing({
        original_price: 249,
        discounted_price: undefined,
        discount_enabled: false,
        currency: 'INR',
        billing_cycle: 'monthly'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();

    // Set up real-time subscription for pricing changes
    const subscription = supabase
      .channel('pricing_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pricing_config',
          filter: `plan_name=eq.${planName}`
        },
        (payload) => {
          console.log('Pricing updated:', payload);
          fetchPricing(); // Refetch when pricing changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [planName]);

  // Calculate the effective price (discounted if enabled, otherwise original)
  const getEffectivePrice = (): number => {
    if (!pricing) return 249; // fallback
    return pricing.discount_enabled && pricing.discounted_price 
      ? pricing.discounted_price 
      : pricing.original_price;
  };

  // Get price display with currency
  const getPriceDisplay = (): string => {
    if (!pricing) return '₹249';
    const effectivePrice = getEffectivePrice();
    return `₹${effectivePrice}`;
  };

  // Get original price display (for strikethrough)
  const getOriginalPriceDisplay = (): string => {
    if (!pricing) return '₹249';
    return `₹${pricing.original_price}`;
  };

  // Check if discount is active
  const hasActiveDiscount = (): boolean => {
    return pricing ? pricing.discount_enabled && !!pricing.discounted_price : false;
  };

  return {
    pricing,
    isLoading,
    error,
    getEffectivePrice,
    getPriceDisplay,
    getOriginalPriceDisplay,
    hasActiveDiscount,
    refetch: fetchPricing
  };
};
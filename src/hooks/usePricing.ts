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

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_current_pricing', {
          plan_name_param: planName
        });

        if (error) throw error;

        if (data && data.length > 0) {
          setPricing({
            original_price: Number(data[0].original_price),
            discounted_price: data[0].discounted_price ? Number(data[0].discounted_price) : undefined,
            discount_enabled: data[0].discount_enabled,
            currency: data[0].currency,
            billing_cycle: data[0].billing_cycle
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
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
    refetch: () => {
      const fetchPricing = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase.rpc('get_current_pricing', {
            plan_name_param: planName
          });

          if (error) throw error;

          if (data && data.length > 0) {
            setPricing({
              original_price: Number(data[0].original_price),
              discounted_price: data[0].discounted_price ? Number(data[0].discounted_price) : undefined,
              discount_enabled: data[0].discount_enabled,
              currency: data[0].currency,
              billing_cycle: data[0].billing_cycle
            });
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPricing();
    }
  };
};
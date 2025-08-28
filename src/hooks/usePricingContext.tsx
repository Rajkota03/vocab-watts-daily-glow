import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePricing } from './usePricing';

interface PricingContextType {
  refreshPricing: () => void;
  isLoading: boolean;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refetch, isLoading } = usePricing();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshPricing = () => {
    refetch();
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const handlePricingUpdate = () => {
      refreshPricing();
    };

    // Listen for pricing updates from admin panel
    window.addEventListener('pricingUpdated', handlePricingUpdate);
    
    return () => {
      window.removeEventListener('pricingUpdated', handlePricingUpdate);
    };
  }, []);

  return (
    <PricingContext.Provider value={{ refreshPricing, isLoading }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricingContext = () => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricingContext must be used within a PricingProvider');
  }
  return context;
};
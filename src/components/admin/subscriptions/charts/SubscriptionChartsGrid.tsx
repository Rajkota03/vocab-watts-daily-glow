
import React from 'react';
import { ConversionRateChart } from './ConversionRateChart';
import { SubscriptionDistributionCard } from './SubscriptionDistributionCard';

interface ConversionChartData {
  date: string;
  conversion: number;
}

interface SubscriptionChartsGridProps {
  conversionData: ConversionChartData[];
  proSubscriptions: number;
  totalSubscriptions: number;
}

export function SubscriptionChartsGrid({ 
  conversionData, 
  proSubscriptions, 
  totalSubscriptions 
}: SubscriptionChartsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ConversionRateChart data={conversionData} />
      <SubscriptionDistributionCard 
        proCount={proSubscriptions} 
        totalCount={totalSubscriptions} 
      />
    </div>
  );
}

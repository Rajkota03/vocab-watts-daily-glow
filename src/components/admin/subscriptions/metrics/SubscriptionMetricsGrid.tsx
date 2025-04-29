
import React from 'react';
import { SubscriptionMetricCard } from './SubscriptionMetricCard';

interface Metric {
  name: string;
  value: string | number;
}

interface SubscriptionMetricsGridProps {
  metrics: Metric[];
}

export function SubscriptionMetricsGrid({ metrics }: SubscriptionMetricsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <SubscriptionMetricCard 
          key={i} 
          title={metric.name} 
          value={metric.value} 
        />
      ))}
    </div>
  );
}

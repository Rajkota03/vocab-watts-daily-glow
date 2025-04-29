
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface SubscriptionDistributionCardProps {
  proCount: number;
  totalCount: number;
}

export function SubscriptionDistributionCard({ proCount, totalCount }: SubscriptionDistributionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">
              {proCount} / {totalCount}
            </p>
            <p className="text-sm text-muted-foreground">Pro Subscriptions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

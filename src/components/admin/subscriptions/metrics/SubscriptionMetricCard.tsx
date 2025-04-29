
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface SubscriptionMetricCardProps {
  title: string;
  value: string | number;
}

export function SubscriptionMetricCard({ title, value }: SubscriptionMetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

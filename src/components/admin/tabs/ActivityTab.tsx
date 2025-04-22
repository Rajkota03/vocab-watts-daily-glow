
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ActivityTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Activity Monitoring</h2>
        <p className="text-muted-foreground">
          Track user engagement and platform activity.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-muted-foreground">Activity monitoring feature coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityTab;

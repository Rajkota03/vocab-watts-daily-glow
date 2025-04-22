
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MessagesTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Message Center</h2>
        <p className="text-muted-foreground">
          Manage scheduled messages and delivery status.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Message Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-muted-foreground">Message center feature coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesTab;

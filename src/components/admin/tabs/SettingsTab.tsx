
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure platform settings and defaults.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-muted-foreground">Settings management feature coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;

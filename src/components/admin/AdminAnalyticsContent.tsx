import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserGrowthReport from './analytics/UserGrowthReport';
import RevenueDashboard from './analytics/RevenueDashboard';

const AdminAnalyticsContent = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-vuilder-indigo">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">View and analyze user growth and platform metrics</p>
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement" disabled>Engagement</TabsTrigger>
          <TabsTrigger value="retention" disabled>Retention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth" className="focus-visible:outline-none focus-visible:ring-0">
          <UserGrowthReport />
        </TabsContent>
        
        <TabsContent value="revenue">
          <RevenueDashboard />
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="p-8 border rounded-lg bg-white shadow-sm">
            <p className="text-gray-500">Engagement metrics coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="retention">
          <div className="p-8 border rounded-lg bg-white shadow-sm">
            <p className="text-gray-500">Retention metrics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsContent;

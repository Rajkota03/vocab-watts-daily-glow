
import React from 'react';
import { Card } from '@/components/ui/card';
// Remove all the Tabs-related imports since they're not used
import CategorySelection from './CategorySelection';
// Remove OverviewTab, ActivityTab, HistoryTab, ApiTestButton imports

interface DashboardMainProps {
  subscription: {
    is_pro: boolean;
    category: string;
  };
  handleCategoryUpdate: (primary: string, subcategory: string) => Promise<void>;
  handleNewBatch: () => Promise<void>;
  isGeneratingBatch: boolean;
  isAdmin: boolean;
  MOCK_TODAYS_QUIZ: any;
  MOCK_RECENT_DROPS: any;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  subscription,
  handleCategoryUpdate,
  handleNewBatch,
  isGeneratingBatch,
  isAdmin,
  MOCK_TODAYS_QUIZ,
  MOCK_RECENT_DROPS
}) => {
  return (
    <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      {subscription.is_pro && (
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
          <CategorySelection 
            isPro={subscription.is_pro} 
            currentCategory={subscription.category} 
            onCategoryUpdate={handleCategoryUpdate}
            onNewBatch={handleNewBatch}
            isLoadingNewBatch={isGeneratingBatch}
          />
        </Card>
      )}
      {/* All main dashboard tabs/content removed as requested */}
      <div className="text-center text-gray-500 py-16">
        {/* Dashboard is currently under maintenance. */}
        Welcome to your dashboard.
      </div>
    </main>
  );
};

export default DashboardMain;

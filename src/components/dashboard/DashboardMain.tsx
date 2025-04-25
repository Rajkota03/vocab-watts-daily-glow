
import React from 'react';
import CategorySelection from './CategorySelection';

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
  wordsLearnedThisMonth?: number;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  subscription,
  handleCategoryUpdate,
  handleNewBatch,
  isGeneratingBatch,
  isAdmin,
  MOCK_TODAYS_QUIZ,
  MOCK_RECENT_DROPS,
  wordsLearnedThisMonth = 0
}) => {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50/50 px-safe-x">
      <div className="flex flex-col items-center w-full">
        <div id="dashboardCard" className="w-full max-w-dashboard-card mt-8 md:mt-[32px]">
          {subscription.is_pro && (
            <CategorySelection 
              isPro={subscription.is_pro} 
              currentCategory={subscription.category} 
              onCategoryUpdate={handleCategoryUpdate}
              onNewBatch={handleNewBatch}
              isLoadingNewBatch={isGeneratingBatch}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default DashboardMain;

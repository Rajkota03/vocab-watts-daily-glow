import React from 'react';
import CategorySelection from './CategorySelection';
import { cn } from '@/lib/utils';
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
  return <main className="min-h-[calc(100vh-80px)] bg-gray-50/50 flex flex-col items-center">
      <div className="w-full max-w-5xl md:px-6 md:py-12 py-0 px-[11px] mx-0 my-0">
        {subscription.is_pro && <div id="dashboardCard" className="mt-8 max-w-[720px] w-full mx-auto">
            <CategorySelection isPro={subscription.is_pro} currentCategory={subscription.category} onCategoryUpdate={handleCategoryUpdate} onNewBatch={handleNewBatch} isLoadingNewBatch={isGeneratingBatch} />
          </div>}
      </div>
    </main>;
};
export default DashboardMain;
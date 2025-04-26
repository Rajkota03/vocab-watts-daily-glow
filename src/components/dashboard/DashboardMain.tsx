
import React from 'react';
import CategorySelection from './CategorySelection';
import { cn } from '@/lib/utils';
import WhatsAppTestButton from './WhatsAppTestButton';

interface DashboardMainProps {
  subscription: {
    is_pro: boolean;
    category: string;
    phone_number?: string; // Explicitly make phone_number optional
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
    <main className="min-h-[calc(100vh-80px)] bg-gray-50/50 flex flex-col items-center w-full">
      <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <div id="dashboardCard" className="w-full mx-auto">
          <CategorySelection 
            isPro={subscription.is_pro} 
            currentCategory={subscription.category} 
            onCategoryUpdate={handleCategoryUpdate} 
            onNewBatch={handleNewBatch} 
            isLoadingNewBatch={isGeneratingBatch} 
          />
          
          {/* Add WhatsApp Test Button */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">WhatsApp Testing</h3>
            <WhatsAppTestButton category={subscription.category} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardMain;

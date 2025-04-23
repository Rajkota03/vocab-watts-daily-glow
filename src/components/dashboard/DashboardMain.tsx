
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
    <main className="max-w-5xl mx-auto px-6 py-6 space-y-8">
      {subscription.is_pro && (
        <CategorySelection 
          isPro={subscription.is_pro} 
          currentCategory={subscription.category} 
          onCategoryUpdate={handleCategoryUpdate}
          onNewBatch={handleNewBatch}
          isLoadingNewBatch={isGeneratingBatch}
        />
      )}
    </main>
  );
};

export default DashboardMain;

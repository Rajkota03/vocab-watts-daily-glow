
import React from 'react';
import CategorySelection from './CategorySelection';
import { cn } from '@/lib/utils';

interface DashboardMainProps {
  subscription: {
    is_pro: boolean;
    category: string;
    trial_ends_at?: string | null;
    subscription_ends_at?: string | null;
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
  // Check if trial has expired
  const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const subscriptionEndsAt = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null;
  const now = new Date();
  
  const isTrialActive = trialEndsAt ? now < trialEndsAt : false;
  const isSubscriptionActive = subscriptionEndsAt ? now < subscriptionEndsAt : false;
  const isActive = isTrialActive || isSubscriptionActive;
  
  // If user is on free trial, they can only access daily category
  const isFreeTrialUser = isTrialActive && !subscription.is_pro;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50/50 flex flex-col items-center w-full">
      <div className="w-full max-w-7xl px-4 md:px-6 lg:px-8 py-6 md:py-12">
        {isActive && (
          <>
            {isFreeTrialUser && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="text-amber-800 font-medium">Free Trial Active</h3>
                <p className="text-amber-700 text-sm mt-1">
                  You're currently on a free trial that ends on {trialEndsAt?.toLocaleDateString()}. 
                  Free trial users can only access the "Daily" category.
                </p>
              </div>
            )}
            
            <div id="dashboardCard" className="w-full mx-auto">
              <CategorySelection 
                isPro={subscription.is_pro} 
                currentCategory={subscription.category} 
                onCategoryUpdate={handleCategoryUpdate} 
                onNewBatch={handleNewBatch} 
                isLoadingNewBatch={isGeneratingBatch}
                isFreeTrialUser={isFreeTrialUser}
              />
            </div>
          </>
        )}
        
        {!isActive && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-3">Your subscription has expired</h2>
            <p className="text-gray-600 mb-4">
              Your trial or subscription period has ended. 
              Upgrade to a Pro plan to continue receiving daily vocabulary words.
            </p>
            <div className="mt-6">
              <a 
                href="/upgrade" 
                className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardMain;

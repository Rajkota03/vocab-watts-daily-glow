import React from 'react';
import CategorySelection from './CategorySelection';
import { cn } from '@/lib/utils';
import WhatsAppTestButton from './WhatsAppTestButton';
import SendDailyWordsButton from './SendDailyWordsButton';
import { Link } from 'react-router-dom';

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
        <div id="dashboardCard" className="w-full mx-auto space-y-8">
          {/* Section for Daily Words */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Daily Words</h3>
            <p className="text-gray-600 mb-4">
              Ready for today's vocabulary boost? Click the button below to receive your words via WhatsApp.
            </p>
            <SendDailyWordsButton 
              phoneNumber={subscription.phone_number}
              category={subscription.category}
              isPro={subscription.is_pro}
            />
          </div>

          {/* Section for Category Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-xl font-semibold mb-4 text-gray-800">Learning Settings</h3>
            <CategorySelection 
              isPro={subscription.is_pro} 
              currentCategory={subscription.category} 
              onCategoryUpdate={handleCategoryUpdate} 
              onNewBatch={handleNewBatch} // Assuming this is related to category/word generation?
              isLoadingNewBatch={isGeneratingBatch} 
            />
          </div>
          
          {/* Section for WhatsApp Testing (Optional - maybe only for admin or specific users) */}
          {/* Consider adding conditional rendering based on isAdmin or a feature flag */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">WhatsApp Integration Test</h3>
             <p className="text-gray-600 mb-4">
              Use this button to send a generic test message and verify the connection.
            </p>
            <WhatsAppTestButton 
              category={subscription.category} 
              phoneNumber={subscription.phone_number} 
            />
          </div>

          {/* Placeholder for other dashboard sections like Quiz, Recent Drops etc. */}
          {/* You would integrate MOCK_TODAYS_QUIZ and MOCK_RECENT_DROPS here */}
          {/* Example: */}
          {/* <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"> */}
          {/*   <h3 className="text-xl font-semibold mb-4 text-gray-800">Today's Quiz</h3> */}
          {/*   Render quiz component using MOCK_TODAYS_QUIZ */}
          {/* </div> */}
          
          {/* Add this somewhere in the dashboard, perhaps near existing admin links or settings */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link to="/twilio-test" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              <span className="mr-1">Test Twilio Connection</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
};

export default DashboardMain;

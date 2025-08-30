import React from 'react';
import CategorySelection from './CategorySelection';
import { cn } from '@/lib/utils';
import WordScheduler from './WordScheduler';
import PhoneNumberUpdateForm from './PhoneNumberUpdateForm';
import { useAuthHandler } from '@/hooks/useAuthHandler';
import { SubscriptionManager } from './SubscriptionManager';
interface DashboardMainProps {
  subscription: {
    is_pro: boolean;
    category: string;
    phone_number?: string;
  };
  handleCategoryUpdate: (primary: string, subcategory: string) => Promise<void>;
  handleNewBatch: () => Promise<void>;
  isGeneratingBatch: boolean;
  wordsLearnedThisMonth?: number;
  showPhoneForm?: boolean;
  handlePhoneNumberUpdate?: (newPhoneNumber: string) => void;
  wordCount?: number;
  customDeliveryMode?: boolean;
  onDeliveryModeChange?: (custom: boolean) => void;
  onWordCountChange?: (count: number) => void;
}
const DashboardMain: React.FC<DashboardMainProps> = ({
  subscription,
  handleCategoryUpdate,
  handleNewBatch,
  isGeneratingBatch,
  wordsLearnedThisMonth = 0,
  showPhoneForm = false,
  handlePhoneNumberUpdate,
  wordCount = 3,
  customDeliveryMode = false,
  onDeliveryModeChange,
  onWordCountChange
}) => {
  const {
    session
  } = useAuthHandler();
  const userId = session?.user?.id;
  return <main className="min-h-[calc(100vh-80px)] bg-gray-50/50 flex flex-col items-center w-full">
      <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <div id="dashboardCard" className="w-full mx-auto space-y-4">
          {/* Phone Number Update Form (conditionally displayed) */}
          {showPhoneForm && userId && handlePhoneNumberUpdate && <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Update Your WhatsApp Number</h3>
              <PhoneNumberUpdateForm currentPhoneNumber={subscription.phone_number} userId={userId} onUpdate={handlePhoneNumberUpdate} />
            </div>}

          {/* Subscription Status Display (minimal) */}
          <SubscriptionManager userId={userId} showManageLink={false} />

          {/* Section for Learning Settings - First */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-xl font-bold mb-4 text-gray-800">Learning Settings</h3>
            <CategorySelection isPro={subscription.is_pro} currentCategory={subscription.category} onCategoryUpdate={handleCategoryUpdate} onNewBatch={handleNewBatch} isLoadingNewBatch={isGeneratingBatch} onWordCountChange={onWordCountChange} customDeliveryMode={customDeliveryMode} onDeliveryModeChange={onDeliveryModeChange} wordCount={wordCount} />
          </div>

          {/* Section for Schedule - Second */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <WordScheduler userId={userId!} phoneNumber={subscription.phone_number} category={subscription.category} isPro={subscription.is_pro} wordCount={wordCount} />
          </div>

        </div>
      </div>
    </main>;
};
export default DashboardMain;
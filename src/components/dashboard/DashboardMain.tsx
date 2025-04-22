
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import CategorySelection from './CategorySelection';
import OverviewTab from './tabs/OverviewTab';
import ActivityTab from './tabs/ActivityTab';
import HistoryTab from './tabs/HistoryTab';
import ApiTestButton from './ApiTestButton';

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Activity
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            History
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1">
              <Link to="/admin" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab todaysQuiz={MOCK_TODAYS_QUIZ} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab recentDrops={MOCK_RECENT_DROPS} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab isPro={subscription.is_pro} category={subscription.category} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DashboardMain;

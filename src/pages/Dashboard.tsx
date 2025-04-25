
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useDashboardSubscription } from '@/hooks/useDashboardSubscription';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMain from '@/components/dashboard/DashboardMain';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import { MOCK_TODAYS_QUIZ, MOCK_RECENT_DROPS } from '@/data/dashboardMockData';
import { generateNewWordBatch } from '@/services/wordService';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { loading: authLoading, userNickname, isAdmin } = useAuthStatus();
  const { subscription, loading: subscriptionLoading } = useDashboardSubscription();
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [wordsLearnedThisMonth, setWordsLearnedThisMonth] = useState(45);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCategoryUpdate = async (primary: string, subcategory: string) => {
    try {
      const combinedCategory = `${primary}-${subcategory}`;
      console.log("Updating category to:", combinedCategory);
      
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Category Updated',
        description: `Your category has been updated to ${combinedCategory}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category',
        variant: 'destructive'
      });
    }
  };

  const handleNewBatch = async () => {
    if (isGeneratingBatch) return;
    
    setIsGeneratingBatch(true);
    try {
      const newWords = await generateNewWordBatch(subscription.category);
      console.log("New batch generated:", newWords);
      toast({
        title: "Words Generated",
        description: "Your new words have been generated and will be sent at your scheduled time.",
      });
    } catch (error: any) {
      console.error("Error generating new batch:", error);
      toast({
        title: "Error generating words",
        description: error.message || "Failed to generate new words",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  if (authLoading || subscriptionLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-white font-inter pb-10">
      <DashboardHeader 
        userNickname={userNickname}
        handleSignOut={handleSignOut}
        isAdmin={isAdmin}
        wordsLearnedThisMonth={wordsLearnedThisMonth}
      />
      <DashboardMain 
        subscription={subscription}
        handleCategoryUpdate={handleCategoryUpdate}
        handleNewBatch={handleNewBatch}
        isGeneratingBatch={isGeneratingBatch}
        isAdmin={isAdmin}
        MOCK_TODAYS_QUIZ={MOCK_TODAYS_QUIZ}
        MOCK_RECENT_DROPS={MOCK_RECENT_DROPS}
        wordsLearnedThisMonth={wordsLearnedThisMonth}
      />
    </div>
  );
};

export default Dashboard;

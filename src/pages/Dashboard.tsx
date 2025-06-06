import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMain from '@/components/dashboard/DashboardMain';
import { MOCK_TODAYS_QUIZ, MOCK_RECENT_DROPS } from '@/data/dashboardMockData';
import { useAuthHandler } from '@/hooks/useAuthHandler';
import PhoneNumberUpdateForm from '@/components/dashboard/PhoneNumberUpdateForm';

interface UserSubscription {
  is_pro: boolean;
  category: string;
  phone_number?: string;
}

const Dashboard = () => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    is_pro: false,
    category: 'daily-beginner',
    phone_number: undefined
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [userNickname, setUserNickname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [wordsLearnedThisMonth, setWordsLearnedThisMonth] = useState(45);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthHandler();

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) return;

      try {
        // Ensure user has admin role if needed
        if (session.user.email === 'rajkota.sql@gmail.com') {
          setIsAdmin(true);
          
          const { data: hasAdminRole, error } = await supabase.rpc('has_role', { 
            _user_id: session.user.id,
            _role: 'admin'
          });
          
          if (error) {
            console.error('Error checking admin role:', error);
          } else if (!hasAdminRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: session.user.id,
                role: 'admin'
              });
              
            if (roleError) {
              console.error('Error adding admin role:', roleError);
            }
          }
        }
        
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nick_name, first_name, whatsapp_number')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setUserNickname(profileData.nick_name || profileData.first_name || 'there');
          
          // If profile has WhatsApp number, ensure it's also in the user_subscriptions table
          if (profileData.whatsapp_number) {
            await import('@/services/subscriptionService')
              .then(({ ensureUserSubscription }) => {
                ensureUserSubscription(session.user.id, profileData.whatsapp_number);
              });
          }
        }
        
        // Fetch subscription data
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('is_pro, category, phone_number')
          .eq('user_id', session.user.id)
          .single();
        
        if (subscriptionData) {
          setSubscription({
            is_pro: subscriptionData.is_pro === true,
            category: subscriptionData.category || 'daily-beginner',
            phone_number: subscriptionData.phone_number
          });
          setShowPhoneForm(!subscriptionData.phone_number);
        } else {
          // If no subscription data exists, ensure one is created
          await import('@/services/subscriptionService')
            .then(({ ensureUserSubscription }) => {
              ensureUserSubscription(session.user.id);
            });
          setShowPhoneForm(true);
        }

        const { data: wordsData } = await supabase
          .from('user_word_history')
          .select('id')
          .eq('user_id', session.user.id)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());
          
        if (wordsData) {
          setWordsLearnedThisMonth(wordsData.length);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [session, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCategoryUpdate = async (primary: string, subcategory: string = "") => {
    try {
      console.log(`Updating category to: ${primary}, subcategory: ${subcategory}`);
      
      const { error } = await supabase.auth.updateUser({
        data: { category: primary }
      });
      
      if (error) throw error;
      
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          category: primary,
          is_pro: subscription.is_pro,
          phone_number: subscription.phone_number || '+1234567890'
        });
      
      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
      }
      
      setSubscription(prev => ({
        ...prev,
        category: primary
      }));
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
      // Get the current user ID from the session
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User must be logged in to generate words");
      }
      
      const newWords = await generateNewWordBatch(userId, subscription.category);
      console.log("New batch generated:", newWords);
      
      const wordHistoryElement = document.getElementById('word-history');
      if (wordHistoryElement) {
        wordHistoryElement.classList.add('refresh-triggered');
        setTimeout(() => {
          wordHistoryElement.classList.remove('refresh-triggered');
        }, 100);
      }
      
      // Dispatch an event to refresh word history
      document.dispatchEvent(new CustomEvent('refresh-word-history', { 
        detail: { 
          force: true,
          category: subscription.category
        }
      }));
      
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

  const handlePhoneNumberUpdate = (newPhoneNumber: string) => {
    setSubscription(prev => ({
      ...prev,
      phone_number: newPhoneNumber
    }));
    setShowPhoneForm(false);
    toast({
      title: "Phone Number Updated",
      description: "Your WhatsApp number has been saved. You can now receive daily words."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
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
        showPhoneForm={showPhoneForm}
        handlePhoneNumberUpdate={handlePhoneNumberUpdate}
      />
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import { checkSubscriptionStatus } from '@/services/subscriptionService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMain from '@/components/dashboard/DashboardMain';
import { MOCK_TODAYS_QUIZ, MOCK_RECENT_DROPS } from '@/data/dashboardMockData';

const Dashboard = () => {
  const [subscription, setSubscription] = useState({
    is_pro: false,
    category: 'daily-intermediate',
    phone_number: '',
    trial_ends_at: null as string | null,
    subscription_ends_at: null as string | null
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [userNickname, setUserNickname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [wordsLearnedThisMonth, setWordsLearnedThisMonth] = useState(45);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Dashboard session check:", data.session);
      
      if (!data.session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        toast({
          title: "Authentication required",
          description: "Please login to access your dashboard",
          variant: "destructive"
        });
        return;
      }
      
      if (data.session.user.email === 'rajkota.sql@gmail.com') {
        console.log("Admin user detected");
        setIsAdmin(true);
        
        try {
          const { data: hasAdminRole, error } = await supabase.rpc('has_role', { 
            _user_id: data.session.user.id,
            _role: 'admin'
          });
          
          if (error) {
            console.error('Error checking admin role:', error);
          } else if (!hasAdminRole) {
            console.log("Admin email but no admin role found, adding admin role");
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: data.session.user.id,
                role: 'admin'
              });
              
            if (roleError) {
              console.error('Error adding admin role:', roleError);
            } else {
              console.log("Admin role added successfully");
            }
          }
        } catch (error) {
          console.error('Failed to check admin role:', error);
        }
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nick_name, first_name')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileData) {
        setUserNickname(profileData.nick_name || profileData.first_name || 'there');
      }
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', data.session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
      } else if (subscriptionData) {
        let category = subscriptionData.category || 'daily-intermediate';
        
        if (category && !category.includes('-')) {
          const mapping: { [key: string]: string } = {
            'business': 'business-intermediate',
            'exam': 'exam-gre',
            'slang': 'slang-intermediate',
            'daily': 'daily-intermediate'
          };
          category = mapping[category] || 'daily-intermediate';
        }
        
        setSubscription({
          is_pro: subscriptionData.is_pro,
          category: category,
          phone_number: subscriptionData.phone_number,
          trial_ends_at: subscriptionData.trial_ends_at,
          subscription_ends_at: subscriptionData.subscription_ends_at
        });
      } else {
        const userMetadata = data.session.user.user_metadata;
        console.log("User metadata:", userMetadata);
        
        if (userMetadata) {
          let category = userMetadata.category || 'daily-intermediate';
          
          if (category && !category.includes('-')) {
            const mapping: { [key: string]: string } = {
              'business': 'business-intermediate',
              'exam': 'exam-gre',
              'slang': 'slang-intermediate',
              'daily': 'daily-intermediate'
            };
            category = mapping[category] || 'daily-intermediate';
          }
          
          setSubscription(prev => ({
            ...prev,
            is_pro: userMetadata.is_pro || false,
            category: category,
            trial_ends_at: userMetadata.trial_ends_at || null,
            subscription_ends_at: userMetadata.subscription_ends_at || null
          }));
        }
      }
      
      try {
        const { data: wordsData, error: wordsError } = await supabase
          .from('user_word_history')
          .select('id')
          .eq('user_id', data.session.user.id)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());
          
        if (!wordsError && wordsData) {
          setWordsLearnedThisMonth(wordsData.length);
        }
      } catch (error) {
        console.error('Failed to fetch words learned this month:', error);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change in dashboard:", event);
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/login');
        }
      }
    );
    
    return () => {
      authSubscription.unsubscribe();
    };
  }, [navigate, toast]);

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

  const handleCategoryUpdate = async (primary: string, subcategory: string) => {
    try {
      const combinedCategory = `${primary}-${subcategory}`;
      console.log("Updating category to:", combinedCategory);
      
      const isFreeTrialUser = !subscription.is_pro && 
        subscription.trial_ends_at && 
        new Date(subscription.trial_ends_at) > new Date();
        
      if (isFreeTrialUser && primary !== 'daily') {
        toast({
          title: 'Free Trial Restriction',
          description: 'Free trial users can only use the Daily category. Upgrade to Pro to unlock all categories.',
          variant: 'default'
        });
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      const { error: dbError } = await supabase
        .from('user_subscriptions')
        .update({ category: combinedCategory })
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id);
      
      if (dbError) {
        console.error("Error updating subscription in DB:", dbError);
      }
      
      setSubscription({
        ...subscription,
        category: combinedCategory
      });
      
      toast({
        title: 'Category Updated',
        description: `Your category has been updated to ${primary} - ${subcategory}`,
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
      
      const wordHistoryElement = document.getElementById('word-history');
      if (wordHistoryElement) {
        wordHistoryElement.classList.add('refresh-triggered');
        setTimeout(() => {
          wordHistoryElement.classList.remove('refresh-triggered');
        }, 100);
      }
      
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
      />
    </div>
  );
};

export default Dashboard;

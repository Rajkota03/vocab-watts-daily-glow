
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMain from '@/components/dashboard/DashboardMain';
import { MOCK_TODAYS_QUIZ, MOCK_RECENT_DROPS } from '@/data/dashboardMockData';

interface UserSubscription {
  is_pro: boolean;
  category: string;
  phone_number?: string; // Made phone_number optional
}

const Dashboard = () => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    is_pro: false, // Default to free user
    category: 'daily-beginner', // Default free category
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
      
      // Check if the user email is the admin email
      if (data.session.user.email === 'rajkota.sql@gmail.com') {
        console.log("Admin user detected");
        setIsAdmin(true);
        
        // Also check admin role in database
        try {
          const { data: hasAdminRole, error } = await supabase.rpc('has_role', { 
            _user_id: data.session.user.id,
            _role: 'admin'
          });
          
          if (error) {
            console.error('Error checking admin role:', error);
          } else if (!hasAdminRole) {
            console.log("Admin email but no admin role found, adding admin role");
            // Automatically assign admin role if it doesn't exist
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
      
      // Check if user has a pro subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('is_pro, category')
        .eq('user_id', data.session.user.id)
        .single();
      
      // Determine if user is a pro user from multiple sources
      let isPro = false;
      let category = 'daily-beginner'; // Default for free users
      
      // 1. First check user_subscriptions table
      if (subscriptionData) {
        console.log("Found subscription data:", subscriptionData);
        isPro = subscriptionData.is_pro === true;
        category = subscriptionData.category || category;
      }
      
      // 2. Then check user metadata (fallback)
      const userMetadata = data.session.user.user_metadata;
      console.log("User metadata:", userMetadata);
      
      if (userMetadata) {
        // Only use metadata if we didn't find subscription data
        if (!subscriptionData) {
          isPro = userMetadata.is_pro === true;
          
          // Get category from metadata if available
          if (userMetadata.category) {
            let metadataCategory = userMetadata.category;
            
            // If category doesn't have a subcategory, add default
            if (metadataCategory && !metadataCategory.includes('-')) {
              const mapping: { [key: string]: string } = {
                'business': 'business-intermediate',
                'exam': 'exam-gre',
                'slang': 'slang-intermediate',
                'general': 'daily-intermediate',
                'daily': 'daily-intermediate'
              };
              metadataCategory = mapping[metadataCategory] || 'daily-beginner';
            }
            
            category = metadataCategory;
          }
        }
      }
      
      // 3. Apply free user restrictions if not pro
      if (!isPro && category !== 'daily-beginner' && !category.startsWith('daily-')) {
        category = 'daily-beginner'; // Reset free users to the only allowed category
      }
      
      console.log(`User status: ${isPro ? 'PRO' : 'FREE'}, Category: ${category}`);
      
      setSubscription({
        is_pro: isPro,
        category: category,
        phone_number: subscriptionData?.phone_number || '+1234567890'
      });
      
      // Fetch words learned this month
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
      // Restrict non-pro users to daily category only
      if (!subscription.is_pro && primary !== 'daily') {
        toast({
          title: 'Pro Feature',
          description: 'Upgrade to Pro to access this category',
          variant: 'destructive'
        });
        return;
      }
      
      const combinedCategory = `${primary}-${subcategory}`;
      console.log("Updating category to:", combinedCategory);
      
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      // Also update the user_subscriptions table
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          category: combinedCategory,
          is_pro: subscription.is_pro,
          phone_number: subscription.phone_number
        });
      
      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
      }
      
      setSubscription({
        ...subscription,
        category: combinedCategory
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

  console.log("Rendering dashboard with subscription:", subscription);

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

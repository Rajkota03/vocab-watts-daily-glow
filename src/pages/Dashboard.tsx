
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMain from '@/components/dashboard/DashboardMain';
import { MOCK_TODAYS_QUIZ, MOCK_RECENT_DROPS } from '@/data/dashboardMockData';

const Dashboard = () => {
  const [subscription, setSubscription] = useState({
    is_pro: true,
    category: 'business-intermediate',
    phone_number: '+1234567890'
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [userNickname, setUserNickname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  
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
      
      const userMetadata = data.session.user.user_metadata;
      console.log("User metadata:", userMetadata);
      
      if (userMetadata) {
        let category = userMetadata.category || 'business-intermediate';
        
        if (category && !category.includes('-')) {
          const mapping: { [key: string]: string } = {
            'business': 'business-intermediate',
            'exam': 'exam-gre',
            'slang': 'slang-intermediate',
            'general': 'daily-intermediate'
          };
          category = mapping[category] || 'business-intermediate';
        }
        
        setSubscription(prev => ({
          ...prev,
          is_pro: userMetadata.is_pro || true,
          category: category
        }));
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
      
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      setSubscription({
        ...subscription,
        category: combinedCategory
      });
      
      toast({
        title: 'Category Updated',
        description: `Your word category is now set to ${combinedCategory}`,
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
        title: "New words generated!",
        description: `${newWords.length} new words have been added to your vocabulary.`,
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
          <div className="w-16 h-16 border-4 border-t-vuilder-mint border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCategory = (category: string) => {
    if (!category) return "General";
    
    const parts = category.split('-');
    if (parts.length !== 2) return category;
    
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} (${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)})`;
  };

  const displayCategory = formatCategory(subscription.category);

  return (
    <div className="min-h-screen bg-white font-inter pb-10">
      <DashboardHeader 
        userNickname={userNickname}
        handleSignOut={handleSignOut}
        isAdmin={isAdmin}
      />
      <DashboardMain 
        subscription={subscription}
        handleCategoryUpdate={handleCategoryUpdate}
        handleNewBatch={handleNewBatch}
        isGeneratingBatch={isGeneratingBatch}
        isAdmin={isAdmin}
        MOCK_TODAYS_QUIZ={MOCK_TODAYS_QUIZ}
        MOCK_RECENT_DROPS={MOCK_RECENT_DROPS}
      />
    </div>
  );
};

export default Dashboard;

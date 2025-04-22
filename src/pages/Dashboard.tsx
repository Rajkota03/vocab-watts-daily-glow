
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Unlock, Calendar, Sparkles, BookOpen, CheckCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CategorySelection from '@/components/dashboard/CategorySelection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import { useIsMobile } from '@/hooks/use-mobile';
import OverviewTab from '@/components/dashboard/tabs/OverviewTab';
import ActivityTab from '@/components/dashboard/tabs/ActivityTab';
import HistoryTab from '@/components/dashboard/tabs/HistoryTab';
import ApiTestButton from '@/components/dashboard/ApiTestButton';
import { Link } from 'react-router-dom';

const MOCK_TODAYS_QUIZ = {
  completed: true,
  score: 4,
  words: [
    { word: "Articulate", correct: true },
    { word: "Incentivize", correct: true },
    { word: "Disrupt", correct: false },
    { word: "Pitch", correct: true },
    { word: "Leverage", correct: true }
  ]
};

const MOCK_RECENT_DROPS = [
  { date: "April 15", completed: true, score: 4 },
  { date: "April 14", completed: false, score: 0 },
  { date: "April 13", completed: true, score: 5 },
  { date: "April 12", completed: true, score: 3 },
  { date: "April 11", completed: true, score: 2 }
];

const Dashboard = () => {
  const [subscription, setSubscription] = useState({
    is_pro: true,
    category: 'business-intermediate',
    phone_number: '+1234567890'
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [streak, setStreak] = useState(4);
  const [dayStatus, setDayStatus] = useState("Day 2 of 3");
  const [userNickname, setUserNickname] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  
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
      
      setUserEmail(data.session.user.email);
      
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

  const getScoreEmoji = (score: number) => {
    if (score >= 4) return "👏";
    if (score >= 2) return "💪";
    return "😬";
  };

  const formatCategory = (category: string) => {
    if (!category) return "General";
    
    const parts = category.split('-');
    if (parts.length !== 2) return category;
    
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} (${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)})`;
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

  const username = userEmail ? userEmail.split('@')[0] : 'User';
  
  const displayCategory = formatCategory(subscription.category);

  return (
    <div className="min-h-screen bg-white font-inter pb-10">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Hi {userNickname} 👋
              </h1>
              <div className="flex flex-col mt-1 md:flex-row md:items-center md:space-x-3">
                <Badge className="text-sm bg-gradient-to-r from-vuilder-mint to-vuilder-mint/80 hover:from-vuilder-mint/90 hover:to-vuilder-mint/70 px-3 py-1.5 my-1 md:my-0 rounded-full shadow-sm w-fit">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Pro Plan
                </Badge>
                <div className="flex items-center mt-1 md:mt-0">
                  <Badge variant="outline" className="text-sm border-gray-200 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-vuilder-mint" />
                    {dayStatus}
                  </Badge>
                  <Badge variant="outline" className="text-sm border-gray-200 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full ml-2">
                    <Sparkles className="mr-1 h-3.5 w-3.5 text-vuilder-yellow" />
                    Streak: {streak} days 🔥
                  </Badge>
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4 text-vuilder-mint mr-1" />
                <span>Active category: </span>
                <span className="font-medium ml-1">{displayCategory}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0 animate-fade-in">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9 border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {subscription.is_pro && (
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50 p-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
                Customize Your Word Category
                <ApiTestButton category={subscription.category} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CategorySelection 
                isPro={subscription.is_pro} 
                currentCategory={subscription.category} 
                onCategoryUpdate={handleCategoryUpdate}
                onNewBatch={handleNewBatch}
                isLoadingNewBatch={isGeneratingBatch}
              />
            </CardContent>
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

        {!subscription.is_pro && (
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <Unlock className="h-12 w-12 text-vuilder-indigo/70" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-vuilder-indigo">Unlock Pro Features</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">
                    Get access to more categories, streak tracking, and advanced quiz modes
                  </p>
                  <Button className="bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo/90 hover:to-vuilder-indigo/80 text-white rounded-xl font-medium shadow-sm">
                    Go Pro 🔓
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

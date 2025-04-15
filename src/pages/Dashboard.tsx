
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, LogOut, Settings, User, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CategorySelection from '@/components/dashboard/CategorySelection';
import WordHistory from '@/components/dashboard/WordHistory';
import ApiTestButton from '@/components/dashboard/ApiTestButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';

const Dashboard = () => {
  // Pro user state
  const [subscription, setSubscription] = useState({
    is_pro: true,
    category: 'business-intermediate',
    phone_number: '+1234567890'
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if user is authenticated and load their data
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
      
      // Set user email
      setUserEmail(data.session.user.email);
      
      // Get user metadata for pro status and preferences
      const userMetadata = data.session.user.user_metadata;
      console.log("User metadata:", userMetadata);
      
      // Update subscription info from metadata if available
      if (userMetadata) {
        // Check if we have the new format (primary-subcategory) or need to convert from legacy
        let category = userMetadata.category || 'business-intermediate';
        
        // Convert legacy categories to new format if needed
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
    
    // Listen for auth changes
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
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { category: combinedCategory }
      });
      
      if (error) throw error;
      
      // Update local state
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
      // The onAuthStateChange listener will handle the navigation
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
      
      // Force reload of word history
      const wordHistoryElement = document.getElementById('word-history');
      if (wordHistoryElement) {
        // Trigger a re-render by adding and removing a class
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-vocab-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract primary category and subcategory from combined format
  const [primaryCategory, subcategory] = subscription.category.split('-');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                Welcome, {userEmail ? userEmail.split('@')[0] : 'Pro User'} 👋
              </h1>
              <p className="text-gray-600">Your VocabSpark Pro dashboard</p>
            </div>
            <div className="flex items-center gap-3 mt-3 md:mt-0">
              <Badge className="text-sm bg-gradient-to-r from-vocab-purple to-violet-500 hover:from-vocab-purple/90 hover:to-violet-500/90 px-3 py-1.5">
                <CheckCircle className="mr-1 h-4 w-4" />
                Pro Plan – Active
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9 border-gray-200"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Category Section */}
          <div className="md:col-span-2">
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-vocab-purple">
                  Customize Your Word Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySelection 
                  isPro={subscription.is_pro} 
                  currentCategory={subscription.category} 
                  onCategoryUpdate={handleCategoryUpdate}
                  onNewBatch={handleNewBatch}
                  isLoadingNewBatch={isGeneratingBatch}
                />
                
                {/* API Test Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">API Testing</h3>
                  <p className="text-gray-600 mb-3">
                    Test the vocabulary generation API by sending a sample set of words to your email.
                  </p>
                  <ApiTestButton category={subscription.category} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pro Benefits Info */}
          <div>
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-vocab-purple">Pro Benefits Active</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-vocab-purple mr-2 shrink-0 mt-0.5" />
                    <span>Premium vocabulary selections</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-vocab-purple mr-2 shrink-0 mt-0.5" />
                    <span>Custom category selection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-vocab-purple mr-2 shrink-0 mt-0.5" />
                    <span>Professional example sentences</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-vocab-purple mr-2 shrink-0 mt-0.5" />
                    <span>Priority word delivery</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-vocab-purple mr-2 shrink-0 mt-0.5" />
                    <span>Full word history access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Word History Section */}
        <div className="mt-8" id="word-history">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-vocab-teal">
                Your Vocabulary History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WordHistory
                isPro={subscription.is_pro}
                isTrialExpired={false}
                category={subscription.category}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, LogOut, ChevronRight, Star, Award, Calendar, BookOpen, 
  CheckCircle2, XCircle, MessageSquare, Trophy, ArrowRight, Sparkles, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CategorySelection from '@/components/dashboard/CategorySelection';
import WordHistory from '@/components/dashboard/WordHistory';
import ApiTestButton from '@/components/dashboard/ApiTestButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateNewWordBatch } from '@/services/wordService';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for quiz results
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

// Mock data for recent word drops
const MOCK_RECENT_DROPS = [
  { date: "April 15", completed: true, score: 4 },
  { date: "April 14", completed: false, score: 0 },
  { date: "April 13", completed: true, score: 5 },
  { date: "April 12", completed: true, score: 3 },
  { date: "April 11", completed: true, score: 2 }
];

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Streak and progress data
  const [streak, setStreak] = useState(4);
  const [dayStatus, setDayStatus] = useState("Day 2 of 3");
  
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

  // Get emoji based on score
  const getScoreEmoji = (score: number) => {
    if (score >= 4) return "👏";
    if (score >= 2) return "💪";
    return "😬";
  };

  // Format the category display
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

  // Get username from email
  const username = userEmail ? userEmail.split('@')[0] : 'User';
  
  // Format category for display
  const displayCategory = formatCategory(subscription.category);

  return (
    <div className="min-h-screen bg-white font-inter pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Hi {username} 👋
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Today's Quiz Section - 1/3 width on desktop */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50 p-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Today's Quiz</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {MOCK_TODAYS_QUIZ.completed ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold">Score: {MOCK_TODAYS_QUIZ.score}/5</span>
                    <span className="text-2xl">{getScoreEmoji(MOCK_TODAYS_QUIZ.score)}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {MOCK_TODAYS_QUIZ.words.map((word, index) => (
                      <li key={index} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                        <span className="text-sm font-medium">{word.word}</span>
                        {word.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-vuilder-mint" />
                        ) : (
                          <XCircle className="h-5 w-5 text-vuilder-coral" />
                        )}
                      </li>
                    ))}
                  </ul>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo/90 hover:to-vuilder-indigo/80 text-white rounded-xl font-medium shadow-sm">
                        Review Mistakes
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Review Mistakes</SheetTitle>
                        <SheetDescription>
                          Let's go over the words you missed today
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        {MOCK_TODAYS_QUIZ.words
                          .filter(word => !word.correct)
                          .map((word, index) => (
                            <div key={index} className="mb-4 p-4 rounded-xl bg-gray-50">
                              <h3 className="font-semibold text-lg">{word.word}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                The ability to express oneself fluently and coherently.
                              </p>
                              <p className="text-sm italic mt-2 text-gray-700">
                                "She was able to articulate her concerns clearly during the meeting."
                              </p>
                            </div>
                          ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  {subscription.is_pro && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 border-gray-200 text-vuilder-indigo rounded-xl font-medium hover:bg-gray-50"
                    >
                      Take Another Quiz
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Award className="h-16 w-16 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-800">No Quiz Taken Today</h3>
                  <p className="text-sm text-gray-500 text-center mt-2 mb-4">
                    Take a quick 5-word quiz to test your vocabulary knowledge.
                  </p>
                  <Button className="bg-gradient-to-r from-vuilder-mint to-vuilder-mint/90 hover:from-vuilder-mint/80 hover:to-vuilder-mint/70 text-white rounded-xl font-medium shadow-sm">
                    Start Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Word Drops Section - 2/3 width on desktop */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden md:col-span-2">
            <CardHeader className="bg-white border-b border-gray-50 p-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Recent Word Drops</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Timeline UI for Word History */}
              <div className="overflow-x-auto">
                <div className="flex flex-nowrap pb-2 md:grid md:grid-cols-1 gap-3">
                  {MOCK_RECENT_DROPS.map((drop, index) => (
                    <div key={index} className={`flex-shrink-0 w-[200px] md:w-full mr-3 md:mr-0 ${isMobile ? '' : 'flex items-center'}`}>
                      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                        <div className="p-3">
                          <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-center'}`}>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-vuilder-mint" />
                              <span className="text-sm font-medium">{drop.date}</span>
                            </div>
                            <div className="mt-1 md:mt-0 flex items-center">
                              {drop.completed ? (
                                <>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                                    Completed
                                  </span>
                                  <div className="ml-2 text-sm font-semibold">
                                    {drop.score}/5
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex justify-between">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                drop.completed 
                                  ? 'bg-gray-100' 
                                  : 'bg-gray-100 filter blur-[2px]'
                              }`}>
                                <BookOpen className="w-4 h-4 text-gray-400" />
                              </div>
                            ))}
                          </div>
                          
                          {drop.completed && (
                            <button className="mt-2 text-xs font-medium text-vuilder-indigo flex items-center w-full justify-end">
                              Review <ArrowRight className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Motivation Card */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-2 mr-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Your Progress</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You've completed 3 quizzes this week 💥
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Favorite Category Card */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-2 mr-3">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Category Insights</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your favorite category is {displayCategory}. Keep going!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pro Users: Category Selection */}
          {subscription.is_pro && (
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden md:col-span-full">
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
          
          {/* Free Users: Upgrade Prompt */}
          {!subscription.is_pro && (
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden md:col-span-full bg-gradient-to-r from-indigo-50 to-purple-50">
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
          
          {/* Word History Section */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden md:col-span-full">
            <CardHeader className="bg-white border-b border-gray-50 p-4">
              <CardTitle className="text-xl font-semibold text-vuilder-mint">
                Your Vocabulary History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
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

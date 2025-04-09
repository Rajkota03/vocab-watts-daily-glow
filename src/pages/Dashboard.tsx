
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import { Clock, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import CategorySelection from '@/components/dashboard/CategorySelection';
import WordHistory from '@/components/dashboard/WordHistory';
import { useToast } from '@/hooks/use-toast';

type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];

const Dashboard = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getSession();
        
        if (!authData.session) {
          navigate('/');
          return;
        }
        
        const { data: subscriptionData, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', authData.session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching subscription:', error);
          toast({
            title: 'Error',
            description: 'Unable to load your subscription data',
            variant: 'destructive'
          });
          return;
        }
        
        if (subscriptionData) {
          setSubscription(subscriptionData);
          setUserPhoneNumber(subscriptionData.phone_number);
          
          // Calculate days left if on trial
          if (!subscriptionData.is_pro && subscriptionData.trial_ends_at) {
            const trialEndDate = parseISO(subscriptionData.trial_ends_at);
            const daysLeft = differenceInDays(trialEndDate, new Date());
            setTrialDaysLeft(Math.max(0, daysLeft));
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        toast({
          title: 'Error',
          description: 'Something went wrong loading your data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [navigate, toast]);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleCategoryUpdate = async (category: string) => {
    if (!subscription || !subscription.is_pro) return;
    
    try {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        navigate('/');
        return;
      }
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ category })
        .eq('user_id', authData.session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSubscription({
        ...subscription,
        category
      });
      
      toast({
        title: 'Category Updated',
        description: `Your word category is now set to ${category}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Update Failed',
        description: 'Unable to update your category',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                Hi, {userPhoneNumber ? `${userPhoneNumber.slice(-4)}` : 'there'} 👋
              </h1>
              <p className="text-gray-600">Welcome to your VocabSpark dashboard</p>
            </div>
            <div className="mt-3 md:mt-0">
              {subscription?.is_pro ? (
                <Badge className="text-sm bg-green-500 hover:bg-green-600 px-3 py-1.5">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Pro Plan – Active
                </Badge>
              ) : (
                <Badge className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-1.5">
                  <Clock className="mr-1 h-4 w-4" />
                  Free Trial – Day {3 - (trialDaysLeft || 0)} of 3
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Category Section */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Your Word Category
                  {!subscription?.is_pro && <Lock className="ml-2 h-4 w-4 text-gray-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySelection 
                  isPro={subscription?.is_pro || false} 
                  currentCategory={subscription?.category || 'general'} 
                  onCategoryUpdate={handleCategoryUpdate}
                />
              </CardContent>
              {!subscription?.is_pro && (
                <CardFooter className="flex flex-col items-start space-y-4 bg-gray-50 rounded-b-lg">
                  <p className="text-sm text-gray-600">
                    Category selection is a Pro feature. Upgrade to choose specialized vocabulary.
                  </p>
                  <Button 
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-vocab-purple to-violet-500 hover:opacity-90"
                  >
                    Unlock Pro to Choose
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Subscription Status & Upgrade */}
          <div>
            {!subscription?.is_pro ? (
              <Card className="bg-gradient-to-br from-vocab-purple/10 to-vocab-teal/10 border-vocab-purple/20">
                <CardHeader>
                  <CardTitle className="text-vocab-purple">Trial Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Your 3-Day Trial is active. You have <span className="font-bold">{trialDaysLeft}</span> days left.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Daily drops without expiry</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Theme selection</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Witty usage examples</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Light quizzes</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-vocab-purple to-violet-500 hover:opacity-90"
                  >
                    Go Pro to Keep Learning
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 h-full">
                <CardHeader>
                  <CardTitle className="text-green-600">Pro Benefits Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Continuous vocabulary drops</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Custom category selection</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Premium example sentences</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Practice quizzes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Word History Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Your Last Words
                {!subscription?.is_pro && trialDaysLeft === 0 && (
                  <Lock className="ml-2 h-4 w-4 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WordHistory
                isPro={subscription?.is_pro || false}
                isTrialExpired={!subscription?.is_pro && trialDaysLeft === 0}
                category={subscription?.category || 'general'}
              />
            </CardContent>
            {!subscription?.is_pro && trialDaysLeft === 0 && (
              <CardFooter className="bg-gray-50 rounded-b-lg">
                <Button 
                  onClick={handleUpgrade}
                  variant="outline" 
                  className="border-vocab-purple text-vocab-purple hover:bg-vocab-purple/10"
                >
                  Upgrade to See Word History
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

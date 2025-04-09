
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategorySelection from '@/components/dashboard/CategorySelection';
import WordHistory from '@/components/dashboard/WordHistory';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  // Pro user default state
  const [subscription, setSubscription] = useState({
    is_pro: true,
    category: 'business',
    phone_number: '+1234567890'
  });
  const { toast } = useToast();

  const handleCategoryUpdate = (category: string) => {
    // Update local state for demo purposes
    setSubscription({
      ...subscription,
      category
    });
    
    toast({
      title: 'Category Updated',
      description: `Your word category is now set to ${category}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                Hi, {subscription.phone_number ? `${subscription.phone_number.slice(-4)}` : 'there'} 👋
              </h1>
              <p className="text-gray-600">Welcome to your VocabSpark dashboard</p>
            </div>
            <div className="mt-3 md:mt-0">
              <Badge className="text-sm bg-green-500 hover:bg-green-600 px-3 py-1.5">
                <CheckCircle className="mr-1 h-4 w-4" />
                Pro Plan – Active
              </Badge>
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategorySelection 
                  isPro={subscription.is_pro} 
                  currentCategory={subscription.category} 
                  onCategoryUpdate={handleCategoryUpdate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Pro Benefits Info */}
          <div>
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
          </div>
        </div>

        {/* Word History Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Your Last Words
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

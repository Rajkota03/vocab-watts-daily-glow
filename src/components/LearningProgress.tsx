
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, CheckCircle } from 'lucide-react';

const LearningProgress = () => {
  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', words: 5, retention: 80 },
    { day: 'Tue', words: 5, retention: 85 },
    { day: 'Wed', words: 5, retention: 75 },
    { day: 'Thu', words: 5, retention: 90 },
    { day: 'Fri', words: 5, retention: 85 },
    { day: 'Sat', words: 5, retention: 95 },
    { day: 'Sun', words: 5, retention: 90 },
  ];
  
  const monthlyData = [
    { week: 'Week 1', words: 35, retention: 78 },
    { week: 'Week 2', words: 35, retention: 82 },
    { week: 'Week 3', words: 35, retention: 86 },
    { week: 'Week 4', words: 35, retention: 90 },
  ];
  
  const streakData = {
    current: 12,
    longest: 30,
    totalWords: 180,
    mastered: 146
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Track Your Progress</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how your vocabulary expands day by day with our intuitive progress tracking
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Tabs defaultValue="weekly">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Learning Activity</h3>
                  <TabsList>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="weekly" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="words" fill="#58CC02" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="monthly" className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="retention" stroke="#7D41E1" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md mb-6 bg-gradient-to-br from-[#FFF8E0] to-[#FFFDF5]">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Trophy className="h-6 w-6 text-[#FFC800] mr-3" />
                <h3 className="text-xl font-bold">Current Streak</h3>
              </div>
              <div className="flex justify-center my-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#58CC02]">{streakData.current}</div>
                  <div className="text-sm text-gray-500 mt-1">days</div>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-4">
                <div className="text-center">
                  <div className="font-bold">{streakData.longest}</div>
                  <div className="text-gray-500">Longest</div>
                </div>
                <div className="h-full w-px bg-gray-200"></div>
                <div className="text-center">
                  <div className="font-bold">{streakData.totalWords}</div>
                  <div className="text-gray-500">Total Words</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md bg-gradient-to-br from-[#E5F8D4] to-[#F8FFF2]">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#58CC02] mr-3" />
                <h3 className="text-xl font-bold">Words Mastered</h3>
              </div>
              <div className="flex justify-center items-center my-4">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold">{Math.round((streakData.mastered / streakData.totalWords) * 100)}%</div>
                  </div>
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#58CC02"
                      strokeWidth="3"
                      strokeDasharray={`${(streakData.mastered / streakData.totalWords) * 100}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                <span className="font-bold text-[#58CC02]">{streakData.mastered}</span> out of <span className="font-bold">{streakData.totalWords}</span> words mastered
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;

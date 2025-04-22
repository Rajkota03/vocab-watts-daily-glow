
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActivityDrop {
  date: string;
  completed: boolean;
  score: number;
}

interface ActivityTabProps {
  recentDrops: ActivityDrop[];
}

const ActivityTab: React.FC<ActivityTabProps> = ({ recentDrops }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden md:col-span-2">
      <CardHeader className="bg-white border-b border-gray-50 p-4">
        <CardTitle className="text-xl font-semibold text-gray-800">Recent Word Drops</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="flex flex-nowrap pb-2 md:grid md:grid-cols-1 gap-3">
            {recentDrops.map((drop, index) => (
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
  );
};

export default ActivityTab;

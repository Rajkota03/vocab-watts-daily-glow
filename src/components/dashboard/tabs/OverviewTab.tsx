
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BookOpen, Star, Trophy, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface OverviewTabProps {
  todaysQuiz: {
    completed: boolean;
    score: number;
    words: Array<{ word: string; correct: boolean }>;
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ todaysQuiz }) => {
  const getScoreEmoji = (score: number) => {
    if (score >= 4) return "👏";
    if (score >= 2) return "💪";
    return "😬";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Quiz Card */}
      <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-50 p-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Today's Quiz</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {todaysQuiz.completed ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold">Score: {todaysQuiz.score}/5</span>
                <span className="text-2xl">{getScoreEmoji(todaysQuiz.score)}</span>
              </div>
              <ul className="space-y-2 mb-4">
                {todaysQuiz.words.map((word, index) => (
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
                    {todaysQuiz.words
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <Trophy className="h-16 w-16 text-gray-300 mb-3" />
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

      {/* Motivation Cards */}
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

      <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-2 mr-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Category Insights</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your favorite category is Business (Intermediate). Keep going!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;

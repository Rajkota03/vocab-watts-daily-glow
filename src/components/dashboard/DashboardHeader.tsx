
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface DashboardHeaderProps {
  userNickname: string;
  handleSignOut: () => Promise<void>;
  isAdmin: boolean;
  wordsLearnedThisMonth?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userNickname,
  handleSignOut,
  isAdmin,
  wordsLearnedThisMonth = 0
}) => {
  // Calculate progress percentage (assuming goal of 100 words per month)
  const progressPercentage = Math.min(Math.round((wordsLearnedThisMonth / 100) * 100), 100);

  return (
    <header className="bg-white border-b border-stroke sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Hi, {userNickname} 👋
              </h2>
              <Badge className="text-sm bg-accent text-dark hover:bg-accent/90 px-3 py-1.5 rounded-full">
                <CheckCircle className="mr-1 h-4 w-4" />
                Pro Plan
              </Badge>
            </div>
            
            {wordsLearnedThisMonth > 0 && (
              <div className="mt-3 max-w-xs">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{wordsLearnedThisMonth} words learned this month</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-3 md:mt-0 animate-fade-in">
            {isAdmin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-9 w-9 border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="h-4 w-4 text-gray-600" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Admin Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
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
  );
};

export default DashboardHeader;

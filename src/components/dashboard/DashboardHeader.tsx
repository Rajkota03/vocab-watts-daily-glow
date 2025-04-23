
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Shield } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  userNickname: string;
  handleSignOut: () => Promise<void>;
  isAdmin: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userNickname,
  handleSignOut,
  isAdmin
}) => {
  return (
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
            </div>
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

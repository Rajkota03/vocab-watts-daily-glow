
import React from 'react';
import { Check, Lock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface CategoryGridProps {
  selectedPrimary: string | null;
  onPrimarySelect: (primary: string) => void;
  isFreeTrialUser?: boolean;
  isPro?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  selectedPrimary, 
  onPrimarySelect,
  isFreeTrialUser = false,
  isPro = false
}) => {
  const categories = [
    {
      id: 'daily',
      name: 'Daily Words',
      description: 'General vocabulary for everyday use',
      proOnly: false,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 5.83333V10H14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional vocabulary for the workplace',
      proOnly: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 5.83333H3.33333C2.8731 5.83333 2.5 6.20643 2.5 6.66667V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V6.66667C17.5 6.20643 17.1269 5.83333 16.6667 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 5.83333V4.16667C13.3333 3.72464 13.1577 3.30072 12.8452 2.98816C12.5326 2.67559 12.1087 2.5 11.6667 2.5H8.33333C7.89131 2.5 7.46738 2.67559 7.15482 2.98816C6.84226 3.30072 6.66667 3.72464 6.66667 4.16667V5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Vocabulary for standardized tests',
      proOnly: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.8333 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33334 2.89131 3.33334 3.33334V16.6667C3.33334 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V7.5L10.8333 1.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.8333 1.66667V7.5H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'slang',
      name: 'Slang',
      description: 'Modern slang and idioms',
      proOnly: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.5 7.5H7.50833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          // For free trial users, all categories except 'daily' are disabled
          // For pro users, no categories should be disabled
          const isDisabled = (isFreeTrialUser && category.id !== 'daily') || 
                            (!isPro && category.proOnly);
          
          const isSelected = selectedPrimary === category.id;
          
          return (
            <HoverCard key={category.id}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "relative rounded-lg p-4 cursor-pointer border transition-all",
                    isSelected ? "border-primary bg-primary/5" : "border-gray-200",
                    isDisabled ? "opacity-75 hover:border-gray-300" : "hover:border-primary/50",
                    isDisabled && "cursor-not-allowed bg-gray-50"
                  )}
                  onClick={() => !isDisabled && onPrimarySelect(category.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                      isSelected ? "bg-primary/20 text-primary" : isDisabled ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-600"
                    )}>
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-medium",
                          isDisabled ? "text-gray-500" : "text-gray-900"
                        )}>
                          {category.name}
                        </h3>
                        {category.proOnly && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded">Pro</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1",
                        isDisabled ? "text-gray-400" : "text-gray-500"
                      )}>
                        {category.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {isDisabled && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-2 right-2 w-5 h-5 bg-gray-400/80 rounded-full flex items-center justify-center text-white">
                            <Lock className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upgrade to Pro to unlock</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </HoverCardTrigger>
              {isDisabled && (
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Unlock {category.name} with Pro</h4>
                      <p className="text-sm text-gray-600">
                        Get access to {category.name.toLowerCase()} vocabulary and many more premium features with a Pro subscription.
                      </p>
                      <div className="flex items-center pt-2">
                        <Info className="h-4 w-4 text-primary mr-2" />
                        <span className="text-xs text-primary">Currently in free trial mode</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default CategoryGrid;

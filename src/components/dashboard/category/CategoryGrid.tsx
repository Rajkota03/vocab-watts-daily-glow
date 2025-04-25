
import React from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  selectedPrimary: string | null;
  onPrimarySelect: (primary: string) => void;
  isFreeTrialUser?: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  proOnly?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  selectedPrimary, 
  onPrimarySelect,
  isFreeTrialUser = false
}) => {
  const categories: CategoryOption[] = [
    {
      id: 'daily',
      name: 'Daily Words',
      description: 'General vocabulary for everyday use',
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
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6667 5.83333H3.33333C2.8731 5.83333 2.5 6.20643 2.5 6.66667V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V6.66667C17.5 6.20643 17.1269 5.83333 16.6667 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 5.83333V4.16667C13.3333 3.72464 13.1577 3.30072 12.8452 2.98816C12.5326 2.67559 12.1087 2.5 11.6667 2.5H8.33333C7.89131 2.5 7.46738 2.67559 7.15482 2.98816C6.84226 3.30072 6.66667 3.72464 6.66667 4.16667V5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 11.3667C15.2529 12.6834 12.6543 13.3662 10 13.3333C7.34673 13.3657 4.74906 12.683 2.5 11.3667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.75 10H11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      proOnly: true
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Vocabulary for standardized tests',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.8333 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33334 2.89131 3.33334 3.33334V16.6667C3.33334 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V7.5L10.8333 1.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.8333 1.66667V7.5H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 10.8333H6.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.3333 14.1667H6.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.33333 7.5H7.5H6.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      proOnly: true
    },
    {
      id: 'slang',
      name: 'Slang',
      description: 'Modern slang and idioms',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.66667 11.6667C6.66667 11.6667 7.91667 13.3333 10 13.3333C12.0833 13.3333 13.3333 11.6667 13.3333 11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.5 7.5H7.50833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.5 7.5H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      proOnly: true
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => {
        const isDisabled = isFreeTrialUser && category.id !== 'daily';
        const isSelected = selectedPrimary === category.id;
        
        return (
          <div
            key={category.id}
            className={cn(
              "relative rounded-lg p-4 cursor-pointer border transition-all",
              isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
              isDisabled && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => !isDisabled && onPrimarySelect(category.id)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-600"
              )}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.proOnly && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded">Pro</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
              {isDisabled && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white">
                  <Lock className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;

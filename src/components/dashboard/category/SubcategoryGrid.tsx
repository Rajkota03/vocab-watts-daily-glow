
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubcategoryOption {
  id: string;
  name: string;
  description?: string;
  proOnly?: boolean;
}

interface SubcategoryGridProps {
  selectedPrimary: string | null;
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string) => void;
  isFreeTrialUser?: boolean;
  isPro?: boolean;
}

const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({ 
  selectedPrimary, 
  selectedSubcategory, 
  onSubcategorySelect,
  isFreeTrialUser = false,
  isPro = false
}) => {
  const subcategories: {[key: string]: SubcategoryOption[]} = {
    daily: [
      { id: 'beginner', name: 'Beginner' },
      { id: 'intermediate', name: 'Intermediate' },
      { id: 'advanced', name: 'Advanced', proOnly: true },
      { id: 'expert', name: 'Expert', proOnly: true }
    ],
    business: [
      { id: 'beginner', name: 'Beginner' },
      { id: 'intermediate', name: 'Intermediate' },
      { id: 'finance', name: 'Finance', proOnly: true },
      { id: 'marketing', name: 'Marketing', proOnly: true }
    ],
    exam: [
      { id: 'gre', name: 'GRE' },
      { id: 'toefl', name: 'TOEFL' },
      { id: 'sat', name: 'SAT', proOnly: true },
      { id: 'ielts', name: 'IELTS', proOnly: true }
    ],
    slang: [
      { id: 'beginner', name: 'Beginner' },
      { id: 'intermediate', name: 'Intermediate' },
      { id: 'advanced', name: 'Advanced', proOnly: true },
      { id: 'americanisms', name: 'American', proOnly: true }
    ]
  };

  if (!selectedPrimary || !subcategories[selectedPrimary]) {
    return null;
  }

  const options = subcategories[selectedPrimary];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Subcategory</h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          // For Pro users, all options should be enabled regardless of proOnly status
          // For free trial users, options with proOnly should be disabled
          // For regular users who are not pro, options with proOnly should be disabled
          const isDisabled = (!isPro && option.proOnly);
                         
          const isSelected = selectedSubcategory === option.id;
          
          return (
            <div
              key={option.id}
              className={cn(
                "relative rounded-lg p-3 cursor-pointer border hover:border-primary/50 transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-gray-200",
                isDisabled ? "opacity-50 cursor-not-allowed hover:border-gray-200 bg-gray-50" : ""
              )}
              onClick={() => !isDisabled && onSubcategorySelect(option.id)}
            >
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-medium",
                  isDisabled ? "text-gray-500" : "text-gray-900"
                )}>
                  {option.name}
                </h4>
                {option.proOnly && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded">Pro</span>
                )}
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubcategoryGrid;


import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubcategoryGridProps {
  selectedPrimary: string | null;
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string) => void;
  isPro: boolean;
}

const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({
  selectedPrimary,
  selectedSubcategory,
  onSubcategorySelect,
  isPro
}) => {
  const examTypes = [
    { 
      id: 'gre', 
      name: 'GRE',
      description: 'Graduate Record Examination',
      color: 'from-red-500/20 to-red-600/20',
      textColor: 'text-red-700',
      activeColor: 'from-red-500/30 to-red-600/30',
      proOnly: true
    },
    { 
      id: 'ielts', 
      name: 'IELTS',
      description: 'English Language Testing',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-700',
      activeColor: 'from-blue-500/30 to-blue-600/30',
      proOnly: true
    },
    { 
      id: 'toefl', 
      name: 'TOEFL',
      description: 'Test of English as Foreign Language',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-700',
      activeColor: 'from-green-500/30 to-green-600/30',
      proOnly: true
    },
    { 
      id: 'cat', 
      name: 'CAT',
      description: 'Common Admission Test',
      color: 'from-amber-500/20 to-amber-600/20',
      textColor: 'text-amber-700',
      activeColor: 'from-amber-500/30 to-amber-600/30',
      proOnly: true
    },
    { 
      id: 'gmat', 
      name: 'GMAT',
      description: 'Graduate Management Test',
      color: 'from-indigo-500/20 to-indigo-600/20',
      textColor: 'text-indigo-700',
      activeColor: 'from-indigo-500/30 to-indigo-600/30',
      proOnly: true
    }
  ];
  
  const difficultyLevels = [
    { 
      id: 'beginner', 
      name: 'Beginner',
      description: 'Basic everyday vocabulary',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-700',
      activeColor: 'from-green-500/30 to-green-600/30',
      proOnly: false
    },
    { 
      id: 'intermediate', 
      name: 'Intermediate',
      description: 'Challenging vocabulary',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-700',
      activeColor: 'from-blue-500/30 to-blue-600/30',
      proOnly: false
    },
    { 
      id: 'professional', 
      name: 'Professional',
      description: 'Advanced terminology',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-700',
      activeColor: 'from-purple-500/30 to-purple-600/30',
      proOnly: true
    }
  ];

  if (!selectedPrimary) return null;
  
  // Filter subcategories based on pro status
  const subcategories = selectedPrimary === 'exam'
    ? examTypes  // All exam types require pro
    : difficultyLevels;

  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategorySelect(subcategoryId);
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        {selectedPrimary === 'exam' ? 'Exam Type' : 'Difficulty Level'}
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {subcategories.map((level) => (
          <TooltipProvider key={level.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <button
                    onClick={() => handleSubcategorySelect(level.id)}
                    className={cn(
                      "p-4 rounded-xl text-sm transition-all duration-200 w-full",
                      "bg-gradient-to-br shadow-sm flex flex-col items-center text-center min-h-[100px] justify-center",
                      level.color,
                      "hover:shadow-md",
                      selectedSubcategory === level.id && [
                        "ring-2 ring-offset-2",
                        level.activeColor
                      ]
                    )}
                  >
                    <span className="font-semibold mb-1">{level.name}</span>
                    <span className="text-xs opacity-75 px-2">
                      {level.description}
                    </span>
                  </button>
                </div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-3">
        Switch anytime. We'll adjust your word complexity automatically.
      </p>
    </div>
  );
};

export default SubcategoryGrid;


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
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (selectedPrimary === 'exam' && !isPro) {
      return; // Pro only
    }
    // Fixed the type issue by safely checking if proOnly exists and is true
    if (!isPro && subcategory && subcategory.proOnly === true) {
      return; // Pro only
    }
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
                      ],
                      (
                        (!isPro && selectedPrimary === 'exam') || 
                        (!isPro && level.proOnly === true)
                      ) && "opacity-50"
                    )}
                    disabled={(!isPro && selectedPrimary === 'exam') || (!isPro && level.proOnly === true)}
                  >
                    <span className="font-semibold mb-1">{level.name}</span>
                    <span className="text-xs opacity-75 px-2">
                      {level.description}
                    </span>
                    
                    {((!isPro && selectedPrimary === 'exam') || (!isPro && level.proOnly === true)) && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                        <Lock className="h-3 w-3 text-amber-500" />
                      </div>
                    )}
                  </button>
                </div>
              </TooltipTrigger>
              {((!isPro && selectedPrimary === 'exam') || (!isPro && level.proOnly === true)) && (
                <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-800">
                    <p>Pro Feature: {level.name}</p>
                    <p className="text-[10px] opacity-90">Upgrade to access all difficulty levels</p>
                  </div>
                </TooltipContent>
              )}
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

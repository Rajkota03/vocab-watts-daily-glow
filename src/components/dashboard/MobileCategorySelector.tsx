
import React, { useState } from 'react';
import { 
  ArrowLeft, Brain, Briefcase, Target, Smile, Sparkles, 
  Heart, GraduationCap, CheckCircle, Zap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileCategorySelectorProps {
  isPro: boolean;
  currentCategory: string;
  selectedPrimary: string | null;
  selectedSubcategory: string | null;
  onPrimarySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  onApplySelection: () => void;
  isLoadingNewBatch?: boolean;
}

const MobileCategorySelector: React.FC<MobileCategorySelectorProps> = ({
  isPro,
  currentCategory,
  selectedPrimary,
  selectedSubcategory,
  onPrimarySelect,
  onSubcategorySelect,
  onApplySelection,
  isLoadingNewBatch = false
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(selectedPrimary ? (selectedSubcategory ? 3 : 2) : 1);
  const isMobile = useIsMobile();
  
  // Primary categories
  const primaryCategories = [
    {
      id: 'daily',
      name: 'Daily English',
      description: 'Everyday vocabulary for casual conversation',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary for work',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in your next interview',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions and casual language',
      icon: <Smile className="h-5 w-5" />,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Elegant and uncommon vocabulary',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Words to express thoughts and feelings',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Advanced words for tests and exams',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'bg-teal-100 text-teal-600',
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Easy and common words',
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Moderately challenging vocabulary',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced and formal vocabulary',
      color: 'bg-purple-100 text-purple-600',
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Complex, high-difficulty words',
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'Academic/formal tone',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Clarity + comprehension focus',
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Analytical English, often abstract',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Business + formal professional vocab',
      color: 'bg-purple-100 text-purple-600',
    }
  ];
  
  const getSubcategories = () => {
    return selectedPrimary === 'exam' ? examTypes : difficultyLevels;
  };
  
  const selectedCategory = primaryCategories.find(c => c.id === selectedPrimary);
  const selectedSubcategoryData = getSubcategories().find(s => s.id === selectedSubcategory);
  
  const handlePrimarySelect = (categoryId: string) => {
    onPrimarySelect(categoryId);
    setStep(2);
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategorySelect(subcategoryId);
    setStep(3);
  };
  
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
  };
  
  const isFullySelected = selectedPrimary && selectedSubcategory;
  
  return (
    <div className="flex flex-col min-h-[500px]">
      {/* Progress bar at top */}
      <div className="mb-6 px-4">
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-vocab-purple h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={step >= 1 ? "text-vocab-purple font-medium" : ""}>Category</span>
          <span className={step >= 2 ? "text-vocab-purple font-medium" : ""}>Level</span>
          <span className={step >= 3 ? "text-vocab-purple font-medium" : ""}>Apply</span>
        </div>
      </div>
      
      {/* Step 1: Primary Category Selection */}
      {step === 1 && (
        <div className="animate-fade-in px-4 flex-1">
          <h3 className="text-xl font-medium mb-6 text-center">What would you like to learn?</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {primaryCategories.map((category) => (
              <Card 
                key={category.id}
                onClick={() => isPro && handlePrimarySelect(category.id)}
                className={cn(
                  "border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden",
                  selectedPrimary === category.id && "ring-2 ring-vocab-purple shadow-md"
                )}
              >
                <div className="flex items-center p-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    category.color
                  )}>
                    {category.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-base">{category.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Subcategory Selection */}
      {step === 2 && selectedPrimary && (
        <div className="animate-fade-in px-4 flex-1">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-1 mr-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-medium">Choose your level</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {getSubcategories().map((level) => (
              <Card 
                key={level.id}
                onClick={() => handleSubcategorySelect(level.id)}
                className={cn(
                  "border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden",
                  selectedSubcategory === level.id && "ring-2 ring-vocab-purple shadow-md"
                )}
              >
                <div className="flex items-center p-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    level.color
                  )}>
                    <CheckCircle className={cn(
                      "h-5 w-5",
                      selectedSubcategory === level.id ? "opacity-100" : "opacity-0"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-base">{level.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 3: Final Selection & Apply */}
      {step === 3 && isFullySelected && (
        <div className="animate-fade-in px-4 flex-1 flex flex-col">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-1 mr-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-medium">Confirm selection</h3>
          </div>
          
          <div className="flex-1">
            <Card className="border-0 shadow-md p-6 mb-6">
              <h4 className="text-gray-600 mb-4">Your selection</h4>
              
              <div className="flex items-center mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  selectedCategory?.color
                )}>
                  {selectedCategory?.icon}
                </div>
                <div>
                  <h3 className="font-medium text-base">{selectedCategory?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCategory?.description}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 my-4"></div>
              
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  selectedSubcategoryData?.color
                )}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-base">{selectedSubcategoryData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedSubcategoryData?.description}</p>
                </div>
              </div>
            </Card>
            
            <p className="text-center text-gray-600 text-sm mb-4">
              {selectedCategory?.name} vocabulary at {selectedSubcategoryData?.name} level will be generated for you.
            </p>
          </div>
          
          <Button
            onClick={onApplySelection}
            disabled={!isFullySelected || isLoadingNewBatch}
            className="w-full bg-vocab-purple hover:bg-vocab-purple/90 text-white h-14 rounded-xl shadow-md mt-auto"
          >
            {isLoadingNewBatch ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Apply & Generate Words
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCategorySelector;

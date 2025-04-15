
import React, { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Briefcase, MessageSquare, Smile, Sparkle, 
  Heart, GraduationCap, Check, Zap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
      description: 'Everyday vocabulary',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in interviews',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Uncommon vocabulary',
      icon: <Sparkle className="h-5 w-5" />,
      color: 'bg-pink-50 text-pink-600 border-pink-100',
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions',
      icon: <Smile className="h-5 w-5" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Express your thoughts',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Academic vocabulary',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Basic everyday vocabulary',
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Challenging vocabulary',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced terminology',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Graduate Record Examination',
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'International English Testing',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Test of English as Foreign Language',
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Common Admission Test',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Graduate Management Admission Test',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
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
            className="bg-gradient-to-r from-vocab-purple to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium">
          <span className={step >= 1 ? "text-vocab-purple" : "text-gray-400"}>Category</span>
          <span className={step >= 2 ? "text-vocab-purple" : "text-gray-400"}>Level</span>
          <span className={step >= 3 ? "text-vocab-purple" : "text-gray-400"}>Apply</span>
        </div>
      </div>
      
      {/* Step 1: Primary Category Selection */}
      {step === 1 && (
        <div className="animate-fade-in px-4 flex-1">
          <h3 className="text-xl font-bold mb-6 text-center text-gray-800">What would you like to learn?</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {primaryCategories.map((category) => (
              <Card 
                key={category.id}
                onClick={() => isPro && handlePrimarySelect(category.id)}
                className={cn(
                  "border-0 shadow-sm hover:shadow transition-all duration-200 cursor-pointer overflow-hidden bg-white",
                  selectedPrimary === category.id && "ring-1 ring-vocab-purple shadow"
                )}
              >
                <div className="flex items-center p-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    category.color.split(' ')[0]
                  )}>
                    {category.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-base">{category.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                  
                  {selectedPrimary === category.id && (
                    <div className="ml-2 rounded-full bg-vocab-purple h-6 w-6 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
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
            <h3 className="text-xl font-bold text-gray-800">Choose your level</h3>
          </div>
          
          <RadioGroup 
            value={selectedSubcategory || ""}
            onValueChange={(value) => handleSubcategorySelect(value)}
            className="grid grid-cols-1 gap-3"
          >
            {getSubcategories().map((level) => (
              <Card 
                key={level.id}
                className={cn(
                  "border-0 shadow-sm hover:shadow transition-all duration-200 overflow-hidden",
                  selectedSubcategory === level.id && "ring-1 ring-vocab-purple shadow"
                )}
              >
                <div className="flex items-center p-4">
                  <RadioGroupItem
                    value={level.id}
                    id={`step2-${level.id}`}
                    className="mr-4"
                  />
                  
                  <div className="flex-1">
                    <label 
                      htmlFor={`step2-${level.id}`} 
                      className="font-medium text-base cursor-pointer"
                    >
                      {level.name}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </RadioGroup>
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
            <h3 className="text-xl font-bold text-gray-800">Confirm selection</h3>
          </div>
          
          <div className="flex-1">
            <Card className="border-0 shadow p-6 mb-6 bg-white">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Your selection</h4>
              
              <div className="flex items-center mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  selectedCategory?.color.split(' ')[0]
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
                  selectedSubcategoryData?.color.split(' ')[0]
                )}>
                  <Check className="h-5 w-5" />
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
            className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-14 rounded-xl shadow-md mt-auto"
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

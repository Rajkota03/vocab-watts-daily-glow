
import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, Brain, Briefcase, Target, Smile, Sparkles, 
  Heart, GraduationCap, CheckCircle, Zap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

// Define the primary category type
interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  gradient: string;
}

// Define subcategory type
interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
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
  const [step, setStep] = useState<1 | 2>(selectedPrimary ? 2 : 1);
  
  // Primary categories
  const primaryCategories: PrimaryCategory[] = [
    {
      id: 'daily',
      name: 'Daily English',
      description: 'Everyday vocabulary for casual conversation',
      icon: <Brain className="h-5 w-5" />,
      emoji: '🧠',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary for work',
      icon: <Briefcase className="h-5 w-5" />,
      emoji: '💼',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in your next interview',
      icon: <Target className="h-5 w-5" />,
      emoji: '🎯',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions and casual language',
      icon: <Smile className="h-5 w-5" />,
      emoji: '🤪',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Elegant and uncommon vocabulary',
      icon: <Sparkles className="h-5 w-5" />,
      emoji: '✨',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Words to express thoughts and feelings',
      icon: <Heart className="h-5 w-5" />,
      emoji: '❤️',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Advanced words for tests and exams',
      icon: <GraduationCap className="h-5 w-5" />,
      emoji: '🎓',
      gradient: 'from-emerald-500 to-teal-600',
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels: Subcategory[] = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Easy and common words',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Moderately challenging vocabulary',
      icon: <CheckCircle className="h-5 w-5 text-yellow-600" />,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced and formal vocabulary',
      icon: <CheckCircle className="h-5 w-5 text-red-600" />,
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes: Subcategory[] = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Complex, high-difficulty words',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'Academic/formal tone',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Clarity + comprehension focus',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Analytical English, often abstract',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Business + formal professional vocab',
      icon: <CheckCircle className="h-5 w-5" />,
    }
  ];
  
  const getSubcategories = () => {
    return selectedPrimary === 'exam' ? examTypes : difficultyLevels;
  };
  
  const selectedCategory = primaryCategories.find(c => c.id === selectedPrimary);
  
  const handlePrimarySelect = (categoryId: string) => {
    onPrimarySelect(categoryId);
    setStep(2);
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategorySelect(subcategoryId);
  };
  
  const handleBack = () => {
    setStep(1);
  };
  
  const isFullySelected = selectedPrimary && selectedSubcategory;
  
  return (
    <div className="flex flex-col">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6 px-4">
        <div className={`h-1 rounded-full ${step >= 1 ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 1 ? 'bg-vocab-purple text-white' : 'bg-gray-200 text-gray-500'
        } mx-2`}>1</div>
        <div className={`h-1 rounded-full ${step >= 2 ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 2 ? 'bg-vocab-purple text-white' : 'bg-gray-200 text-gray-500'
        } mx-2`}>2</div>
        <div className={`h-1 rounded-full ${isFullySelected ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
      </div>
      
      {/* Step 1: Primary Category Selection */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-medium text-center mb-6">Choose a Category</h3>
          
          <div className="grid grid-cols-1 gap-3 px-4">
            {primaryCategories.map((category) => {
              const isSelected = selectedPrimary === category.id;
              
              return (
                <Card 
                  key={category.id}
                  onClick={() => isPro && handlePrimarySelect(category.id)}
                  className={cn(
                    "relative overflow-hidden border-0 shadow-md cursor-pointer transform transition-all hover:translate-y-[-2px]",
                    isSelected && "ring-2 ring-vocab-purple"
                  )}
                >
                  {/* Background gradient overlay */}
                  <div className={cn(
                    "absolute inset-0 opacity-5",
                    `bg-gradient-to-r ${category.gradient}`
                  )}></div>
                  
                  <div className="flex items-center p-4">
                    <div className={cn(
                      "flex-shrink-0 rounded-full p-3 flex items-center justify-center",
                      isSelected 
                        ? `bg-gradient-to-br ${category.gradient} text-white`
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {category.icon}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h3 className={`text-base font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                          {category.name}
                        </h3>
                        <span className="ml-1 text-lg" aria-hidden="true">
                          {category.emoji}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Step 2: Subcategory Selection */}
      {step === 2 && selectedPrimary && (
        <div className="animate-fade-in px-4">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 mr-2" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <h3 className="text-lg font-medium flex-1">
              {selectedCategory?.name} 
              <span className="ml-1">{selectedCategory?.emoji}</span>
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            {selectedPrimary === 'exam' ? 'Select exam type' : 'Choose difficulty level'}
          </p>
          
          <RadioGroup 
            value={selectedSubcategory || ""}
            onValueChange={handleSubcategorySelect}
            className="space-y-3"
          >
            {getSubcategories().map((subcategory) => {
              const isSelected = selectedSubcategory === subcategory.id;
              
              return (
                <div 
                  key={subcategory.id}
                  className={cn(
                    "relative overflow-hidden rounded-xl shadow-sm border-0 transition-all",
                    isSelected ? "ring-2 ring-vocab-purple shadow-md bg-vocab-purple/5" : "bg-white"
                  )}
                >
                  <label 
                    htmlFor={subcategory.id} 
                    className="flex items-center p-4 cursor-pointer"
                  >
                    <RadioGroupItem 
                      value={subcategory.id} 
                      id={subcategory.id}
                      className="mr-3"
                    />
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                        {subcategory.name}
                      </h4>
                      <p className="text-sm text-gray-500">{subcategory.description}</p>
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-vocab-purple ml-2" />
                    )}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
          
          {isFullySelected && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Button
                onClick={onApplySelection}
                disabled={!isFullySelected || isLoadingNewBatch}
                className="w-full bg-vocab-purple hover:bg-vocab-purple/90 text-white h-12 rounded-xl shadow-md"
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
      )}
    </div>
  );
};

export default MobileCategorySelector;

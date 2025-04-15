import React, { useState, useEffect } from 'react';
import { 
  Brain, Briefcase, Target, Smile, Sparkles, Heart, GraduationCap, 
  RefreshCw, Zap, CheckCircle, CircleCheck, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { generateWordsWithAI } from '@/services/wordService';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileCategorySelector from './MobileCategorySelector';
import ApiTestButton from './ApiTestButton';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (category: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
}

interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  gradient: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  isPro, 
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false
}) => {
  const isMobile = useIsMobile();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimaryCategory(parts[0]);
        setSelectedSubcategory(parts[1]);
        
        if (parts[0] && parts[1]) {
          setActiveStep(2);
        }
      } else if (currentCategory === 'business' || currentCategory === 'exam' || 
                currentCategory === 'slang' || currentCategory === 'general') {
        const mapping: { [key: string]: { primary: string, sub: string } } = {
          'business': { primary: 'business', sub: 'intermediate' },
          'exam': { primary: 'exam', sub: 'gre' },
          'slang': { primary: 'slang', sub: 'intermediate' },
          'general': { primary: 'daily', sub: 'intermediate' }
        };
        
        if (mapping[currentCategory]) {
          setSelectedPrimaryCategory(mapping[currentCategory].primary);
          setSelectedSubcategory(mapping[currentCategory].sub);
          setActiveStep(2);
        }
      }
    }
  }, [currentCategory]);
  
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

  const difficultyLevels: Subcategory[] = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Easy and common words',
      icon: <CircleCheck className="h-5 w-5 text-green-600" />,
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Moderately challenging vocabulary',
      icon: <CircleCheck className="h-5 w-5 text-yellow-600" />,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced and formal vocabulary',
      icon: <CircleCheck className="h-5 w-5 text-red-600" />,
    }
  ];

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
      icon: <CircleCheck className="h-5 w-5" />,
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Clarity + comprehension focus',
      icon: <CircleCheck className="h-5 w-5" />,
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Analytical English, often abstract',
      icon: <CircleCheck className="h-5 w-5" />,
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Business + formal professional vocab',
      icon: <CircleCheck className="h-5 w-5" />,
    }
  ];

  const handleNewBatchClick = async () => {
    if (onNewBatch) {
      try {
        await onNewBatch();
        toast({
          title: "New words batch generated!",
          description: `Fresh vocabulary words for ${selectedPrimaryCategory}-${selectedSubcategory} category have been added.`,
        });
      } catch (error) {
        console.error('Error generating new batch:', error);
        toast({
          title: "Error generating new words",
          description: "Could not generate new vocabulary words. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleGenerateAI = async () => {
    if (!isPro) {
      toast({
        title: "Pro feature",
        description: "AI-generated vocabulary is only available for Pro users.",
        variant: "default"
      });
      return;
    }
    
    if (!selectedPrimaryCategory || !selectedSubcategory) {
      toast({
        title: "Selection required",
        description: "Please select both a category and subcategory first.",
        variant: "default"
      });
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const fullCategory = `${selectedPrimaryCategory}-${selectedSubcategory}`;
      const words = await generateWordsWithAI(fullCategory, 5);
      toast({
        title: "AI-generated words added!",
        description: `${words.length} new vocabulary words were created with AI.`,
      });
      
      const wordHistoryEl = document.getElementById('word-history');
      if (wordHistoryEl) {
        wordHistoryEl.classList.add('refresh-triggered');
        setTimeout(() => wordHistoryEl.classList.remove('refresh-triggered'), 100);
      }
      
      const refreshEvent = new CustomEvent('refresh-word-history', {
        detail: { category: fullCategory, force: true }
      });
      document.dispatchEvent(refreshEvent);
    } catch (error) {
      console.error('Error generating AI words:', error);
      toast({
        title: "AI generation failed",
        description: "Could not generate words with AI. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  const handlePrimaryCategoryClick = (categoryId: string) => {
    if (!isPro) return;
    
    setSelectedPrimaryCategory(categoryId);
    setSelectedSubcategory(null);
    setActiveStep(2);
  };
  
  const handleSubcategoryClick = (subcategoryId: string) => {
    if (!isPro || !selectedPrimaryCategory) return;
    
    setSelectedSubcategory(subcategoryId);
    onCategoryUpdate(selectedPrimaryCategory, subcategoryId);
  };
  
  const getSubcategories = () => {
    return selectedPrimaryCategory === 'exam' ? examTypes : difficultyLevels;
  };
  
  const isFullySelected = selectedPrimaryCategory && selectedSubcategory;

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-800">Word Category</h3>
          
          {isPro && isFullySelected && (
            <Button 
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !isFullySelected}
              className="bg-duolingo-purple hover:bg-duolingo-purple/90 text-white"
              size="sm"
            >
              <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
              {isGeneratingAI ? 'AI...' : 'Gen AI'}
            </Button>
          )}
        </div>
        
        <MobileCategorySelector
          isPro={isPro}
          currentCategory={currentCategory}
          selectedPrimary={selectedPrimaryCategory}
          selectedSubcategory={selectedSubcategory}
          onPrimarySelect={handlePrimaryCategoryClick}
          onSubcategorySelect={handleSubcategoryClick}
          onApplySelection={handleNewBatchClick}
          isLoadingNewBatch={isLoadingNewBatch}
        />

        {isPro && isFullySelected && (
          <div className="pt-6 mt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">API Testing</h3>
            <p className="text-gray-600 mb-3">
              Test the vocabulary generation API by sending a sample set of words to your email.
            </p>
            <ApiTestButton category={`${selectedPrimaryCategory}-${selectedSubcategory}`} />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-800">Select Your Word Category</h3>
        <div className="flex gap-2">
          {isPro && isFullySelected && (
            <>
              <Button 
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || !isFullySelected}
                className="bg-duolingo-purple hover:bg-duolingo-purple/90 text-white"
                size="sm"
              >
                <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
                {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
              </Button>
              
              {onNewBatch && (
                <Button 
                  onClick={handleNewBatchClick}
                  disabled={isLoadingNewBatch || !isFullySelected}
                  className="bg-vocab-purple hover:bg-vocab-purple/90 text-white"
                  size="sm"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingNewBatch ? 'animate-spin' : ''}`} />
                  {isLoadingNewBatch ? 'Generating...' : 'New Batch'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="w-full flex items-center mb-6">
        <div className={`h-1 rounded-full ${activeStep >= 1 ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
          activeStep >= 1 ? 'bg-vocab-purple text-white' : 'bg-gray-200 text-gray-500'
        } mx-2`}>1</div>
        <div className={`h-1 rounded-full ${activeStep >= 2 ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
          activeStep >= 2 ? 'bg-vocab-purple text-white' : 'bg-gray-200 text-gray-500'
        } mx-2`}>2</div>
        <div className={`h-1 rounded-full ${activeStep >= 3 ? 'bg-vocab-purple' : 'bg-gray-200'} flex-1`}></div>
      </div>
      
      <div className={`space-y-4 ${activeStep === 1 ? 'block' : activeStep > 1 ? 'hidden sm:block' : 'hidden'}`}>
        <h4 className="text-sm font-medium mb-3 text-gray-600">Step 1: Choose a Category</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {primaryCategories.map((category) => {
            const isSelected = isPro && selectedPrimaryCategory === category.id;
            
            return (
              <div 
                key={category.id}
                onClick={() => isPro && handlePrimaryCategoryClick(category.id)}
                className={`cursor-pointer transition-all rounded-xl overflow-hidden hover:shadow-md 
                  ${isSelected 
                    ? 'ring-2 ring-vocab-purple shadow-md bg-vocab-purple/5' 
                    : isPro 
                    ? 'border border-gray-200 hover:border-gray-300' 
                    : 'opacity-70 border border-gray-200'
                  }`}
              >
                <div className="flex items-center p-3 h-full">
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    isSelected 
                      ? `bg-gradient-to-br ${category.gradient} text-white`
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.icon}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <h3 className={`text-sm font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                        {category.name}
                      </h3>
                      <span className="ml-1 text-base" aria-hidden="true">
                        {category.emoji}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
                    
                    {isSelected && (
                      <div className="mt-1 flex items-center text-xs text-vocab-purple font-medium">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <ArrowRight className="h-4 w-4 text-vocab-purple ml-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedPrimaryCategory && isPro && (
        <div className={`space-y-4 animate-fade-in ${activeStep === 2 ? 'block' : 'hidden sm:block'}`}>
          <h4 className="text-sm font-medium mb-3 text-gray-600">
            Step 2: {selectedPrimaryCategory === 'exam' ? 'Select Exam Type' : 'Choose Difficulty Level'}
          </h4>
          
          <RadioGroup 
            value={selectedSubcategory || ""} 
            onValueChange={handleSubcategoryClick}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {getSubcategories().map((subcategory) => {
              const isSelected = selectedSubcategory === subcategory.id;
              
              return (
                <div 
                  key={subcategory.id}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all
                    ${isSelected 
                      ? 'ring-2 ring-vocab-purple shadow-md bg-vocab-purple/5' 
                      : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <RadioGroupItem 
                    value={subcategory.id} 
                    id={subcategory.id}
                    className={isSelected ? 'text-vocab-purple' : ''}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={subcategory.id} 
                      className={`font-medium text-sm cursor-pointer ${isSelected ? 'text-vocab-purple' : ''}`}
                    >
                      {subcategory.name}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">{subcategory.description}</p>
                  </div>
                  {subcategory.icon}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}
      
      {selectedPrimaryCategory && selectedSubcategory && isPro && (
        <div className="mt-8 pt-4 border-t border-gray-200 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-gray-800">Your Selection:</h4>
              <p className="text-sm text-gray-600 flex items-center">
                <span>{primaryCategories.find(c => c.id === selectedPrimaryCategory)?.emoji}</span>
                <span className="ml-1">{primaryCategories.find(c => c.id === selectedPrimaryCategory)?.name}</span>
                <ArrowRight className="mx-1 h-3 w-3 text-gray-400" />
                <span>{getSubcategories().find(s => s.id === selectedSubcategory)?.name}</span>
              </p>
            </div>
            <Button
              onClick={() => {
                if (isFullySelected) {
                  handleNewBatchClick();
                  setActiveStep(3);
                }
              }}
              disabled={!isFullySelected || isLoadingNewBatch}
              className="w-full sm:w-auto bg-vocab-purple hover:bg-vocab-purple/90 text-white"
            >
              <Zap className="mr-2 h-4 w-4" />
              Apply Selection
            </Button>
          </div>
        </div>
      )}
      
      {isPro && isFullySelected && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Testing</h3>
          <p className="text-gray-600 mb-3">
            Test the vocabulary generation API by sending a sample set of words to your email.
          </p>
          <ApiTestButton category={`${selectedPrimaryCategory}-${selectedSubcategory}`} />
        </div>
      )}
    </div>
  );
};

export default CategorySelection;


import React, { useState, useEffect } from 'react';
import { 
  Brain, Briefcase, Target, Smile, Sparkles, Heart, GraduationCap, 
  RefreshCw, Zap, CheckCircle, CircleCheck, CircleDashed, CircleDot
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateWordsWithAI } from '@/services/wordService';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (category: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
}

// Define the primary category type
interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  emoji: string;
}

// Define difficulty subcategory type
interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Define exam subcategory type
interface ExamType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  isPro, 
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [categoryType, setCategoryType] = useState<string | null>(null);

  // Parse current category to set initial selections
  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimaryCategory(parts[0]);
        setSelectedSubcategory(parts[1]);
        setCategoryType(parts[0] === 'exam' ? 'exam' : 'difficulty');
      } else if (currentCategory === 'business' || currentCategory === 'exam' || 
                currentCategory === 'slang' || currentCategory === 'general') {
        // Handle legacy categories
        const mapping: { [key: string]: { primary: string, sub: string } } = {
          'business': { primary: 'business', sub: 'intermediate' },
          'exam': { primary: 'exam', sub: 'gre' },
          'slang': { primary: 'slang', sub: 'intermediate' },
          'general': { primary: 'daily', sub: 'intermediate' }
        };
        
        if (mapping[currentCategory]) {
          setSelectedPrimaryCategory(mapping[currentCategory].primary);
          setSelectedSubcategory(mapping[currentCategory].sub);
          setCategoryType(currentCategory === 'exam' ? 'exam' : 'difficulty');
        }
      }
    }
  }, [currentCategory]);
  
  // Primary categories
  const primaryCategories: PrimaryCategory[] = [
    {
      id: 'daily',
      name: 'Daily English',
      description: 'Everyday vocabulary for casual conversation',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600',
      gradient: 'from-purple-500 to-indigo-600',
      emoji: '🧠'
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary for work',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
      gradient: 'from-blue-500 to-indigo-600',
      emoji: '💼'
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in your next interview',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-emerald-100 text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
      emoji: '🎯'
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions and casual language',
      icon: <Smile className="h-6 w-6" />,
      color: 'bg-amber-100 text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
      emoji: '🤪'
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Elegant and uncommon vocabulary',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'bg-pink-100 text-pink-600',
      gradient: 'from-pink-500 to-rose-600',
      emoji: '✨'
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Words to express thoughts and feelings',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600',
      gradient: 'from-red-500 to-rose-600',
      emoji: '❤️'
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Advanced words for tests and exams',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-emerald-100 text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
      emoji: '🎓'
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels: DifficultyLevel[] = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Easy and common words',
      icon: <CircleCheck className="h-5 w-5 text-green-600" />,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Moderately challenging vocabulary',
      icon: <CircleDashed className="h-5 w-5 text-yellow-600" />,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced and formal vocabulary',
      icon: <CircleDot className="h-5 w-5 text-red-600" />,
      color: 'bg-red-100 text-red-700',
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes: ExamType[] = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Complex, high-difficulty words',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'Academic/formal tone',
      icon: <CircleCheck className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Clarity + comprehension focus',
      icon: <CircleCheck className="h-5 w-5" />,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Analytical English, often abstract',
      icon: <CircleCheck className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Business + formal professional vocab',
      icon: <CircleCheck className="h-5 w-5" />,
      color: 'bg-emerald-100 text-emerald-700',
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
      
      // Trigger refresh of the word history component
      const wordHistoryEl = document.getElementById('word-history');
      if (wordHistoryEl) {
        wordHistoryEl.classList.add('refresh-triggered');
        setTimeout(() => wordHistoryEl.classList.remove('refresh-triggered'), 100);
      }
      
      // Dispatch the refresh event for better compatibility
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
    setCategoryType(categoryId === 'exam' ? 'exam' : 'difficulty');
    setSelectedSubcategory(null); // Reset subcategory when primary changes
  };
  
  const handleSubcategoryClick = (subcategoryId: string) => {
    if (!isPro || !selectedPrimaryCategory) return;
    
    setSelectedSubcategory(subcategoryId);
    const fullCategory = `${selectedPrimaryCategory}-${subcategoryId}`;
    onCategoryUpdate(selectedPrimaryCategory, subcategoryId);
  };
  
  const isFullySelected = selectedPrimaryCategory && selectedSubcategory;
  const getCompositeCategoryId = () => isFullySelected ? `${selectedPrimaryCategory}-${selectedSubcategory}` : '';
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Select Your Word Category</h3>
        <div className="flex gap-2">
          {isPro && isFullySelected && (
            <Button 
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !isFullySelected}
              className="bg-duolingo-purple hover:bg-duolingo-purple/90 text-white"
            >
              <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
              {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
            </Button>
          )}
          {isPro && onNewBatch && isFullySelected && (
            <Button 
              onClick={handleNewBatchClick}
              disabled={isLoadingNewBatch || !isFullySelected}
              className="bg-vocab-purple hover:bg-vocab-purple/90 text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingNewBatch ? 'animate-spin' : ''}`} />
              {isLoadingNewBatch ? 'Generating...' : 'New Batch'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Primary Category Selection */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-600">Step 1: Choose a Category</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {primaryCategories.map((category) => {
            const isSelected = isPro && selectedPrimaryCategory === category.id;
            
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-2 border-vocab-purple bg-vocab-purple/5 shadow-md'
                    : isPro
                    ? 'hover:border-gray-300 border border-gray-200'
                    : 'opacity-70 border border-gray-200'
                }`}
                onClick={() => isPro && handlePrimaryCategoryClick(category.id)}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`rounded-lg p-2 ${
                      isSelected
                        ? `bg-gradient-to-br ${category.gradient} text-white`
                        : category.color
                    }`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className={`font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                          {category.name}
                        </h3>
                        <span className="ml-2 text-lg" aria-hidden="true">
                          {category.emoji}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                      
                      {isSelected && (
                        <div className="mt-2 flex items-center text-xs text-vocab-purple font-medium">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Subcategory Selection */}
      {selectedPrimaryCategory && isPro && (
        <div className="animate-fade-in">
          <h4 className="text-sm font-medium mb-3 text-gray-600">
            Step 2: {categoryType === 'exam' ? 'Select Exam Type' : 'Choose Difficulty Level'}
          </h4>
          
          {categoryType === 'exam' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {examTypes.map((exam) => {
                const isSelected = selectedSubcategory === exam.id;
                
                return (
                  <Card 
                    key={exam.id}
                    className={`cursor-pointer transition-all p-3 hover:shadow-md ${
                      isSelected
                        ? 'border-2 border-vocab-purple bg-vocab-purple/5 shadow-md'
                        : 'hover:border-gray-300 border border-gray-200'
                    }`}
                    onClick={() => handleSubcategoryClick(exam.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`rounded-full p-2 mb-2 ${exam.color}`}>
                        {exam.icon}
                      </div>
                      <h3 className={`font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                        {exam.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{exam.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficultyLevels.map((level) => {
                const isSelected = selectedSubcategory === level.id;
                
                return (
                  <Card 
                    key={level.id}
                    className={`cursor-pointer transition-all p-4 hover:shadow-md ${
                      isSelected
                        ? 'border-2 border-vocab-purple bg-vocab-purple/5 shadow-md'
                        : 'hover:border-gray-300 border border-gray-200'
                    }`}
                    onClick={() => handleSubcategoryClick(level.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full p-1.5 ${level.color}`}>
                        {level.icon}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isSelected ? 'text-vocab-purple' : ''}`}>
                          {level.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Continue Button / Selected Category Summary */}
      {selectedPrimaryCategory && selectedSubcategory && isPro && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-gray-800">Your Selection:</h4>
              <p className="text-sm text-gray-600">
                {primaryCategories.find(c => c.id === selectedPrimaryCategory)?.name} &rarr; {' '}
                {categoryType === 'exam' 
                  ? examTypes.find(e => e.id === selectedSubcategory)?.name 
                  : difficultyLevels.find(d => d.id === selectedSubcategory)?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (isFullySelected) {
                    handleNewBatchClick();
                  }
                }}
                disabled={!isFullySelected || isLoadingNewBatch}
                className="vuilder-btn-primary"
              >
                <Zap className="mr-2 h-4 w-4" />
                Apply Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelection;

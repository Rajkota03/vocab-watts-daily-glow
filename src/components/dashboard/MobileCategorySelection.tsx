
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Brain, Briefcase, Target, Smile, Sparkles, 
  Heart, GraduationCap, CheckCircle, Zap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileCategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (primary: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
}

const MobileCategorySelection: React.FC<MobileCategorySelectionProps> = ({
  isPro,
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false
}) => {
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Initialize from current category if available
  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimary(parts[0]);
        setSelectedSubcategory(parts[1]);
      }
    }
  }, [currentCategory]);

  // Primary categories
  const primaryCategories = [
    {
      id: 'daily',
      name: 'Daily English',
      description: 'Everyday vocabulary for casual conversation',
      emoji: '🧠',
      icon: <Brain className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary for work',
      emoji: '💼',
      icon: <Briefcase className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in your next interview',
      emoji: '🎯',
      icon: <Target className="h-5 w-5 text-green-600" />,
      color: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions and casual language',
      emoji: '🤪',
      icon: <Smile className="h-5 w-5 text-amber-600" />,
      color: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Elegant and uncommon vocabulary',
      emoji: '✨',
      icon: <Sparkles className="h-5 w-5 text-pink-600" />,
      color: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Words to express thoughts and feelings',
      emoji: '❤️',
      icon: <Heart className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Advanced words for tests and exams',
      emoji: '🎓',
      icon: <GraduationCap className="h-5 w-5 text-teal-600" />,
      color: 'bg-teal-50',
      textColor: 'text-teal-600'
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Easy and common words',
      emoji: '🟢',
      color: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Moderately challenging vocabulary',
      emoji: '🟡',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced and formal vocabulary',
      emoji: '🔴',
      color: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Complex, high-difficulty words',
      emoji: '🧠',
      color: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'Academic/formal tone',
      emoji: '🇬🇧',
      color: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Clarity + comprehension focus',
      emoji: '🇺🇸',
      color: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Analytical English, often abstract',
      emoji: '📈',
      color: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Business + formal professional vocab',
      emoji: '💹',
      color: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];
  
  const getSubcategories = () => {
    return selectedPrimary === 'exam' ? examTypes : difficultyLevels;
  };
  
  const handlePrimarySelect = (categoryId: string) => {
    setSelectedPrimary(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when primary changes
    setShowConfirmation(false); // Hide confirmation when primary changes
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setShowConfirmation(true); // Show confirmation when subcategory is selected
  };
  
  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      setSelectedPrimary(null);
      setSelectedSubcategory(null);
    }
  };
  
  const handleApply = async () => {
    if (selectedPrimary && selectedSubcategory) {
      onCategoryUpdate(selectedPrimary, selectedSubcategory);
      
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };
  
  const selectedCategoryData = primaryCategories.find(c => c.id === selectedPrimary);
  const selectedSubcategoryData = getSubcategories().find(s => s.id === selectedSubcategory);

  // Calculate progress percentage for the progress bar
  const progressPercentage = !selectedPrimary ? 33 : !selectedSubcategory ? 66 : 100;

  return (
    <div className="font-inter min-h-[80vh] flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-[#FF6B6B] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Content section */}
      <div className="flex-1 flex flex-col">
        {/* Back button (shown when a category is selected) */}
        {(selectedPrimary || showConfirmation) && (
          <button 
            onClick={handleBack}
            className="self-start p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {/* Step 3: Confirmation Screen (shown after selecting both category and subcategory) */}
        {showConfirmation && selectedPrimary && selectedSubcategory && (
          <div className="animate-fade-in flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Confirm Your Word Path</h2>
              <p className="text-gray-500 text-sm mt-1">Final Step</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-center mb-5">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  selectedCategoryData?.color
                )}>
                  <span className="text-2xl">{selectedCategoryData?.emoji}</span>
                </div>
                <div>
                  <h3 className={`font-medium ${selectedCategoryData?.textColor}`}>
                    {selectedCategoryData?.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{selectedCategoryData?.description}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-100 my-4"></div>
              
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                  selectedSubcategoryData?.color
                )}>
                  <span className="text-2xl">{selectedSubcategoryData?.emoji}</span>
                </div>
                <div>
                  <h3 className={`font-medium ${selectedSubcategoryData?.textColor}`}>
                    {selectedSubcategoryData?.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{selectedSubcategoryData?.description}</p>
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-600 text-sm mb-6 px-4">
              Your personalized word selection has been customized for 
              {' '}{selectedCategoryData?.name} at {selectedSubcategoryData?.name} level.
            </p>
            
            <Button
              onClick={handleApply}
              disabled={isLoadingNewBatch}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white rounded-xl py-4 h-14 mt-auto shadow-md transition-all"
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
        
        {/* Main selection area */}
        {!showConfirmation && (
          <>
            {/* Title changes based on selection state */}
            <div className="text-center mb-6">
              {!selectedPrimary ? (
                <>
                  <h2 className="text-xl font-semibold">Select Your Word Category</h2>
                  <p className="text-gray-500 text-sm mt-1">Step 1 of 3</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">
                    {selectedPrimary === 'exam' ? 'Select Exam Type' : 'Choose Difficulty Level'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Step 2 of 3</p>
                </>
              )}
            </div>
            
            {/* Rendering both sections in the same view, but conditionally showing one or both */}
            <div className="grid grid-cols-1 gap-6">
              {/* Primary Category Selection */}
              <div className={`grid grid-cols-1 gap-3.5 ${selectedPrimary ? 'animate-fade-out hidden' : 'animate-fade-in'}`}>
                {primaryCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handlePrimarySelect(category.id)}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-left transition-all ${category.color} border ${selectedPrimary === category.id ? 'border-gray-300' : 'border-transparent'} hover:border-gray-200 active:scale-[0.98]`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                      <span className="text-xl" aria-hidden="true">{category.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${category.textColor}`}>{category.name}</h3>
                      <p className="text-gray-600 text-sm mt-0.5 line-clamp-1">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Subcategory Selection (only shown when a primary category is selected) */}
              {selectedPrimary && (
                <div className="grid grid-cols-1 gap-3.5 animate-fade-in">
                  {getSubcategories().map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategorySelect(subcategory.id)}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-left transition-all ${subcategory.color} border ${selectedSubcategory === subcategory.id ? 'border-gray-300' : 'border-transparent'} hover:border-gray-200 active:scale-[0.98]`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                        <span className="text-xl" aria-hidden="true">{subcategory.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${subcategory.textColor}`}>{subcategory.name}</h3>
                        <p className="text-gray-600 text-sm mt-0.5 line-clamp-1">{subcategory.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileCategorySelection;


import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  GraduationCap, 
  Smile, 
  Sparkle,
  Heart,
  Zap, 
  RefreshCw,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  
  const handlePrimarySelect = (categoryId: string) => {
    setSelectedPrimary(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when primary changes
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };
  
  const handleApply = async () => {
    if (selectedPrimary && selectedSubcategory) {
      onCategoryUpdate(selectedPrimary, selectedSubcategory);
      
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };

  const selectedCategoryData = primaryCategories.find(cat => cat.id === selectedPrimary);
  const selectedSubcategoryData = getSubcategories().find(sub => sub.id === selectedSubcategory);
  
  return (
    <div className="font-inter flex flex-col space-y-8 px-2 pb-6">
      <div>
        <h2 className="text-2xl font-bold mb-1 text-gray-800">Select Your Word Category</h2>
        <h3 className="text-lg font-medium text-gray-600 mb-5">Step 1: Choose a Category</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {primaryCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handlePrimarySelect(category.id)}
              className={cn(
                "relative flex flex-col items-center justify-center h-28 p-4 rounded-2xl border transition-all duration-200",
                selectedPrimary === category.id 
                  ? `shadow-md ring-2 ring-vocab-purple/50 ${category.color}` 
                  : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/30"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full mb-2",
                category.color.split(' ')[0],
                selectedPrimary === category.id ? "scale-110" : ""
              )}>
                {category.icon}
              </div>
              <span className="font-medium text-sm text-center">{category.name}</span>
              
              {selectedPrimary === category.id && (
                <div className="absolute top-2 right-2 rounded-full bg-vocab-purple h-5 w-5 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-medium text-gray-600 mb-4">
            Step 2: Choose {selectedPrimary === 'exam' ? 'Exam Type' : 'Difficulty Level'}
          </h3>
          
          <RadioGroup 
            value={selectedSubcategory || ""}
            onValueChange={(value) => handleSubcategorySelect(value)}
            className="grid grid-cols-1 gap-3"
          >
            {getSubcategories().map((level) => (
              <div
                key={level.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border transition-all",
                  selectedSubcategory === level.id 
                    ? `shadow-sm ring-1 ring-vocab-purple/30 ${level.color}` 
                    : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/30"
                )}
              >
                <RadioGroupItem
                  value={level.id}
                  id={level.id}
                  className={selectedSubcategory === level.id ? "text-vocab-purple" : ""}
                />
                <div className="flex flex-col">
                  <label 
                    htmlFor={level.id} 
                    className="font-medium text-base cursor-pointer"
                  >
                    {level.name}
                  </label>
                  <span className="text-sm text-gray-600">{level.description}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      {selectedPrimary && selectedSubcategory && (
        <div className="mt-6 animate-fade-in">
          <div className="bg-gray-50 p-4 rounded-xl mb-5 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Summary</h4>
            <div className="flex items-center gap-3 mb-2">
              {selectedCategoryData && (
                <>
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    selectedCategoryData.color.split(' ')[0]
                  )}>
                    {selectedCategoryData.icon}
                  </div>
                  <span className="font-medium">{selectedCategoryData.name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2 ml-4">
              <div className="h-5 w-0.5 bg-gray-200 -ml-4"></div>
              {selectedSubcategoryData && (
                <span className="text-sm text-gray-700">{selectedSubcategoryData.name}</span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleApply}
            disabled={isLoadingNewBatch || !isPro}
            className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white rounded-xl py-6 h-auto font-medium"
          >
            {isLoadingNewBatch ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCategorySelection;

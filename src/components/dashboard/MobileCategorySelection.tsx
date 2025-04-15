
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
  RefreshCw 
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
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'business',
      name: 'Business English',
      description: 'Professional vocabulary',
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
    },
    {
      id: 'interview',
      name: 'Interview Power Words',
      description: 'Impress in interviews',
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    },
    {
      id: 'rare',
      name: 'Beautiful & Rare Words',
      description: 'Uncommon vocabulary',
      icon: <Sparkle className="h-5 w-5 text-pink-500" />,
    },
    {
      id: 'slang',
      name: 'Slang & Modern Lingo',
      description: 'Contemporary expressions',
      icon: <Smile className="h-5 w-5 text-amber-500" />,
    },
    {
      id: 'expression',
      name: 'Self-Expression',
      description: 'Express your thoughts',
      icon: <Heart className="h-5 w-5 text-red-500" />,
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      description: 'Academic vocabulary',
      icon: <GraduationCap className="h-5 w-5 text-blue-500" />,
    }
  ];

  // Difficulty levels (subcategories for most primary categories)
  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Basic everyday vocabulary',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Challenging vocabulary',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced terminology',
    }
  ];

  // Exam types (subcategories for Exam Prep)
  const examTypes = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Graduate Record Examination',
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'International English Testing',
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Test of English as Foreign Language',
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Common Admission Test',
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Graduate Management Admission Test',
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
  
  return (
    <div className="font-inter flex flex-col space-y-8 px-2 pb-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Select Your Word Category</h2>
        <h3 className="text-lg text-gray-600 mb-4">Step 1: Choose a Category</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {primaryCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handlePrimarySelect(category.id)}
              className={cn(
                "flex flex-col items-center text-left p-4 rounded-xl border border-gray-200 transition-all",
                selectedPrimary === category.id 
                  ? "ring-2 ring-purple-500 bg-purple-50" 
                  : "hover:border-purple-200 hover:bg-purple-50/30"
              )}
            >
              <div className="flex items-center justify-center w-10 h-10 mb-2">
                {category.icon}
              </div>
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-lg text-gray-600 mb-4">Step 2: Choose Difficulty Level</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {getSubcategories().map((level) => (
              <button
                key={level.id}
                onClick={() => handleSubcategorySelect(level.id)}
                className={cn(
                  "flex flex-col items-start justify-center p-4 rounded-xl border border-gray-200 transition-all",
                  selectedSubcategory === level.id 
                    ? "ring-2 ring-purple-500 bg-purple-50" 
                    : "hover:border-purple-200 hover:bg-purple-50/30"
                )}
              >
                <span className="font-medium text-lg mb-1">{level.name}</span>
                <span className="text-sm text-gray-600">{level.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedPrimary && selectedSubcategory && (
        <Button
          onClick={handleApply}
          disabled={isLoadingNewBatch || !isPro}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 h-auto font-medium mt-4"
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
      )}
    </div>
  );
};

export default MobileCategorySelection;

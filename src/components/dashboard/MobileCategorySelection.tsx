import React, { useState } from 'react';
import { 
  BookOpen, Briefcase, MessageSquare, 
  GraduationCap, Smile, Sparkles, Heart, Zap, RefreshCw, Check 
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
  
  const categories = [
    {
      id: 'daily',
      name: 'Daily',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'from-blue-500/20 to-blue-600/20 text-blue-600',
      hoverColor: 'hover:from-blue-500/30 hover:to-blue-600/30',
      activeColor: 'ring-blue-400 from-blue-500/30 to-blue-600/30'
    },
    {
      id: 'business',
      name: 'Business',
      icon: <Briefcase className="h-4 w-4" />,
      color: 'from-purple-500/20 to-purple-600/20 text-purple-600',
      hoverColor: 'hover:from-purple-500/30 hover:to-purple-600/30',
      activeColor: 'ring-purple-400 from-purple-500/30 to-purple-600/30'
    },
    {
      id: 'interview',
      name: 'Interview',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'from-green-500/20 to-green-600/20 text-green-600',
      hoverColor: 'hover:from-green-500/30 hover:to-green-600/30',
      activeColor: 'ring-green-400 from-green-500/30 to-green-600/30'
    },
    {
      id: 'slang',
      name: 'Slang',
      icon: <Smile className="h-4 w-4" />,
      color: 'from-amber-500/20 to-amber-600/20 text-amber-600',
      hoverColor: 'hover:from-amber-500/30 hover:to-amber-600/30',
      activeColor: 'ring-amber-400 from-amber-500/30 to-amber-600/30'
    },
    {
      id: 'rare',
      name: 'Rare',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'from-pink-500/20 to-pink-600/20 text-pink-600',
      hoverColor: 'hover:from-pink-500/30 hover:to-pink-600/30',
      activeColor: 'ring-pink-400 from-pink-500/30 to-pink-600/30'
    },
    {
      id: 'expression',
      name: 'Expression',
      icon: <Heart className="h-4 w-4" />,
      color: 'from-red-500/20 to-red-600/20 text-red-600',
      hoverColor: 'hover:from-red-500/30 hover:to-red-600/30',
      activeColor: 'ring-red-400 from-red-500/30 to-red-600/30'
    },
    {
      id: 'exam',
      name: 'Exam',
      icon: <GraduationCap className="h-4 w-4" />,
      color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600',
      hoverColor: 'hover:from-indigo-500/30 hover:to-indigo-600/30',
      activeColor: 'ring-indigo-400 from-indigo-500/30 to-indigo-600/30'
    }
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'professional', name: 'Professional' }
  ];

  const examTypes = [
    { id: 'gre', name: 'GRE' },
    { id: 'ielts', name: 'IELTS' },
    { id: 'toefl', name: 'TOEFL' },
    { id: 'cat', name: 'CAT' },
    { id: 'gmat', name: 'GMAT' }
  ];

  const handlePrimarySelect = (categoryId: string) => {
    if (!isPro) return;
    setSelectedPrimary(prevSelected => prevSelected === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
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
    <div className="flex flex-col space-y-4">
      <div>
        <h3 className="text-base font-medium mb-3 text-gray-800">Choose Your Category</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handlePrimarySelect(category.id)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200",
                "bg-gradient-to-br shadow-sm",
                category.color,
                category.hoverColor,
                selectedPrimary === category.id && [
                  "ring-2 ring-offset-2",
                  category.activeColor
                ],
                !isPro && "opacity-50"
              )}
            >
              <div className="mb-1.5">{category.icon}</div>
              <span className="text-xs font-medium">{category.name}</span>
              
              {selectedPrimary === category.id && (
                <div className="absolute -top-1 -right-1 rounded-full bg-white h-4 w-4 flex items-center justify-center shadow-sm">
                  <Check className="h-2.5 w-2.5 text-vocab-purple" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-medium mb-2.5 text-gray-700">
            {selectedPrimary === 'exam' ? 'Select Exam Type' : 'Choose Difficulty'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(selectedPrimary === 'exam' ? examTypes : difficultyLevels).map((level) => (
              <button
                key={level.id}
                onClick={() => handleSubcategorySelect(level.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedSubcategory === level.id
                    ? "bg-vocab-purple text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPrimary && selectedSubcategory && (
        <Button
          onClick={handleApply}
          disabled={isLoadingNewBatch || !isPro}
          className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-11 rounded-xl shadow-sm mt-2"
        >
          {isLoadingNewBatch ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Apply & Generate Words
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default MobileCategorySelection;

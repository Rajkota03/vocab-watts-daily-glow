
import React, { useState } from 'react';
import { 
  ArrowLeft, BookOpen, Briefcase, MessageSquare, 
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
  
  // Categories with visual styling
  const categories = [
    {
      id: 'daily',
      name: 'Daily',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'from-blue-500/20 to-blue-600/20 text-blue-600',
      hoverColor: 'hover:from-blue-500/30 hover:to-blue-600/30',
      activeColor: 'ring-blue-400/50 from-blue-500/30 to-blue-600/30'
    },
    {
      id: 'business',
      name: 'Business',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'from-purple-500/20 to-purple-600/20 text-purple-600',
      hoverColor: 'hover:from-purple-500/30 hover:to-purple-600/30',
      activeColor: 'ring-purple-400/50 from-purple-500/30 to-purple-600/30'
    },
    {
      id: 'interview',
      name: 'Interview',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'from-green-500/20 to-green-600/20 text-green-600',
      hoverColor: 'hover:from-green-500/30 hover:to-green-600/30',
      activeColor: 'ring-green-400/50 from-green-500/30 to-green-600/30'
    },
    {
      id: 'slang',
      name: 'Slang',
      icon: <Smile className="h-5 w-5" />,
      color: 'from-amber-500/20 to-amber-600/20 text-amber-600',
      hoverColor: 'hover:from-amber-500/30 hover:to-amber-600/30',
      activeColor: 'ring-amber-400/50 from-amber-500/30 to-amber-600/30'
    },
    {
      id: 'rare',
      name: 'Rare',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-pink-500/20 to-pink-600/20 text-pink-600',
      hoverColor: 'hover:from-pink-500/30 hover:to-pink-600/30',
      activeColor: 'ring-pink-400/50 from-pink-500/30 to-pink-600/30'
    },
    {
      id: 'expression',
      name: 'Expression',
      icon: <Heart className="h-5 w-5" />,
      color: 'from-red-500/20 to-red-600/20 text-red-600',
      hoverColor: 'hover:from-red-500/30 hover:to-red-600/30',
      activeColor: 'ring-red-400/50 from-red-500/30 to-red-600/30'
    },
    {
      id: 'exam',
      name: 'Exam',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600',
      hoverColor: 'hover:from-indigo-500/30 hover:to-indigo-600/30',
      activeColor: 'ring-indigo-400/50 from-indigo-500/30 to-indigo-600/30'
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
    <div className="flex flex-col space-y-6 animate-fade-in">
      {/* Category Grid */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-800">Choose Your Category</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handlePrimarySelect(category.id)}
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200",
                "bg-gradient-to-br shadow-sm",
                category.color,
                category.hoverColor,
                selectedPrimary === category.id && [
                  "ring-2",
                  category.activeColor
                ],
                !isPro && "opacity-50"
              )}
            >
              <div className="mb-2">{category.icon}</div>
              <span className="text-xs font-medium">{category.name}</span>
              
              {selectedPrimary === category.id && (
                <div className="absolute -top-1 -right-1 rounded-full bg-white h-5 w-5 flex items-center justify-center shadow-sm">
                  <Check className="h-3 w-3 text-vocab-purple" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty/Exam Type Selection */}
      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-medium mb-3 text-gray-700">
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
                    ? "bg-vocab-purple text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      {selectedPrimary && selectedSubcategory && (
        <Button
          onClick={handleApply}
          disabled={isLoadingNewBatch || !isPro}
          className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-12 rounded-xl shadow-md mt-2"
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
      )}
    </div>
  );
};

export default MobileCategorySelection;

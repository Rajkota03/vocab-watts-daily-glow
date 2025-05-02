
import React, { useState } from 'react';
import { BookOpen, Briefcase, MessageSquare, GraduationCap, Smile, Sparkles, Heart, Zap, RefreshCw, Check, ListOrdered, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(isPro ? 3 : 1);

  // Force the primary category to 'daily' for non-pro users and parse current category
  React.useEffect(() => {
    let initialPrimary = null;
    let initialSub = null;

    if (currentCategory && currentCategory.includes('-')) {
      const [primary, sub] = currentCategory.split('-');
      if (isPro || primary === 'daily') {
        initialPrimary = primary;
        initialSub = sub;
      } else {
        initialPrimary = 'daily'; // Default non-pro to daily
        initialSub = 'beginner'; // Default non-pro to beginner
      }
    } else if (!isPro) {
        initialPrimary = 'daily'; // Default non-pro to daily if no current category
        initialSub = 'beginner';
    }
    
    setSelectedPrimary(initialPrimary);
    setSelectedSubcategory(initialSub);

  }, [isPro, currentCategory]);

  const categories = [{
    id: 'daily',
    name: 'Daily',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'from-blue-500/20 to-blue-600/20 text-blue-600',
    hoverColor: 'hover:from-blue-500/30 hover:to-blue-600/30',
    activeColor: 'ring-blue-400 from-blue-500/30 to-blue-600/30',
    proOnly: false
  }, {
    id: 'business',
    name: 'Business',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'from-purple-500/20 to-purple-600/20 text-purple-600',
    hoverColor: 'hover:from-purple-500/30 hover:to-purple-600/30',
    activeColor: 'ring-purple-400 from-purple-500/30 to-purple-600/30',
    proOnly: true
  }, {
    id: 'interview',
    name: 'Interview',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'from-green-500/20 to-green-600/20 text-green-600',
    hoverColor: 'hover:from-green-500/30 hover:to-green-600/30',
    activeColor: 'ring-green-400 from-green-500/30 to-green-600/30',
    proOnly: true
  }, {
    id: 'slang',
    name: 'Slang',
    icon: <Smile className="h-4 w-4" />,
    color: 'from-amber-500/20 to-amber-600/20 text-amber-600',
    hoverColor: 'hover:from-amber-500/30 hover:to-amber-600/30',
    activeColor: 'ring-amber-400 from-amber-500/30 to-amber-600/30',
    proOnly: true
  }, {
    id: 'rare',
    name: 'Rare',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'from-pink-500/20 to-pink-600/20 text-pink-600',
    hoverColor: 'hover:from-pink-500/30 hover:to-pink-600/30',
    activeColor: 'ring-pink-400 from-pink-500/30 to-pink-600/30',
    proOnly: true
  }, {
    id: 'expression',
    name: 'Expression',
    icon: <Heart className="h-4 w-4" />,
    color: 'from-red-500/20 to-red-600/20 text-red-600',
    hoverColor: 'hover:from-red-500/30 hover:to-red-600/30',
    activeColor: 'ring-red-400 from-red-500/30 to-red-600/30',
    proOnly: true
  }, {
    id: 'exam',
    name: 'Exam Prep',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600',
    hoverColor: 'hover:from-indigo-500/30 hover:to-indigo-600/30',
    activeColor: 'ring-indigo-400 from-indigo-500/30 to-indigo-600/30',
    proOnly: true
  }];

  const difficultyLevels = [{
    id: 'beginner',
    name: 'Beginner',
    description: 'Basic vocabulary',
    color: 'from-green-500/20 to-green-600/20',
    textColor: 'text-green-700',
    activeColor: 'from-green-500/30 to-green-600/30',
    proOnly: false
  }, {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Challenging words',
    color: 'from-blue-500/20 to-blue-600/20',
    textColor: 'text-blue-700',
    activeColor: 'from-blue-500/30 to-blue-600/30',
    proOnly: false
  }, {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced terms',
    color: 'from-purple-500/20 to-purple-600/20',
    textColor: 'text-purple-700',
    activeColor: 'from-purple-500/30 to-purple-600/30',
    proOnly: true
  }];

  const examTypes = [{
    id: 'gre',
    name: 'GRE',
    description: 'Graduate Exam',
    color: 'from-red-500/20 to-red-600/20',
    textColor: 'text-red-700',
    activeColor: 'from-red-500/30 to-red-600/30',
    proOnly: true
  }, {
    id: 'ielts',
    name: 'IELTS',
    description: 'English Testing',
    color: 'from-blue-500/20 to-blue-600/20',
    textColor: 'text-blue-700',
    activeColor: 'from-blue-500/30 to-blue-600/30',
    proOnly: true
  }, {
    id: 'toefl',
    name: 'TOEFL',
    description: 'English Language',
    color: 'from-green-500/20 to-green-600/20',
    textColor: 'text-green-700',
    activeColor: 'from-green-500/30 to-green-600/30',
    proOnly: true
  }, {
    id: 'cat',
    name: 'CAT',
    description: 'Admission Test',
    color: 'from-amber-500/20 to-amber-600/20',
    textColor: 'text-amber-700',
    activeColor: 'from-amber-500/30 to-amber-600/30',
    proOnly: true
  }, {
    id: 'gmat',
    name: 'GMAT',
    description: 'Management Test',
    color: 'from-indigo-500/20 to-indigo-600/20',
    textColor: 'text-indigo-700',
    activeColor: 'from-indigo-500/30 to-indigo-600/30',
    proOnly: true
  }];

  const wordCountOptions = [{
    count: 1,
    message: "Focus on mastering one word at a time. 🎯",
    color: "bg-green-100 text-green-800",
    activeColor: "ring-green-500",
    proOnly: false
  },
  {
    count: 2,
    message: "A balanced approach to expand your vocabulary steadily. 📚",
    color: "bg-blue-100 text-blue-800",
    activeColor: "ring-blue-500",
    proOnly: false
  },
  {
    count: 3,
    message: "Build your vocabulary with confidence! 💪",
    color: "bg-indigo-100 text-indigo-800",
    activeColor: "ring-indigo-500",
    proOnly: false
  },
  {
    count: 4,
    message: "Take your language skills to the next level! 🚀",
    color: "bg-orange-100 text-orange-800",
    activeColor: "ring-orange-500",
    proOnly: true
  },
  {
    count: 5,
    message: "Impressive commitment to rapid vocabulary growth! 🏆",
    color: "bg-pink-100 text-pink-800",
    activeColor: "ring-pink-500",
    proOnly: true
  }];

  const handlePrimarySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!isPro && category?.proOnly) {
      handleUpgrade(); // Redirect to upgrade if pro category clicked
      return;
    }
    setSelectedPrimary(categoryId);
    // Reset subcategory if primary changes, unless it's the same category
    if (categoryId !== selectedPrimary) {
       setSelectedSubcategory(null);
    }
  };

  const handleDifficultySelect = (difficultyId: string) => {
    const levels = selectedPrimary === 'exam' ? examTypes : difficultyLevels;
    const difficulty = levels.find(d => d.id === difficultyId);
    if (!isPro && difficulty?.proOnly) {
      handleUpgrade(); // Redirect to upgrade if pro difficulty clicked
      return;
    }
    setSelectedSubcategory(difficultyId);
  };

  const handleWordCountSelect = (count: number) => {
    const option = wordCountOptions.find(o => o.count === count);
    if (!isPro && option?.proOnly) {
      handleUpgrade(); // Redirect to upgrade if pro count clicked
      return;
    }
    setWordCount(count);
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleApply = async () => {
    if (selectedPrimary && selectedSubcategory) {
      onCategoryUpdate(selectedPrimary, selectedSubcategory);
      // Assuming onNewBatch is related to applying the category/word count?
      // If it triggers word generation, call it here.
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };

  const isFullySelected = selectedPrimary && selectedSubcategory;

  // Determine which subcategories/levels to show
  const subcategoryOptions = selectedPrimary === 'exam' ? examTypes : difficultyLevels;

  return (
    // Use flex column and allow scrolling for the main content area
    <div className="flex flex-col h-full bg-gray-50 rounded-lg">
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-t-lg flex items-center justify-between sticky top-0 z-10 border-b border-amber-200">
          <div className="flex-1 mr-2">
            <h3 className="font-semibold text-amber-800 text-sm">Free Trial</h3>
            <p className="text-xs text-amber-700">Unlock all categories & features</p>
          </div>
          <Button
            onClick={handleUpgrade}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs shadow-sm"
            size="sm"
          >
            Upgrade
          </Button>
        </div>
      )}

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 p-3">
        {/* Word Category Section */}
        <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Word Category</h3>
          {/* Responsive grid: 3 columns default, adjust as needed */}
          <div className="grid grid-cols-3 gap-2">
            {categories.map(category => (
              <TooltipProvider key={category.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button
                        onClick={() => handlePrimarySelect(category.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 w-full aspect-square", // Use aspect-square for consistent shape
                          "bg-gradient-to-br shadow-sm border",
                          "hover:shadow-md hover:scale-105",
                          selectedPrimary === category.id
                            ? ["ring-2 ring-offset-1", category.activeColor, "border-transparent"]
                            : "border-gray-200",
                          category.color,
                          category.hoverColor,
                          (!isPro && category.proOnly) && "opacity-60 cursor-not-allowed"
                        )}
                        disabled={!isPro && category.proOnly}
                        aria-label={`Select category ${category.name}`}
                      >
                        <div className="mb-1">{React.cloneElement(category.icon, { className: "h-5 w-5" })}</div>
                        <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                          {category.name}
                        </span>
                        {selectedPrimary === category.id && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full shadow p-0.5">
                            <Check className="h-3 w-3 text-vocab-purple" />
                          </div>
                        )}
                        {!isPro && category.proOnly && (
                          <div className="absolute top-1 right-1 bg-white/70 rounded-full p-0.5">
                            <Lock className="h-3 w-3 text-amber-600" />
                          </div>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {!isPro && category.proOnly && (
                    <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                      <p className="text-xs text-amber-800">Upgrade to Pro to unlock</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Difficulty Level Section - Only show if a primary category is selected */}
        {selectedPrimary && (
          <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-200 animate-fade-in">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {selectedPrimary === 'exam' ? 'Select Exam' : 'Difficulty Level'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {subcategoryOptions.map(level => (
                <TooltipProvider key={level.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <button
                          onClick={() => handleDifficultySelect(level.id)}
                          className={cn(
                            "p-2 rounded-lg text-sm font-medium transition-all duration-200 w-full min-h-[70px] flex flex-col justify-center items-center text-center",
                            "bg-gradient-to-br shadow-sm border",
                            "hover:shadow-md hover:scale-105",
                            selectedSubcategory === level.id
                              ? ["ring-2 ring-offset-1", level.activeColor, "border-transparent"]
                              : "border-gray-200",
                            level.color,
                            level.textColor,
                            (!isPro && level.proOnly) && "opacity-60 cursor-not-allowed"
                          )}
                          disabled={!isPro && level.proOnly}
                           aria-label={`Select level ${level.name}`}
                        >
                          <span className="font-semibold text-xs mb-0.5 line-clamp-1">{level.name}</span>
                          <span className="text-[10px] opacity-80 line-clamp-2">
                            {level.description}
                          </span>
                          {!isPro && level.proOnly && (
                            <div className="absolute top-1 right-1 bg-white/70 rounded-full p-0.5">
                              <Lock className="h-3 w-3 text-amber-600" />
                            </div>
                          )}
                        </button>
                      </div>
                    </TooltipTrigger>
                    {!isPro && level.proOnly && (
                      <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-800">Upgrade to Pro to unlock</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Word Count Section - Only show if subcategory is selected */}
        {selectedSubcategory && (
          <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-200 animate-fade-in">
            <div className="flex items-center mb-2">
              <ListOrdered className="h-4 w-4 mr-1.5 text-vocab-purple" />
              <h3 className="text-sm font-semibold text-gray-800">Daily Word Count</h3>
            </div>
            {/* Responsive grid for word count */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {wordCountOptions.map(option => (
                <TooltipProvider key={option.count} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <button
                          onClick={() => handleWordCountSelect(option.count)}
                          className={cn(
                            "w-full py-2.5 rounded-md text-center font-bold text-sm transition-all border",
                            wordCount === option.count
                              ? ["ring-2 ring-offset-1", option.activeColor, "border-transparent scale-105"]
                              : "border-gray-200",
                            option.color,
                            "hover:scale-105",
                            (!isPro && option.proOnly) && "opacity-60 cursor-not-allowed"
                          )}
                          disabled={!isPro && option.proOnly}
                          aria-label={`Select ${option.count} words per day`}
                        >
                          {option.count}
                          {!isPro && option.proOnly && (
                            <div className="absolute top-0.5 right-0.5 bg-white/70 rounded-full p-0.5">
                              <Lock className="h-2.5 w-2.5 text-amber-600" />
                            </div>
                          )}
                        </button>
                      </div>
                    </TooltipTrigger>
                    {!isPro && option.proOnly && (
                      <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-800">Upgrade to Pro</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <p className="text-xs text-gray-600 italic text-center px-2">
              {wordCountOptions.find(option => option.count === wordCount)?.message}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Sticky Footer Button */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg sticky bottom-0 z-10">
        <Button
          onClick={handleApply}
          disabled={!isFullySelected || isLoadingNewBatch}
          className={cn(
            "w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-11 rounded-lg shadow-sm text-sm font-semibold",
            (!isFullySelected || isLoadingNewBatch) && "opacity-50 cursor-not-allowed"
            )}
          aria-live="polite"
        >
          {isLoadingNewBatch ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Apply Selection
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileCategorySelection;


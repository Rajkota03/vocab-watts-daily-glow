
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
  
  // Force the primary category to 'daily' for non-pro users
  React.useEffect(() => {
    if (!isPro && selectedPrimary !== 'daily' && selectedPrimary !== null) {
      setSelectedPrimary('daily');
    }
    
    // Parse the current category if it exists
    if (currentCategory && currentCategory.includes('-')) {
      const [primary, sub] = currentCategory.split('-');
      if (isPro || primary === 'daily') {
        setSelectedPrimary(primary);
        setSelectedSubcategory(sub);
      } else if (!isPro) {
        setSelectedPrimary('daily');
      }
    }
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
    name: 'Exam',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600',
    hoverColor: 'hover:from-indigo-500/30 hover:to-indigo-600/30',
    activeColor: 'ring-indigo-400 from-indigo-500/30 to-indigo-600/30',
    proOnly: true
  }];
  
  const difficultyLevels = [{
    id: 'beginner',
    name: 'Beginner',
    description: 'Basic everyday vocabulary',
    color: 'from-green-500/20 to-green-600/20',
    textColor: 'text-green-700',
    activeColor: 'from-green-500/30 to-green-600/30',
    proOnly: false
  }, {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Challenging vocabulary',
    color: 'from-blue-500/20 to-blue-600/20',
    textColor: 'text-blue-700',
    activeColor: 'from-blue-500/30 to-blue-600/30',
    proOnly: false
  }, {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced terminology',
    color: 'from-purple-500/20 to-purple-600/20',
    textColor: 'text-purple-700',
    activeColor: 'from-purple-500/30 to-purple-600/30',
    proOnly: true
  }];
  
  const examTypes = [{
    id: 'gre',
    name: 'GRE',
    description: 'Graduate Record Examination',
    color: 'from-red-500/20 to-red-600/20',
    textColor: 'text-red-700',
    activeColor: 'from-red-500/30 to-red-600/30'
  }, {
    id: 'ielts',
    name: 'IELTS',
    description: 'International English Testing',
    color: 'from-blue-500/20 to-blue-600/20',
    textColor: 'text-blue-700',
    activeColor: 'from-blue-500/30 to-blue-600/30'
  }, {
    id: 'toefl',
    name: 'TOEFL',
    description: 'Test of English as Foreign Language',
    color: 'from-green-500/20 to-green-600/20',
    textColor: 'text-green-700',
    activeColor: 'from-green-500/30 to-green-600/30'
  }, {
    id: 'cat',
    name: 'CAT',
    description: 'Common Admission Test',
    color: 'from-amber-500/20 to-amber-600/20',
    textColor: 'text-amber-700',
    activeColor: 'from-amber-500/30 to-amber-600/30'
  }, {
    id: 'gmat',
    name: 'GMAT',
    description: 'Graduate Management Admission Test',
    color: 'from-indigo-500/20 to-indigo-600/20',
    textColor: 'text-indigo-700',
    activeColor: 'from-indigo-500/30 to-indigo-600/30'
  }];
  
  const wordCountOptions = [{
    count: 1,
    message: "Perfect for focused, in-depth learning! Master one word at a time. 🎯",
    color: "bg-[#F2FCE2] text-green-700",
    proOnly: false
  },
  {
    count: 2,
    message: "A balanced approach to expand your vocabulary steadily! 📚",
    color: "bg-[#FEF7CD] text-amber-700",
    proOnly: false
  },
  {
    count: 3,
    message: "Great choice! Build your vocabulary with confidence! 💪",
    color: "bg-[#E5DEFF] text-indigo-700",
    proOnly: false
  },
  {
    count: 4,
    message: "Fantastic! You're taking your language skills to the next level! 🚀",
    color: "bg-[#FDE1D3] text-orange-700",
    proOnly: true
  },
  {
    count: 5,
    message: "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆",
    color: "bg-[#FFDEE2] text-pink-700",
    proOnly: true
  }];

  const handlePrimarySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!isPro && category?.proOnly) {
      // Show upgrade prompt for non-pro users
      return;
    }
    
    setSelectedPrimary(prevSelected => prevSelected === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
  };

  const handleDifficultySelect = (difficultyId: string) => {
    const difficulty = selectedPrimary === 'exam' 
      ? examTypes.find(e => e.id === difficultyId)
      : difficultyLevels.find(d => d.id === difficultyId);
      
    if (!isPro && difficultyLevels.find(d => d.id === difficultyId)?.proOnly) {
      // Show upgrade prompt for non-pro users
      return;
    }
    
    setSelectedSubcategory(difficultyId);
  };

  const handleWordCountSelect = (count: number) => {
    const option = wordCountOptions.find(o => o.count === count);
    if (!isPro && option?.proOnly) {
      // Show upgrade prompt for non-pro users
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
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };

  const isFullySelected = selectedPrimary && selectedSubcategory;
  
  // Get available subcategories based on whether the user is pro or not
  const availableLevels = selectedPrimary === 'exam'
    ? examTypes
    : difficultyLevels.filter(level => isPro || !level.proOnly);

  return <div className="flex flex-col min-h-[500px] overflow-hidden">
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-xl mb-3 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">Free Trial</h3>
            <p className="text-xs text-amber-700">Unlock all categories and features</p>
          </div>
          <Button 
            onClick={handleUpgrade}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
            size="sm"
          >
            Upgrade to Pro
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        <div className="bg-white rounded-xl p-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Word Category</h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(category => (
              <TooltipProvider key={category.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button 
                        onClick={() => handlePrimarySelect(category.id)} 
                        className={cn(
                          "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 w-full", 
                          "bg-gradient-to-br shadow-sm", 
                          "hover:shadow-md", 
                          category.color, 
                          category.hoverColor, 
                          selectedPrimary === category.id && ["ring-2 ring-offset-2", category.activeColor], 
                          (!isPro && category.proOnly) && "opacity-50"
                        )}
                        disabled={!isPro && category.proOnly}
                      >
                        <div className="mb-2">{category.icon}</div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {category.name}
                        </span>
                        
                        {selectedPrimary === category.id && (
                          <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                            <Check className="h-3 w-3 text-vocab-purple" />
                          </div>
                        )}
                        
                        {!isPro && category.proOnly && (
                          <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                            <Lock className="h-3 w-3 text-amber-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {!isPro && category.proOnly && (
                    <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-800">
                        <p>Upgrade to Pro to unlock {category.name}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Difficulty Level</h3>
          <div className="grid grid-cols-3 gap-2">
            {availableLevels.map(level => (
              <TooltipProvider key={level.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button 
                        onClick={() => handleDifficultySelect(level.id)} 
                        className={cn(
                          "p-3 rounded-xl text-sm font-medium transition-all duration-200 w-full",
                          "bg-gradient-to-br shadow-sm flex flex-col items-center text-center min-h-[80px] justify-center",
                          level.color,
                          "hover:shadow-md",
                          selectedSubcategory === level.id && ["ring-2 ring-offset-2", level.activeColor],
                          (!isPro && level.proOnly) && "opacity-50"
                        )}
                        disabled={!isPro && level.proOnly}
                      >
                        <span className="font-semibold mb-1">{level.name}</span>
                        <span className="text-xs opacity-75">
                          {level.description}
                        </span>
                        
                        {!isPro && level.proOnly && (
                          <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                            <Lock className="h-3 w-3 text-amber-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {!isPro && level.proOnly && (
                    <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-800">
                        <p>Upgrade to Pro to unlock {level.name} level</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3">
          <div className="flex items-center mb-2">
            <ListOrdered className="h-4 w-4 mr-2 text-vocab-purple" />
            <h3 className="text-sm font-semibold text-gray-800">Daily Word Count</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            {wordCountOptions.slice(0, 3).map(option => (
              <TooltipProvider key={option.count}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button 
                        key={option.count} 
                        onClick={() => handleWordCountSelect(option.count)} 
                        className={cn(
                          "w-full py-2 rounded text-center font-medium transition-all",
                          option.color,
                          wordCount === option.count && "ring-2 ring-offset-1 ring-vocab-purple",
                          (!isPro && option.proOnly) && "opacity-50"
                        )}
                        disabled={!isPro && option.proOnly}
                      >
                        {option.count}
                        {!isPro && option.proOnly && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm p-0.5">
                            <Lock className="h-2.5 w-2.5 text-amber-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {!isPro && option.proOnly && (
                    <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-800">
                        <p>Upgrade to Pro to unlock {option.count} words per day</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {wordCountOptions.slice(3).map(option => (
              <TooltipProvider key={option.count}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <button 
                        key={option.count} 
                        onClick={() => handleWordCountSelect(option.count)} 
                        className={cn(
                          "w-full py-2 rounded text-center font-medium transition-all",
                          option.color,
                          wordCount === option.count && "ring-2 ring-offset-1 ring-vocab-purple",
                          (!isPro && option.proOnly) && "opacity-50"
                        )}
                        disabled={!isPro && option.proOnly}
                      >
                        {option.count}
                        {!isPro && option.proOnly && (
                          <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm p-0.5">
                            <Lock className="h-2.5 w-2.5 text-amber-500" />
                          </div>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  {!isPro && option.proOnly && (
                    <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-800">
                        <p>Upgrade to Pro to unlock {option.count} words per day</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 italic mt-2 text-center">
            {wordCountOptions.find(option => option.count === wordCount)?.message}
          </p>
        </div>
      </div>

      <div className="px-2 mt-3 sticky bottom-0">
        <Button onClick={handleApply} disabled={!isFullySelected || isLoadingNewBatch} className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-12 rounded-xl shadow-sm">
          {isLoadingNewBatch ? <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </> : <>
              <Zap className="mr-2 h-4 w-4" />
              Apply & Generate Words
            </>}
        </Button>
      </div>
    </div>;
};

export default MobileCategorySelection;

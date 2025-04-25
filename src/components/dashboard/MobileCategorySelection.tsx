
import React, { useState } from 'react';
import { 
  BookOpen, Briefcase, MessageSquare, 
  GraduationCap, Smile, Sparkles, Heart, Zap, RefreshCw, Check, ArrowLeft, ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(3);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
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
    { 
      id: 'beginner', 
      name: 'Beginner', 
      description: 'Basic everyday vocabulary',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-700',
      activeColor: 'from-green-500/30 to-green-600/30'
    },
    { 
      id: 'intermediate', 
      name: 'Intermediate', 
      description: 'Challenging vocabulary',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-700',
      activeColor: 'from-blue-500/30 to-blue-600/30'
    },
    { 
      id: 'professional', 
      name: 'Professional', 
      description: 'Advanced terminology',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-700',
      activeColor: 'from-purple-500/30 to-purple-600/30'
    }
  ];

  const examTypes = [
    { 
      id: 'gre', 
      name: 'GRE',
      description: 'Graduate Record Examination',
      color: 'from-red-500/20 to-red-600/20',
      textColor: 'text-red-700',
      activeColor: 'from-red-500/30 to-red-600/30'
    },
    { 
      id: 'ielts', 
      name: 'IELTS',
      description: 'International English Testing',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-700',
      activeColor: 'from-blue-500/30 to-blue-600/30'
    },
    { 
      id: 'toefl', 
      name: 'TOEFL',
      description: 'Test of English as Foreign Language',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-700',
      activeColor: 'from-green-500/30 to-green-600/30'
    },
    { 
      id: 'cat', 
      name: 'CAT',
      description: 'Common Admission Test',
      color: 'from-amber-500/20 to-amber-600/20',
      textColor: 'text-amber-700',
      activeColor: 'from-amber-500/30 to-amber-600/30'
    },
    { 
      id: 'gmat', 
      name: 'GMAT',
      description: 'Graduate Management Admission Test',
      color: 'from-indigo-500/20 to-indigo-600/20',
      textColor: 'text-indigo-700',
      activeColor: 'from-indigo-500/30 to-indigo-600/30'
    }
  ];

  // Word count options with messages
  const wordCountOptions = [
    { count: 1, message: "Perfect for focused, in-depth learning! Master one word at a time. 🎯" },
    { count: 2, message: "A balanced approach to expand your vocabulary steadily! 📚" },
    { count: 3, message: "Great choice! Build your vocabulary with confidence! 💪" },
    { count: 4, message: "Fantastic! You're taking your language skills to the next level! 🚀" },
    { count: 5, message: "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆" },
  ];

  const handlePrimarySelect = (categoryId: string) => {
    if (!isPro) return;
    setSelectedPrimary(prevSelected => prevSelected === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
    setSelectedDifficulty(null);
    setStep(2);
  };

  const handleDifficultySelect = (difficultyId: string) => {
    setSelectedDifficulty(difficultyId);
    setSelectedSubcategory(difficultyId);
    setStep(3);
  };

  const handleWordCountSelect = (count: number) => {
    setWordCount(count);
    setStep(4);
  };

  const handleBack = () => {
    if (step === 4) {
      setStep(3);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4">
        {/* Progress bar at top */}
        <div className="mb-6 px-2">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-vocab-purple to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={step >= 1 ? "text-vocab-purple" : "text-gray-400"}>Category</span>
            <span className={step >= 2 ? "text-vocab-purple" : "text-gray-400"}>Level</span>
            <span className={step >= 3 ? "text-vocab-purple" : "text-gray-400"}>Words</span>
            <span className={step >= 4 ? "text-vocab-purple" : "text-gray-400"}>Apply</span>
          </div>
        </div>

        {step > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-1 mb-4 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-1 text-sm">Back</span>
          </Button>
        )}

        {/* Step 1: Primary Category Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Category Selection</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handlePrimarySelect(category.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200",
                    "bg-gradient-to-br shadow-sm",
                    "hover:shadow-md",
                    category.color,
                    category.hoverColor,
                    selectedPrimary === category.id && [
                      "ring-2 ring-offset-2",
                      category.activeColor
                    ],
                    !isPro && "opacity-50 cursor-not-allowed"
                  )}
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
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Subcategory/Difficulty Selection */}
        {step === 2 && selectedPrimary && (
          <div className="animate-fade-in">
            <h4 className="text-base font-semibold text-gray-800 mb-4">
              {selectedPrimary === 'exam' ? 'Select Exam Type' : 'Choose Difficulty'}
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {(selectedPrimary === 'exam' ? examTypes : difficultyLevels).map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleDifficultySelect(level.id)}
                  className={cn(
                    "p-2 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[64px]",
                    "bg-gradient-to-br shadow-sm",
                    level.color,
                    level.textColor,
                    "hover:shadow-md",
                    selectedDifficulty === level.id && [
                      "ring-2 ring-offset-2",
                      level.activeColor
                    ]
                  )}
                >
                  <span>{level.name}</span>
                  {!selectedPrimary.includes('exam') && level.description && (
                    <span className="text-xs mt-1 opacity-75">
                      {level.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Word Count Selection */}
        {step === 3 && selectedPrimary && selectedSubcategory && (
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <ListOrdered className="h-5 w-5 mr-2 text-vocab-purple" />
                <h4 className="text-base font-semibold text-gray-800">Daily Word Count</h4>
              </div>
            </div>
            
            <div className="text-center mb-4 text-primary font-medium">
              <span className="text-2xl">{wordCount}</span>
              <span className="ml-1">word{wordCount !== 1 ? 's' : ''} a day</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => handleWordCountSelect(count)}
                  className={cn(
                    "p-4 rounded-lg text-lg font-medium transition-all duration-200",
                    "bg-gradient-to-br shadow-sm",
                    wordCount === count ? [
                      "ring-2 ring-offset-2 ring-vocab-purple",
                      "from-vocab-purple/20 to-indigo-500/20 text-vocab-purple"
                    ] : "from-gray-100 to-gray-200 text-gray-700 hover:shadow-md"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {[4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => handleWordCountSelect(count)}
                  className={cn(
                    "p-4 rounded-lg text-lg font-medium transition-all duration-200",
                    "bg-gradient-to-br shadow-sm",
                    wordCount === count ? [
                      "ring-2 ring-offset-2 ring-vocab-purple",
                      "from-vocab-purple/20 to-indigo-500/20 text-vocab-purple"
                    ] : "from-gray-100 to-gray-200 text-gray-700 hover:shadow-md"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
            
            <p className="text-sm text-gray-600 italic mt-4 text-center">
              {wordCountOptions.find(option => option.count === wordCount)?.message}
            </p>
          </div>
        )}

        {/* Step 4: Final Review & Apply */}
        {step === 4 && selectedPrimary && selectedSubcategory && (
          <div className="animate-fade-in">
            <h4 className="text-base font-semibold text-gray-800 mb-4">Your Selection</h4>
            
            <Card className="border-0 shadow-sm p-4 mb-6 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-vocab-purple/20 to-indigo-500/20">
                  <span className="text-vocab-purple">{categories.find(c => c.id === selectedPrimary)?.icon}</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-700">Category</h3>
                  <p className="text-base font-medium text-vocab-purple">{categories.find(c => c.id === selectedPrimary)?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-vocab-purple/20 to-indigo-500/20">
                  <Check className="h-4 w-4 text-vocab-purple" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-700">Level</h3>
                  <p className="text-base font-medium text-vocab-purple">
                    {(selectedPrimary === 'exam' ? examTypes : difficultyLevels).find(l => l.id === selectedSubcategory)?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gradient-to-br from-vocab-purple/20 to-indigo-500/20">
                  <ListOrdered className="h-4 w-4 text-vocab-purple" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-700">Daily Words</h3>
                  <p className="text-base font-medium text-vocab-purple">{wordCount} word{wordCount > 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
            
            <Button
              onClick={handleApply}
              disabled={isLoadingNewBatch || !isPro}
              className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-11 rounded-xl shadow-sm"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCategorySelection;

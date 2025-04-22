import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, BookOpen, Briefcase, Smile, Sparkles, 
  Heart, GraduationCap, Target, MessageSquare,
  CheckCircle 
} from 'lucide-react';
import MobileCategorySelection from './MobileCategorySelection';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (primary: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  isPro,
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false
}) => {
  const isMobile = useIsMobile();
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(3);
  
  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimary(parts[0]);
        setSelectedSubcategory(parts[1]);
      }
    }
  }, [currentCategory]);
  
  const categories = [
    { 
      name: 'Daily', 
      id: 'daily', 
      icon: <BookOpen className="h-4 w-4" />,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      name: 'Business', 
      id: 'business', 
      icon: <Briefcase className="h-4 w-4" />,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      name: 'Interview', 
      id: 'interview', 
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'bg-green-50 text-green-600'
    },
    { 
      name: 'Slang', 
      id: 'slang', 
      icon: <Smile className="h-4 w-4" />,
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      name: 'Rare', 
      id: 'rare', 
      icon: <Sparkles className="h-4 w-4" />,
      color: 'bg-pink-50 text-pink-600'
    },
    { 
      name: 'Expression', 
      id: 'expression', 
      icon: <Heart className="h-4 w-4" />,
      color: 'bg-red-50 text-red-600'
    },
    { 
      name: 'Exam', 
      id: 'exam', 
      icon: <GraduationCap className="h-4 w-4" />,
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];
  
  const subcategories = selectedPrimary === 'exam' ? 
    [
      { name: 'GRE', id: 'gre', description: 'Graduate Record Examination' },
      { name: 'IELTS', id: 'ielts', description: 'English Language Testing' },
      { name: 'TOEFL', id: 'toefl', description: 'Test of English as Foreign Language' },
      { name: 'CAT', id: 'cat', description: 'Common Admission Test' },
      { name: 'GMAT', id: 'gmat', description: 'Graduate Management Test' }
    ] : 
    [
      { name: 'Beginner', id: 'beginner', description: 'Basic everyday vocabulary' },
      { name: 'Intermediate', id: 'intermediate', description: 'Challenging vocabulary' },
      { name: 'Professional', id: 'professional', description: 'Advanced terminology' }
    ];
  
  const wordCountMotivation = {
    1: "Perfect for focused, in-depth learning! Master one word at a time. 🎯",
    2: "A balanced approach to expand your vocabulary steadily! 📚",
    3: "Great choice! Build your vocabulary with confidence! 💪",
    4: "Fantastic! You're taking your language skills to the next level! 🚀",
    5: "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆"
  };
  
  const handlePrimarySelect = (primary: string) => {
    setSelectedPrimary(primary);
    if (primary !== selectedPrimary) {
      setSelectedSubcategory(null);
    }
  };
  
  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };
  
  const handleApply = async () => {
    if (selectedPrimary && selectedSubcategory) {
      onCategoryUpdate(selectedPrimary, selectedSubcategory);
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };

  if (isMobile) {
    return (
      <MobileCategorySelection
        isPro={isPro}
        currentCategory={currentCategory}
        onCategoryUpdate={onCategoryUpdate}
        onNewBatch={onNewBatch}
        isLoadingNewBatch={isLoadingNewBatch}
      />
    );
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Categories Grid */}
      <div>
        <h3 className="text-sm font-medium mb-4 text-gray-700">Word Category</h3>
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handlePrimarySelect(category.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                selectedPrimary === category.id 
                  ? `${category.color} shadow-sm ring-2 ring-vuilder-indigo/20` 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                selectedPrimary === category.id ? category.color : 'bg-white shadow-sm'
              }`}>
                {category.icon}
              </div>
              <span className="text-xs font-medium">{category.name}</span>
              
              {selectedPrimary === category.id && (
                <div className="absolute -top-1 -right-1 rounded-full bg-vuilder-indigo h-5 w-5 flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Subcategories */}
      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-medium mb-4 text-gray-700">
            {selectedPrimary === 'exam' ? 'Exam Type' : 'Difficulty Level'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategorySelect(subcategory.id)}
                className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
                  selectedSubcategory === subcategory.id 
                    ? 'bg-vuilder-mint/10 ring-2 ring-vuilder-mint text-vuilder-mint shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div className="flex-1 text-left">
                  <h4 className="font-medium">{subcategory.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
                </div>
                {selectedSubcategory === subcategory.id && (
                  <CheckCircle className="h-5 w-5 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Word Count Selection */}
      {selectedSubcategory && (
        <div className="animate-fade-in space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Daily Word Count</h3>
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => setWordCount(count)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                  wordCount === count 
                    ? 'bg-vuilder-mint/10 ring-2 ring-vuilder-mint text-vuilder-mint shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-2xl font-semibold">{count}</span>
                <span className="text-xs mt-1">word{count > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 italic">
            {wordCountMotivation[wordCount as keyof typeof wordCountMotivation]}
          </p>
        </div>
      )}
      
      {/* Apply Button */}
      <div>
        <Button
          disabled={!selectedPrimary || !selectedSubcategory || isLoadingNewBatch}
          onClick={handleApply}
          className="w-full bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo/90 hover:to-vuilder-indigo/80 text-white rounded-xl py-6 h-auto font-medium shadow-sm"
        >
          {isLoadingNewBatch ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Apply Selection & Generate Words'
          )}
        </Button>
      </div>
    </div>
  );
};

export default CategorySelection;

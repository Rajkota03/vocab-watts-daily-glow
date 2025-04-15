
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Brain, Briefcase, Smile, Sparkles, 
  Heart, GraduationCap, Target, 
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
  
  // Extract from current category string if available
  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimary(parts[0]);
        setSelectedSubcategory(parts[1]);
      }
    }
  }, [currentCategory]);
  
  // For desktop version
  const categories = [
    { name: 'Daily', id: 'daily', icon: <Brain className="h-4 w-4" /> },
    { name: 'Business', id: 'business', icon: <Briefcase className="h-4 w-4" /> },
    { name: 'Interview', id: 'interview', icon: <Target className="h-4 w-4" /> },
    { name: 'Slang', id: 'slang', icon: <Smile className="h-4 w-4" /> },
    { name: 'Rare Words', id: 'rare', icon: <Sparkles className="h-4 w-4" /> },
    { name: 'Self-Expression', id: 'expression', icon: <Heart className="h-4 w-4" /> },
    { name: 'Exam Prep', id: 'exam', icon: <GraduationCap className="h-4 w-4" /> }
  ];
  
  const subcategories = selectedPrimary === 'exam' ? 
    [
      { name: 'GRE', id: 'gre' },
      { name: 'IELTS', id: 'ielts' },
      { name: 'TOEFL', id: 'toefl' },
      { name: 'CAT', id: 'cat' },
      { name: 'GMAT', id: 'gmat' }
    ] : 
    [
      { name: 'Beginner', id: 'beginner' },
      { name: 'Intermediate', id: 'intermediate' },
      { name: 'Professional', id: 'professional' }
    ];
  
  const handleDesktopCategorySelect = (primary: string) => {
    setSelectedPrimary(primary);
    
    // If they're changing categories, reset subcategory
    if (primary !== selectedPrimary) {
      setSelectedSubcategory(null);
    }
  };
  
  const handleDesktopSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };
  
  const handleApplyDesktop = async () => {
    if (selectedPrimary && selectedSubcategory) {
      onCategoryUpdate(selectedPrimary, selectedSubcategory);
      
      if (onNewBatch) {
        await onNewBatch();
      }
    }
  };

  // Mobile version
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
  
  // Desktop version with Apple-inspired design
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-medium mb-4 text-gray-700">Word Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className={`py-2 px-3 cursor-pointer transition-all duration-200 ${
                selectedPrimary === category.id 
                  ? 'bg-vuilder-indigo text-white shadow-sm scale-105' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              } rounded-full`}
              onClick={() => handleDesktopCategorySelect(category.id)}
            >
              <span className="flex items-center gap-1.5">
                {category.icon}
                {category.name}
              </span>
            </Badge>
          ))}
        </div>
      </div>
      
      {selectedPrimary && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-medium mb-4 text-gray-700">
            {selectedPrimary === 'exam' ? 'Exam Type' : 'Difficulty Level'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((subcategory) => (
              <Badge
                key={subcategory.id}
                variant="outline"
                className={`py-2 px-3 cursor-pointer transition-all duration-200 ${
                  selectedSubcategory === subcategory.id 
                    ? 'bg-vuilder-mint text-white shadow-sm scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } rounded-full`}
                onClick={() => handleDesktopSubcategorySelect(subcategory.id)}
              >
                <span className="flex items-center gap-1.5">
                  {selectedSubcategory === subcategory.id && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {subcategory.name}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="pt-2">
        <Button
          disabled={!selectedPrimary || !selectedSubcategory || isLoadingNewBatch}
          onClick={handleApplyDesktop}
          className={`${isPro ? "" : "opacity-60 cursor-not-allowed"} bg-gradient-to-r from-vuilder-indigo to-vuilder-indigo/90 hover:from-vuilder-indigo hover:to-vuilder-indigo/80 text-white rounded-full transition-all shadow-sm px-5 py-2`}
        >
          {isLoadingNewBatch ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>Apply Selection & Generate Words</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CategorySelection;

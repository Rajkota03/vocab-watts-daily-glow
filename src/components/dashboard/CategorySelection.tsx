
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileCategorySelection from './MobileCategorySelection';
import CategoryGrid from './category/CategoryGrid';
import SubcategoryGrid from './category/SubcategoryGrid';
import WordCountSelector from './category/WordCountSelector';
import TimeScheduler from './category/TimeScheduler';

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
  const [scheduledTime, setScheduledTime] = useState<string>('');

  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimary(parts[0]);
        setSelectedSubcategory(parts[1]);
      }
    }
  }, [currentCategory]);

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
      <CategoryGrid 
        selectedPrimary={selectedPrimary} 
        onPrimarySelect={handlePrimarySelect} 
      />
      
      {selectedPrimary && (
        <SubcategoryGrid
          selectedPrimary={selectedPrimary}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={handleSubcategorySelect}
        />
      )}
      
      {selectedSubcategory && (
        <>
          <WordCountSelector
            wordCount={wordCount}
            onWordCountChange={setWordCount}
          />
          
          <TimeScheduler
            scheduledTime={scheduledTime}
            onScheduledTimeChange={setScheduledTime}
          />
          
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
        </>
      )}
    </div>
  );
};

export default CategorySelection;

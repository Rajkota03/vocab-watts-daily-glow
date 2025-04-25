import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import MobileCategorySelection from './MobileCategorySelection';
import CategoryGrid from './category/CategoryGrid';
import SubcategoryGrid from './category/SubcategoryGrid';
import WordCountSelector from './category/WordCountSelector';
import TimeScheduler from './category/TimeScheduler';
import { useToast } from '@/hooks/use-toast';

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
  const {
    toast
  } = useToast();

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
      try {
        onCategoryUpdate(selectedPrimary, selectedSubcategory);
        if (onNewBatch) {
          await onNewBatch();
          toast({
            title: "Words generated successfully!",
            description: `Your new ${wordCount} words have been scheduled for delivery.`
          });
        }
      } catch (error) {
        toast({
          title: "Failed to generate words",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    }
  };

  if (isMobile) {
    return <MobileCategorySelection isPro={isPro} currentCategory={currentCategory} onCategoryUpdate={onCategoryUpdate} onNewBatch={onNewBatch} isLoadingNewBatch={isLoadingNewBatch} />;
  }

  return <Card className="border border-stroke/50 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <CategoryGrid selectedPrimary={selectedPrimary} onPrimarySelect={handlePrimarySelect} />
            
            {selectedPrimary && <SubcategoryGrid selectedPrimary={selectedPrimary} selectedSubcategory={selectedSubcategory} onSubcategorySelect={handleSubcategorySelect} />}
          </div>
          
          <div className="space-y-8">
            {selectedSubcategory && <>
                <WordCountSelector wordCount={wordCount} onWordCountChange={setWordCount} />
                
                <TimeScheduler scheduledTime={scheduledTime} onScheduledTimeChange={setScheduledTime} />

                <Button disabled={!selectedPrimary || !selectedSubcategory || isLoadingNewBatch} onClick={handleApply} className="w-full bg-primary text-white rounded-lg py-3 h-12 font-medium transition-all hover:bg-primary/90" aria-live="polite">
                  {isLoadingNewBatch ? <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </> : 'Apply Selection & Generate Words'}
                </Button>
              </>}
          </div>
        </div>
      </div>
    </Card>;
};

export default CategorySelection;


import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CategoryGrid from './category/CategoryGrid';
import SubcategoryGrid from './category/SubcategoryGrid';
import WordCountSelector from './category/WordCountSelector';

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
  const [selectedPrimary, setSelectedPrimary] = React.useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string | null>(null);
  const [wordCount, setWordCount] = React.useState(3);
  const { toast } = useToast();

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
            description: `Your new ${wordCount} words have been scheduled for delivery.`,
            variant: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Failed to generate words",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="border border-stroke/50 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur">
      <div className="p-6 md:p-8">
        <div className="card-content flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="space-y-8 flex-shrink-0">
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <CategoryGrid 
                selectedPrimary={selectedPrimary} 
                onPrimarySelect={handlePrimarySelect} 
              />
            </div>
            
            <div className="slider-wrapper px-1">
              <WordCountSelector
                wordCount={wordCount}
                onWordCountChange={setWordCount}
              />
            </div>
            
            {selectedPrimary && (
              <SubcategoryGrid
                selectedPrimary={selectedPrimary}
                selectedSubcategory={selectedSubcategory}
                onSubcategorySelect={handleSubcategorySelect}
              />
            )}
          </div>

          <div className="space-y-8 flex-shrink-0">
            {selectedSubcategory && (
              <Button
                disabled={!selectedPrimary || !selectedSubcategory || isLoadingNewBatch}
                onClick={handleApply}
                className="w-full bg-primary text-white rounded-lg py-3 h-12 font-medium transition-all hover:bg-primary/90"
                aria-live="polite"
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
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategorySelection;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import MobileCategorySelection from './MobileCategorySelection';
import CategoryGrid from './category/CategoryGrid';
import SubcategoryGrid from './category/SubcategoryGrid';
import WordCountSelector from './category/WordCountSelector';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (primary: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
  onWordCountChange?: (count: number) => void;
  customDeliveryMode?: boolean;
  onDeliveryModeChange?: (custom: boolean) => void;
  wordCount?: number;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  isPro,
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false,
  onWordCountChange,
  customDeliveryMode = false,
  onDeliveryModeChange,
  wordCount: externalWordCount = 3
}) => {
  const isMobile = useIsMobile();
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(externalWordCount);
  const { toast } = useToast();

  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        setSelectedPrimary(parts[0]);
        setSelectedSubcategory(parts[1]);
      }
    }
  }, [currentCategory]);

  // Sync with external word count
  useEffect(() => {
    setWordCount(externalWordCount);
  }, [externalWordCount]);

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
    return <MobileCategorySelection 
      isPro={isPro} 
      currentCategory={currentCategory} 
      onCategoryUpdate={onCategoryUpdate} 
      onNewBatch={onNewBatch} 
      isLoadingNewBatch={isLoadingNewBatch}
      onWordCountChange={onWordCountChange}
      wordCount={wordCount}
    />;
  }

  const handleWordCountChange = (count: number) => {
    console.log('CategorySelection - Word count changing to:', count);
    setWordCount(count);
    onWordCountChange?.(count); // Notify parent component
  };

  return (
    <Card className="border border-stroke/50 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Word Category</h3>
              <CategoryGrid selectedPrimary={selectedPrimary} onPrimarySelect={handlePrimarySelect} isPro={true} />
            </div>
            
            {selectedPrimary && (
              <SubcategoryGrid 
                selectedPrimary={selectedPrimary} 
                selectedSubcategory={selectedSubcategory} 
                onSubcategorySelect={handleSubcategorySelect}
                isPro={true}
              />
            )}
          </div>
          
          <div className="space-y-8">
            {selectedSubcategory && (
              <>
                <WordCountSelector 
                  wordCount={wordCount} 
                  onWordCountChange={handleWordCountChange}
                  isPro={true}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="space-y-1">
                      <Label htmlFor="custom-delivery" className="text-sm font-medium text-gray-900">
                        Let me choose times
                      </Label>
                      <p className="text-xs text-gray-600">
                        Set custom delivery times for your words
                      </p>
                    </div>
                    <Switch
                      id="custom-delivery"
                      checked={customDeliveryMode}
                      onCheckedChange={onDeliveryModeChange}
                    />
                  </div>
                </div>

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
                  ) : 'Apply Selection & Generate Words'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategorySelection;

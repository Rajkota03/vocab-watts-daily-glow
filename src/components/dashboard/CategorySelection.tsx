
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
  const [wordCount, setWordCount] = useState(isPro ? 3 : 1);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (currentCategory) {
      const parts = currentCategory.split('-');
      if (parts.length === 2) {
        // Only set to non-daily category if user is pro
        if (isPro || parts[0] === 'daily') {
          setSelectedPrimary(parts[0]);
          setSelectedSubcategory(parts[1]);
        } else {
          setSelectedPrimary('daily');
          setSelectedSubcategory('beginner');
        }
      }
    }
  }, [currentCategory, isPro]);

  const handlePrimarySelect = (primary: string) => {
    // Check if user is pro or trying to select 'daily'
    if (!isPro && primary !== 'daily') {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to access all categories",
      });
      return;
    }
    
    setSelectedPrimary(primary);
    if (primary !== selectedPrimary) {
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    // For 'professional' difficulty or any exam category, check pro status
    if (!isPro && (subcategory === 'professional' || selectedPrimary === 'exam')) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to access advanced levels",
      });
      return;
    }
    
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
    />;
  }

  return (
    <Card className="border border-stroke/50 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-4 border-b border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-amber-800">Free Trial</h3>
              <p className="text-sm text-amber-700">You're using the free version. Upgrade to unlock all features.</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/upgrade'}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Word Category</h3>
              <CategoryGrid selectedPrimary={selectedPrimary} onPrimarySelect={handlePrimarySelect} isPro={isPro} />
            </div>
            
            {selectedPrimary && (
              <SubcategoryGrid 
                selectedPrimary={selectedPrimary} 
                selectedSubcategory={selectedSubcategory} 
                onSubcategorySelect={handleSubcategorySelect}
                isPro={isPro}
              />
            )}
          </div>
          
          <div className="space-y-8">
            {selectedSubcategory && (
              <>
                <WordCountSelector 
                  wordCount={wordCount} 
                  onWordCountChange={setWordCount}
                  isPro={isPro}
                />
                
                <TimeScheduler 
                  scheduledTime={scheduledTime} 
                  onScheduledTimeChange={setScheduledTime} 
                />

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

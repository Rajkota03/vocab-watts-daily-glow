
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import MobileCategorySelection from './MobileCategorySelection';
import CategoryGrid from './category/CategoryGrid';
import SubcategoryGrid from './category/SubcategoryGrid';
import WordCountSelector from './category/WordCountSelector';
import { useToast } from '@/hooks/use-toast';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (primary: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
  onWordCountChange?: (count: number) => void; // Add callback for word count changes
  scheduleMode?: 'auto' | 'custom'; // Add schedule mode prop
  onScheduleModeChange?: (mode: 'auto' | 'custom') => void; // Add schedule mode change callback
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  isPro,
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false,
  onWordCountChange,
  scheduleMode = 'auto',
  onScheduleModeChange
}) => {
  const isMobile = useIsMobile();
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(3);
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
    />;
  }

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
    onWordCountChange?.(count); // Notify parent component
  };

  const handleScheduleModeToggle = (enabled: boolean) => {
    const newMode: 'auto' | 'custom' = enabled ? 'custom' : 'auto';
    onScheduleModeChange?.(newMode);
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

                {/* Schedule Mode Toggle */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] leading-6 font-semibold text-slate-800">Let me choose times</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-[12px] leading-4">
                              Set custom delivery times or let us auto-space your words
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Switch
                        checked={scheduleMode === 'custom'}
                        onCheckedChange={handleScheduleModeToggle}
                        className="data-[state=checked]:bg-teal-600"
                      />
                    </motion.div>
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

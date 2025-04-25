
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import MobileCategorySelector from './MobileCategorySelector';

interface MobileCategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (primary: string, subcategory: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
  isFreeTrialUser?: boolean;
}

const MobileCategorySelection: React.FC<MobileCategorySelectionProps> = ({
  isPro,
  currentCategory,
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false,
  isFreeTrialUser = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
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
    // If user is on free trial, they can only select 'daily' category
    if (isFreeTrialUser && primary !== 'daily') {
      toast({
        title: "Free Trial Restriction",
        description: "Free trial users can only access the Daily vocabulary category. Upgrade to Pro to unlock all categories.",
        variant: "warning"
      });
      return;
    }
    
    setSelectedPrimary(primary);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleApply = async () => {
    if (selectedPrimary && selectedSubcategory) {
      setIsOpen(false);
      
      try {
        onCategoryUpdate(selectedPrimary, selectedSubcategory);
        if (onNewBatch) {
          await onNewBatch();
        }
      } catch (error) {
        toast({
          title: "Failed to update category",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    }
  };

  const formatCategoryForDisplay = (primary: string, subcategory: string) => {
    const capitalizedPrimary = primary.charAt(0).toUpperCase() + primary.slice(1);
    const capitalizedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
    return `${capitalizedPrimary} - ${capitalizedSubcategory}`;
  };

  return (
    <Card className="border border-stroke shadow-sm overflow-hidden rounded-xl">
      {isFreeTrialUser && (
        <div className="bg-amber-50 border-b border-amber-100 p-4 text-sm">
          <p className="text-amber-800">
            <strong>Free Trial Mode:</strong> You can only use the Daily category. Upgrade to Pro to unlock all categories.
          </p>
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between w-full p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Current Category</p>
                    <p className="font-medium">
                      {selectedPrimary && selectedSubcategory
                        ? formatCategoryForDisplay(selectedPrimary, selectedSubcategory)
                        : 'Select a category'}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <MobileCategorySelector
                selectedPrimary={selectedPrimary}
                selectedSubcategory={selectedSubcategory}
                onPrimarySelect={handlePrimarySelect}
                onSubcategorySelect={handleSubcategorySelect}
                isFreeTrialUser={isFreeTrialUser}
              />

              <div className="mt-4 space-y-4">
                <Button
                  onClick={handleApply}
                  disabled={!selectedPrimary || !selectedSubcategory}
                  className="w-full"
                >
                  Apply Selection
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            onClick={onNewBatch}
            disabled={isLoadingNewBatch || !selectedPrimary || !selectedSubcategory}
            className="w-full flex items-center justify-center"
          >
            {isLoadingNewBatch ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate New Words'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileCategorySelection;

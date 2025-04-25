
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Check, RefreshCw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { primaryCategories } from './CategoryStep';
import { getSubcategories } from './SubcategoryStep';

interface ConfirmationStepProps {
  selectedPrimary: string;
  selectedSubcategory: string;
  handleBack: () => void;
  onApplySelection?: () => void;
  isLoadingNewBatch: boolean;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedPrimary,
  selectedSubcategory,
  handleBack,
  onApplySelection,
  isLoadingNewBatch,
}) => {
  const selectedCategory = primaryCategories.find(c => c.id === selectedPrimary);
  const subcategories = getSubcategories(selectedPrimary);
  const selectedSubcategoryData = subcategories.find(s => s.id === selectedSubcategory);

  return (
    <div className="animate-fade-in px-4 flex-1 flex flex-col">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="p-1 mr-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-bold text-gray-800">Confirm selection</h3>
      </div>
      
      <div className="flex-1">
        <Card className="border-0 shadow p-6 mb-6 bg-white">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Your selection</h4>
          
          <div className="flex items-center mb-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mr-4",
              selectedCategory?.color.split(' ')[0]
            )}>
              {selectedCategory?.icon}
            </div>
            <div>
              <h3 className="font-medium text-base">{selectedCategory?.name}</h3>
              <p className="text-sm text-gray-600">{selectedCategory?.description}</p>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-100 my-4"></div>
          
          <div className="flex items-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mr-4",
              selectedSubcategoryData?.color.split(' ')[0]
            )}>
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-base">{selectedSubcategoryData?.name}</h3>
              <p className="text-sm text-gray-600">{selectedSubcategoryData?.description}</p>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-gray-600 text-sm mb-4">
          {selectedCategory?.name} vocabulary at {selectedSubcategoryData?.name} level will be generated for you.
        </p>
      </div>
      
      <Button
        onClick={onApplySelection}
        className="w-full bg-gradient-to-r from-vocab-purple to-indigo-500 hover:from-vocab-purple/90 hover:to-indigo-500/90 text-white h-14 rounded-xl shadow-md mt-auto"
      >
        {isLoadingNewBatch ? (
          <>
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            Apply & Generate Words
          </>
        )}
      </Button>
    </div>
  );
};

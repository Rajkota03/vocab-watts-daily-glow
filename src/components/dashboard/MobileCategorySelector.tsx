
import React, { useState } from 'react';
import { CategoryStep } from './mobile/CategoryStep';
import { SubcategoryStep } from './mobile/SubcategoryStep';
import { ConfirmationStep } from './mobile/ConfirmationStep';

interface MobileCategorySelectorProps {
  isPro?: boolean;
  currentCategory?: string;
  selectedPrimary: string | null;
  selectedSubcategory: string | null;
  onPrimarySelect: (primary: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  onApplySelection?: () => void;
  isLoadingNewBatch?: boolean;
  isFreeTrialUser?: boolean;
}

const MobileCategorySelector: React.FC<MobileCategorySelectorProps> = ({
  isPro = false,
  selectedPrimary,
  selectedSubcategory,
  onPrimarySelect,
  onSubcategorySelect,
  onApplySelection,
  isLoadingNewBatch = false,
  isFreeTrialUser = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(selectedPrimary ? (selectedSubcategory ? 3 : 2) : 1);
  
  const handlePrimarySelect = (categoryId: string) => {
    onPrimarySelect(categoryId);
    setStep(2);
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategorySelect(subcategoryId);
    setStep(3);
  };
  
  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
  };
  
  return (
    <div className="flex flex-col min-h-[500px]">
      <div className="mb-6 px-4">
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-vocab-purple to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium">
          <span className={step >= 1 ? "text-vocab-purple" : "text-gray-400"}>Category</span>
          <span className={step >= 2 ? "text-vocab-purple" : "text-gray-400"}>Level</span>
          <span className={step >= 3 ? "text-vocab-purple" : "text-gray-400"}>Apply</span>
        </div>
      </div>
      
      {step === 1 && (
        <CategoryStep
          selectedPrimary={selectedPrimary}
          handlePrimarySelect={handlePrimarySelect}
          isPro={isPro}
        />
      )}
      
      {step === 2 && selectedPrimary && (
        <SubcategoryStep
          selectedSubcategory={selectedSubcategory}
          handleBack={handleBack}
          handleSubcategorySelect={handleSubcategorySelect}
          selectedPrimary={selectedPrimary}
        />
      )}
      
      {step === 3 && selectedPrimary && selectedSubcategory && (
        <ConfirmationStep
          selectedPrimary={selectedPrimary}
          selectedSubcategory={selectedSubcategory}
          handleBack={handleBack}
          onApplySelection={onApplySelection}
          isLoadingNewBatch={isLoadingNewBatch}
        />
      )}
    </div>
  );
};

export default MobileCategorySelector;

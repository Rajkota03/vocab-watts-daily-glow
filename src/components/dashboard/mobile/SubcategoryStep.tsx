
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubcategoryStepProps {
  selectedSubcategory: string | null;
  handleBack: () => void;
  handleSubcategorySelect: (subcategoryId: string) => void;
  selectedPrimary: string;
}

export const getSubcategories = (selectedPrimary: string) => {
  const difficultyLevels = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Basic everyday vocabulary',
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      description: 'Challenging vocabulary',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced terminology',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    }
  ];

  const examTypes = [
    {
      id: 'gre',
      name: 'GRE',
      description: 'Graduate Record Examination',
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      id: 'ielts',
      name: 'IELTS',
      description: 'International English Testing',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      description: 'Test of English as Foreign Language',
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      id: 'cat',
      name: 'CAT',
      description: 'Common Admission Test',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'gmat',
      name: 'GMAT',
      description: 'Graduate Management Admission Test',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    }
  ];

  return selectedPrimary === 'exam' ? examTypes : difficultyLevels;
};

export const SubcategoryStep: React.FC<SubcategoryStepProps> = ({
  selectedSubcategory,
  handleBack,
  handleSubcategorySelect,
  selectedPrimary,
}) => {
  const subcategories = getSubcategories(selectedPrimary);

  return (
    <div className="animate-fade-in px-4 flex-1">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="p-1 mr-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-xl font-bold text-gray-800">Choose your level</h3>
      </div>
      
      <RadioGroup 
        value={selectedSubcategory || ""}
        onValueChange={handleSubcategorySelect}
        className="grid grid-cols-1 gap-3"
      >
        {subcategories.map((level) => (
          <Card 
            key={level.id}
            className={cn(
              "border-0 shadow-sm hover:shadow transition-all duration-200 overflow-hidden",
              selectedSubcategory === level.id && "ring-1 ring-vocab-purple shadow"
            )}
          >
            <div className="flex items-center p-4">
              <RadioGroupItem
                value={level.id}
                id={`step2-${level.id}`}
                className="mr-4"
              />
              
              <div className="flex-1">
                <label 
                  htmlFor={`step2-${level.id}`} 
                  className="font-medium text-base cursor-pointer"
                >
                  {level.name}
                </label>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};

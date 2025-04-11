
import React from 'react';
import { Briefcase, GraduationCap, Smile, Brain, Zap, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (category: string) => void;
  onNewBatch?: () => Promise<void>;
  isLoadingNewBatch?: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  gradient: string;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  isPro, 
  currentCategory, 
  onCategoryUpdate,
  onNewBatch,
  isLoadingNewBatch = false
}) => {
  const categories: CategoryOption[] = [
    {
      id: 'business',
      name: 'Business English',
      icon: <Briefcase className="h-6 w-6" />,
      description: 'Professional vocabulary for work and career advancement',
      color: 'bg-blue-100 text-blue-600',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'exam',
      name: 'Academic & Exam Prep',
      icon: <GraduationCap className="h-6 w-6" />,
      description: 'Advanced words for tests, exams, and scholarly writing',
      color: 'bg-emerald-100 text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'slang',
      name: 'Modern Slang & Idioms',
      icon: <Smile className="h-6 w-6" />,
      description: 'Casual expressions and contemporary language',
      color: 'bg-amber-100 text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'general',
      name: 'Daily Intelligence',
      icon: <Brain className="h-6 w-6" />,
      description: 'Well-rounded vocabulary enhancement for everyday life',
      color: 'bg-purple-100 text-purple-600',
      gradient: 'from-purple-500 to-pink-600',
    }
  ];

  const handleNewBatchClick = async () => {
    if (onNewBatch) {
      try {
        await onNewBatch();
        toast({
          title: "New words batch generated!",
          description: `Fresh vocabulary words for ${currentCategory} category have been added.`,
        });
      } catch (error) {
        console.error('Error generating new batch:', error);
        toast({
          title: "Error generating new words",
          description: "Could not generate new vocabulary words. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Select Your Word Category</h3>
        {isPro && onNewBatch && (
          <Button 
            onClick={handleNewBatchClick}
            disabled={isLoadingNewBatch}
            className="bg-vocab-purple hover:bg-vocab-purple/90 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingNewBatch ? 'animate-spin' : ''}`} />
            {isLoadingNewBatch ? 'Generating...' : 'New Batch'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const isSelected = isPro && currentCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-2 border-vocab-purple bg-vocab-purple/5 shadow-md'
                  : isPro
                  ? 'hover:border-gray-300 border border-gray-200'
                  : 'opacity-70 border border-gray-200'
              }`}
              onClick={() => isPro && onCategoryUpdate(category.id)}
            >
              <div className="p-5">
                <div className="flex items-start space-x-4">
                  <div className={`rounded-lg p-3 ${
                    isSelected
                      ? `bg-gradient-to-br ${category.gradient} text-white`
                      : category.color
                  }`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-medium text-lg ${isSelected ? 'text-vocab-purple' : ''}`}>
                        {category.name}
                      </h3>
                      {isPro && (
                        <Checkbox 
                          checked={currentCategory === category.id}
                          onCheckedChange={() => onCategoryUpdate(category.id)}
                          className="data-[state=checked]:bg-vocab-purple data-[state=checked]:border-vocab-purple h-5 w-5"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5">{category.description}</p>
                    
                    {isSelected && (
                      <div className="mt-3 flex items-center text-xs text-vocab-purple font-medium">
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        <span>Currently receiving words from this category</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelection;

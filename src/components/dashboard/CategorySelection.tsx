
import React from 'react';
import { Briefcase, GraduationCap, Smile, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface CategorySelectionProps {
  isPro: boolean;
  currentCategory: string;
  onCategoryUpdate: (category: string) => void;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ 
  isPro, 
  currentCategory, 
  onCategoryUpdate 
}) => {
  const categories: CategoryOption[] = [
    {
      id: 'business',
      name: 'Business English',
      icon: <Briefcase className="h-6 w-6" />,
      description: 'Professional vocabulary for work and career'
    },
    {
      id: 'exam',
      name: 'Exam Prep',
      icon: <GraduationCap className="h-6 w-6" />,
      description: 'Advanced words for tests and academics'
    },
    {
      id: 'slang',
      name: 'Fun & Slang',
      icon: <Smile className="h-6 w-6" />,
      description: 'Casual and trendy expressions'
    },
    {
      id: 'general',
      name: 'Daily Smart',
      icon: <Brain className="h-6 w-6" />,
      description: 'Well-rounded vocabulary enhancement'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id}
          className={`cursor-pointer transition-all border-2 ${
            isPro && currentCategory === category.id
              ? 'border-vocab-purple bg-vocab-purple/5'
              : isPro
              ? 'hover:border-gray-300'
              : 'opacity-70 border-gray-200'
          }`}
          onClick={() => isPro && onCategoryUpdate(category.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className={`rounded-lg p-2 ${
                isPro && currentCategory === category.id
                  ? 'bg-vocab-purple text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{category.name}</h3>
                  {isPro && (
                    <Checkbox 
                      checked={currentCategory === category.id}
                      onCheckedChange={() => onCategoryUpdate(category.id)}
                      className="data-[state=checked]:bg-vocab-purple data-[state=checked]:border-vocab-purple"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategorySelection;

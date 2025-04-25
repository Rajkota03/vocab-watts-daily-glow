
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  BookOpen, Briefcase, MessageSquare, Smile, Sparkle, 
  Heart, GraduationCap, Check 
} from 'lucide-react';

interface CategoryStepProps {
  selectedPrimary: string | null;
  handlePrimarySelect: (categoryId: string) => void;
  isPro?: boolean;
}

export const primaryCategories = [
  {
    id: 'daily',
    name: 'Daily English',
    description: 'Everyday vocabulary',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    id: 'business',
    name: 'Business English',
    description: 'Professional vocabulary',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    id: 'interview',
    name: 'Interview Power Words',
    description: 'Impress in interviews',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-green-50 text-green-600 border-green-100',
  },
  {
    id: 'rare',
    name: 'Beautiful & Rare Words',
    description: 'Uncommon vocabulary',
    icon: <Sparkle className="h-5 w-5" />,
    color: 'bg-pink-50 text-pink-600 border-pink-100',
  },
  {
    id: 'slang',
    name: 'Slang & Modern Lingo',
    description: 'Contemporary expressions',
    icon: <Smile className="h-5 w-5" />,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    id: 'expression',
    name: 'Self-Expression',
    description: 'Express your thoughts',
    icon: <Heart className="h-5 w-5" />,
    color: 'bg-red-50 text-red-600 border-red-100',
  },
  {
    id: 'exam',
    name: 'Exam Prep',
    description: 'Academic vocabulary',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  }
];

export const CategoryStep: React.FC<CategoryStepProps> = ({
  selectedPrimary,
  handlePrimarySelect,
  isPro = false,
}) => {
  return (
    <div className="animate-fade-in px-4 flex-1">
      <h3 className="text-xl font-bold mb-6 text-center text-gray-800">What would you like to learn?</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {primaryCategories.map((category) => (
          <Card 
            key={category.id}
            onClick={() => isPro && handlePrimarySelect(category.id)}
            className={cn(
              "border-0 shadow-sm hover:shadow transition-all duration-200 cursor-pointer overflow-hidden bg-white",
              selectedPrimary === category.id && "ring-1 ring-vocab-purple shadow"
            )}
          >
            <div className="flex items-center p-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                category.color.split(' ')[0]
              )}>
                {category.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-base">{category.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </div>
              
              {selectedPrimary === category.id && (
                <div className="ml-2 rounded-full bg-vocab-purple h-6 w-6 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

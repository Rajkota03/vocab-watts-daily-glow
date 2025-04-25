
import React from 'react';
import { BookOpen, Briefcase, MessageSquare, Smile, Sparkles, Heart, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  selectedPrimary: string | null;
  onPrimarySelect: (primary: string) => void;
}

const categories = [
  { 
    name: 'Daily', 
    id: 'daily', 
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    name: 'Business', 
    id: 'business', 
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    name: 'Interview', 
    id: 'interview', 
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-green-50 text-green-600'
  },
  { 
    name: 'Slang', 
    id: 'slang', 
    icon: <Smile className="h-5 w-5" />,
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    name: 'Rare', 
    id: 'rare', 
    icon: <Sparkles className="h-5 w-5" />,
    color: 'bg-pink-50 text-pink-600'
  },
  { 
    name: 'Expression', 
    id: 'expression', 
    icon: <Heart className="h-5 w-5" />,
    color: 'bg-red-50 text-red-600'
  },
  { 
    name: 'Exam', 
    id: 'exam', 
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-indigo-50 text-indigo-600'
  }
];

const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedPrimary,
  onPrimarySelect,
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-4 text-gray-700">Word Category</h3>
      <div className="flex overflow-x-auto pb-2 gap-2 md:gap-3 -mx-2 px-2 md:px-0 md:-mx-0 md:flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onPrimarySelect(category.id)}
            className={cn(
              "flex items-center px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0",
              selectedPrimary === category.id 
                ? "bg-primary-light text-primary border border-primary" 
                : "bg-[#F4F7FB] text-[#4F607E] hover:bg-gray-100"
            )}
            role="radio"
            aria-checked={selectedPrimary === category.id}
          >
            <span className="flex items-center">
              <span className="mr-1.5">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;

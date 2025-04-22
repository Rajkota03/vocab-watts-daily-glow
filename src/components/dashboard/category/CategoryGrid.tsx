
import React from 'react';
import { BookOpen, Briefcase, MessageSquare, Smile, Sparkles, Heart, GraduationCap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  selectedPrimary: string | null;
  onPrimarySelect: (primary: string) => void;
}

const categories = [
  { 
    name: 'Daily', 
    id: 'daily', 
    icon: <BookOpen className="h-4 w-4" />,
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    name: 'Business', 
    id: 'business', 
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    name: 'Interview', 
    id: 'interview', 
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-green-50 text-green-600'
  },
  { 
    name: 'Slang', 
    id: 'slang', 
    icon: <Smile className="h-4 w-4" />,
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    name: 'Rare', 
    id: 'rare', 
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-pink-50 text-pink-600'
  },
  { 
    name: 'Expression', 
    id: 'expression', 
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-red-50 text-red-600'
  },
  { 
    name: 'Exam', 
    id: 'exam', 
    icon: <GraduationCap className="h-4 w-4" />,
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
      <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onPrimarySelect(category.id)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
              selectedPrimary === category.id 
                ? `${category.color} shadow-sm ring-2 ring-vuilder-indigo/20` 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
              selectedPrimary === category.id ? category.color : 'bg-white shadow-sm'
            }`}>
              {category.icon}
            </div>
            <span className="text-xs font-medium">{category.name}</span>
            
            {selectedPrimary === category.id && (
              <div className="absolute -top-1 -right-1 rounded-full bg-vuilder-indigo h-5 w-5 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;

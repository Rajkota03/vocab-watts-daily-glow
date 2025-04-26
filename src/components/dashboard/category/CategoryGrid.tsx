
import React from 'react';
import { BookOpen, Briefcase, MessageSquare, Smile, Sparkles, Heart, GraduationCap, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface CategoryGridProps {
  selectedPrimary: string | null;
  onPrimarySelect: (primary: string) => void;
  isPro: boolean;
}

const categories = [
  { 
    id: 'daily',
    name: 'Daily',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'from-blue-500/20 to-blue-600/20 text-blue-600',
    hoverColor: 'hover:from-blue-500/30 hover:to-blue-600/30',
    activeColor: 'ring-blue-400 from-blue-500/30 to-blue-600/30',
    proOnly: false
  },
  { 
    id: 'business',
    name: 'Business',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'from-purple-500/20 to-purple-600/20 text-purple-600',
    hoverColor: 'hover:from-purple-500/30 hover:to-purple-600/30',
    activeColor: 'ring-purple-400 from-purple-500/30 to-purple-600/30',
    proOnly: true
  },
  { 
    id: 'interview',
    name: 'Interview',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'from-green-500/20 to-green-600/20 text-green-600',
    hoverColor: 'hover:from-green-500/30 hover:to-green-600/30',
    activeColor: 'ring-green-400 from-green-500/30 to-green-600/30',
    proOnly: true
  },
  { 
    id: 'slang',
    name: 'Slang',
    icon: <Smile className="h-4 w-4" />,
    color: 'from-amber-500/20 to-amber-600/20 text-amber-600',
    hoverColor: 'hover:from-amber-500/30 hover:to-amber-600/30',
    activeColor: 'ring-amber-400 from-amber-500/30 to-amber-600/30',
    proOnly: true
  },
  { 
    id: 'rare',
    name: 'Rare',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'from-pink-500/20 to-pink-600/20 text-pink-600',
    hoverColor: 'hover:from-pink-500/30 hover:to-pink-600/30',
    activeColor: 'ring-pink-400 from-pink-500/30 to-pink-600/30',
    proOnly: true
  },
  { 
    id: 'expression',
    name: 'Expression',
    icon: <Heart className="h-4 w-4" />,
    color: 'from-red-500/20 to-red-600/20 text-red-600',
    hoverColor: 'hover:from-red-500/30 hover:to-red-600/30',
    activeColor: 'ring-red-400 from-red-500/30 to-red-600/30',
    proOnly: true
  },
  { 
    id: 'exam',
    name: 'Exam',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600',
    hoverColor: 'hover:from-indigo-500/30 hover:to-indigo-600/30',
    activeColor: 'ring-indigo-400 from-indigo-500/30 to-indigo-600/30',
    proOnly: true
  }
];

const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedPrimary,
  onPrimarySelect,
  isPro
}) => {
  const navigate = useNavigate();
  
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!isPro && category?.proOnly) {
      // Pro feature prompt
      return;
    }
    onPrimarySelect(categoryId);
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => (
        <TooltipProvider key={category.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 w-full",
                    "bg-gradient-to-br shadow-sm",
                    "hover:shadow-md",
                    category.color,
                    category.hoverColor,
                    selectedPrimary === category.id && [
                      "ring-2 ring-offset-2",
                      category.activeColor
                    ],
                    (!isPro && category.proOnly) && "opacity-50"
                  )}
                  disabled={!isPro && category.proOnly}
                >
                  <div className="mb-2">{category.icon}</div>
                  <span className="text-xs md:text-sm font-medium text-center leading-tight">
                    {category.name}
                  </span>
                  
                  {selectedPrimary === category.id && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                      <Check className="h-3 w-3 text-vocab-purple" />
                    </div>
                  )}
                  
                  {!isPro && category.proOnly && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm p-0.5">
                      <Lock className="h-3 w-3 text-amber-500" />
                    </div>
                  )}
                </button>
              </div>
            </TooltipTrigger>
            {!isPro && category.proOnly && (
              <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                <div className="text-xs text-amber-800 flex flex-col gap-1">
                  <p>Pro Feature: {category.name} Category</p>
                  <p className="text-[10px] opacity-90">Upgrade to access all categories</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default CategoryGrid;


import React from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WordCountSelectorProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
  isPro: boolean;
}

const WordCountSelector: React.FC<WordCountSelectorProps> = ({
  wordCount,
  onWordCountChange,
  isPro
}) => {
  const navigate = useNavigate();
  
  // Pastel colors for each word count option
  const wordCountOptions = [
    {
      count: 1,
      message: "Perfect for focused, in-depth learning! Master one word at a time. 🎯",
      color: "bg-[#F2FCE2] text-green-700",
      proOnly: false
    },
    {
      count: 2,
      message: "A balanced approach to expand your vocabulary steadily! 📚",
      color: "bg-[#FEF7CD] text-amber-700",
      proOnly: false
    },
    {
      count: 3,
      message: "Great choice! Build your vocabulary with confidence! 💪",
      color: "bg-[#E5DEFF] text-indigo-700",
      proOnly: false
    },
    {
      count: 4,
      message: "Fantastic! You're taking your language skills to the next level! 🚀",
      color: "bg-[#FDE1D3] text-orange-700",
      proOnly: true
    },
    {
      count: 5,
      message: "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆",
      color: "bg-[#FFDEE2] text-pink-700",
      proOnly: true
    }
  ];
  
  // Remove word count restriction

  const handleWordCountChange = (count: number) => {
    onWordCountChange(count);
  };
  
  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  return (
    <div className="space-y-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 slider-label">Daily Word Count</h3>
      </div>
      
      <div className="text-center mb-2 text-primary font-medium">
        <span className={cn(
          "text-2xl px-3 py-1 rounded-lg",
          wordCountOptions.find(o => o.count === wordCount)?.color || "bg-gray-100"
        )}>
          {wordCount}
        </span>
        <span className="ml-1">word{wordCount !== 1 ? 's' : ''} a day</span>
      </div>
      
      <div className="relative">
        <Slider
          value={[wordCount]}
          min={1}
          max={5}
          step={1}
          className="py-4"
          onValueChange={(values) => handleWordCountChange(values[0])}
          aria-label="Word count"
        />
      </div>
      
      <div className="flex justify-between text-xs">
        {wordCountOptions.map((option) => (
          <div key={option.count} className="text-gray-500">
            {option.count}
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-600 italic mt-2">
        {wordCountOptions.find(option => option.count === wordCount)?.message}
      </p>
    </div>
  );
};

export default WordCountSelector;

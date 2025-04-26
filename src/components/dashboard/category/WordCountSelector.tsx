
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
  
  // Enforce word count restriction for free users
  React.useEffect(() => {
    if (!isPro && wordCount > 3) {
      onWordCountChange(3);
    }
  }, [isPro, wordCount, onWordCountChange]);

  const handleWordCountChange = (count: number) => {
    const option = wordCountOptions.find(o => o.count === count);
    if (!isPro && option?.proOnly) {
      return; // Don't change for free users if it's a pro option
    }
    onWordCountChange(count);
  };
  
  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  return (
    <div className="space-y-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 slider-label">Daily Word Count</h3>
        {!isPro && (
          <Button 
            onClick={handleUpgrade}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
            size="sm"
          >
            Upgrade
          </Button>
        )}
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
        
        {!isPro && (
          <div className="absolute top-0 right-0 left-[60%] h-full flex items-center justify-end">
            <div className="w-full h-4 bg-gradient-to-r from-transparent to-amber-100/80 rounded-r-full"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs">
        {wordCountOptions.map((option) => (
          <TooltipProvider key={option.count}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "text-gray-500 relative",
                  (!isPro && option.proOnly) ? "text-amber-400" : ""
                )}>
                  {option.count}
                  {(!isPro && option.proOnly) && (
                    <div className="absolute -top-3 -right-3">
                      <Lock className="h-2.5 w-2.5 text-amber-500" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {(!isPro && option.proOnly) && (
                <TooltipContent side="top" className="bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-800">
                    <p>Upgrade to Pro to get {option.count} words per day</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      <p className="text-sm text-gray-600 italic mt-2">
        {wordCountOptions.find(option => option.count === wordCount)?.message}
      </p>
    </div>
  );
};

export default WordCountSelector;

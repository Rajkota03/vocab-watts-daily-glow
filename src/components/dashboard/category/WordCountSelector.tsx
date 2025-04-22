
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WordCountSelectorProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
}

const wordCountMotivation = {
  1: "Perfect for focused, in-depth learning! Master one word at a time. 🎯",
  2: "A balanced approach to expand your vocabulary steadily! 📚",
  3: "Great choice! Build your vocabulary with confidence! 💪",
  4: "Fantastic! You're taking your language skills to the next level! 🚀",
  5: "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆"
};

const WordCountSelector: React.FC<WordCountSelectorProps> = ({
  wordCount,
  onWordCountChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Daily Word Count</h3>
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((count) => (
          <button
            key={count}
            onClick={() => onWordCountChange(count)}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl transition-all duration-200",
              wordCount === count 
                ? 'bg-vuilder-mint/10 ring-2 ring-vuilder-mint text-vuilder-mint shadow-sm' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            )}
          >
            <span className="text-2xl font-semibold">{count}</span>
            <span className="text-xs mt-1">word{count > 1 ? 's' : ''}</span>
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 italic">
        {wordCountMotivation[wordCount as keyof typeof wordCountMotivation]}
      </p>
    </div>
  );
};

export default WordCountSelector;

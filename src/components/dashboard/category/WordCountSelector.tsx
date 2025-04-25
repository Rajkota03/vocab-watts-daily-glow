
import React from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface WordCountSelectorProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
}

const WordCountSelector: React.FC<WordCountSelectorProps> = ({
  wordCount,
  onWordCountChange,
}) => {
  return (
    <div className="space-y-4 flex-shrink-0">
      <h3 className="text-sm font-medium text-gray-700 slider-label">Daily Word Count</h3>
      
      <div className="text-center mb-2 text-primary font-medium">
        <span className="text-2xl">{wordCount}</span>
        <span className="ml-1">word{wordCount !== 1 ? 's' : ''} a day</span>
      </div>
      
      <Slider
        value={[wordCount]}
        min={1}
        max={5}
        step={1}
        className="py-4"
        onValueChange={(values) => onWordCountChange(values[0])}
        aria-label="Word count"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      
      <p className="text-sm text-gray-600 italic mt-2">
        {wordCount === 1 && "Perfect for focused, in-depth learning! Master one word at a time. 🎯"}
        {wordCount === 2 && "A balanced approach to expand your vocabulary steadily! 📚"}
        {wordCount === 3 && "Great choice! Build your vocabulary with confidence! 💪"}
        {wordCount === 4 && "Fantastic! You're taking your language skills to the next level! 🚀"}
        {wordCount === 5 && "Impressive commitment to rapid vocabulary growth! You're a language champion! 🏆"}
      </p>
    </div>
  );
};

export default WordCountSelector;

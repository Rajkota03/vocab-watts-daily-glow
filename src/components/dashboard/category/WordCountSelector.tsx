
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface WordCountSelectorProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
  isPro?: boolean; 
  isFreeTrialUser?: boolean;
}

const WordCountSelector: React.FC<WordCountSelectorProps> = ({ 
  wordCount, 
  onWordCountChange,
  isPro = false,
  isFreeTrialUser = false
}) => {
  const options = [
    { value: 1, label: '1 word', description: 'Start slow', proOnly: false },
    { value: 2, label: '2 words', description: 'Beginner pace', proOnly: false },
    { value: 5, label: '5 words', description: 'Advanced', proOnly: true }
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Daily Word Count</h3>
      <RadioGroup 
        value={wordCount.toString()} 
        onValueChange={(value) => onWordCountChange(parseInt(value))}
        className="grid grid-cols-3 gap-3"
      >
        {options.map((option) => {
          const isDisabled = option.proOnly && !isPro;
          // Special handling for free trial users - they can only access 1 & 2 words
          const isFreeTrialDisabled = isFreeTrialUser && option.value > 2;
          const isOptionDisabled = isDisabled || isFreeTrialDisabled;
          
          return (
            <div key={option.value} className="relative">
              <RadioGroupItem 
                value={option.value.toString()} 
                id={`word-count-${option.value}`} 
                className="peer sr-only" 
                disabled={isOptionDisabled}
              />
              <Label 
                htmlFor={`word-count-${option.value}`} 
                className={`flex flex-col items-center justify-center h-24 rounded-lg border-2 border-zinc-200 bg-white p-2 cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 peer-checked:border-primary peer-checked:bg-primary/5 transition-all ${isOptionDisabled ? 'opacity-50 cursor-not-allowed hover:bg-white hover:border-zinc-200' : ''}`}
              >
                <span className="text-lg font-medium mb-1">{option.label}</span>
                <span className="text-xs text-center text-zinc-500">{option.description}</span>
                {option.proOnly && (
                  <span className="absolute top-1 right-1 bg-purple-100 text-purple-700 text-[10px] px-1.5 rounded">Pro</span>
                )}
                {isOptionDisabled && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2 py-1 rounded">
                      Pro only
                    </div>
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default WordCountSelector;

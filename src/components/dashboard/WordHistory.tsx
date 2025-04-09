
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVocabWordsByCategory } from '@/services/subscriptionService';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';

type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row'];

interface WordHistoryProps {
  isPro: boolean;
  isTrialExpired: boolean;
  category: string;
}

const WordHistory: React.FC<WordHistoryProps> = ({ 
  isPro, 
  isTrialExpired,
  category 
}) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadWords = async () => {
      if (isTrialExpired && !isPro) {
        setLoading(false);
        return;
      }

      try {
        const wordsData = await getVocabWordsByCategory(category);
        if (wordsData) {
          setWords(wordsData);
        }
      } catch (error) {
        console.error('Failed to fetch words:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [isPro, isTrialExpired, category]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isTrialExpired && !isPro) {
    return (
      <div className="py-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Word History Locked</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Your trial has ended. Upgrade to Pro to see your word history and continue receiving vocabulary.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading your words...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No words in your history yet. Check back tomorrow for your first word drop!</p>
      </div>
    );
  }

  // Group words by date
  const wordsByDate: Record<string, VocabularyWord[]> = {};
  words.forEach(word => {
    const dateStr = format(new Date(word.created_at), 'yyyy-MM-dd');
    if (!wordsByDate[dateStr]) {
      wordsByDate[dateStr] = [];
    }
    wordsByDate[dateStr].push(word);
  });

  return (
    <div className="space-y-4">
      {Object.entries(wordsByDate).map(([dateStr, dateWords]) => (
        <div key={dateStr} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 text-sm font-medium">
            {format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="divide-y">
            {dateWords.map(word => (
              <Collapsible 
                key={word.id}
                open={openItems[word.id]}
                onOpenChange={() => toggleItem(word.id)}
                className="px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{word.word}</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${openItems[word.id] ? 'transform rotate-180' : ''}`}
                      />
                      <span className="sr-only">Toggle details</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-2 text-sm space-y-2">
                  <div>
                    <span className="font-medium text-gray-600">Definition:</span> {word.definition}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Example:</span> {word.example}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WordHistory;

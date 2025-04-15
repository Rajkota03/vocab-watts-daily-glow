
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVocabWordsByCategory } from '@/services/subscriptionService';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lock, BookOpen, Volume2, Check, AlignLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  // Use useCallback to memoize the loadWords function
  const loadWords = useCallback(async () => {
    if (isTrialExpired && !isPro) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading words for category:', category);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found in WordHistory');
        setLoading(false);
        return;
      }
      
      // First try to get words from user_word_history - this is the most reliable source
      const { data: userHistoryWords, error: historyError } = await supabase
        .from('user_word_history')
        .select('word_id, date_sent, word')
        .eq('user_id', userId)
        .eq('category', category)
        .order('date_sent', { ascending: false })
        .limit(20);
        
      if (historyError) {
        console.error('Error fetching user word history:', historyError);
        toast({
          title: "Error loading word history",
          description: historyError.message,
          variant: "destructive"
        });
      }
      
      if (userHistoryWords && userHistoryWords.length > 0) {
        console.log(`Found ${userHistoryWords.length} words in user_word_history for category ${category}`);
        
        // Use the user_word_history to get the words
        const wordIds = userHistoryWords.map(hw => hw.word_id);
        
        // Fetch the complete word data from vocabulary_words
        const { data: wordsData, error: wordsError } = await supabase
          .from('vocabulary_words')
          .select('*')
          .in('id', wordIds);
          
        if (wordsError) {
          console.error('Error fetching vocabulary words:', wordsError);
          toast({
            title: "Error retrieving vocabulary words",
            description: wordsError.message,
            variant: "destructive"
          });
        } else if (wordsData && wordsData.length > 0) {
          // Sort the words in the same order as userHistoryWords (by date_sent, most recent first)
          const sortedWords = userHistoryWords.map(historyWord => 
            wordsData.find(word => word.id === historyWord.word_id)
          ).filter(Boolean) as VocabularyWord[];
          
          console.log('Retrieved and sorted words from user history:', sortedWords.map(w => w.word));
          setWords(sortedWords);
          setLoading(false);
          return;
        } else {
          console.log('No vocabulary data found for word IDs:', wordIds);
        }
      } else {
        console.log('No user history found for category:', category);
      }
      
      console.log('Falling back to sent_words table');
      
      // Fall back to the old sent_words table
      const { data: userData, error: userError } = await supabase
        .from('user_subscriptions')
        .select('phone_number')
        .eq('user_id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        // If we can't get the phone number, try to get words directly
        const wordsData = await getVocabWordsByCategory(category);
        if (wordsData) {
          console.log(`Retrieved ${wordsData.length} words directly from vocabulary_words via service`);
          setWords(wordsData);
        }
        setLoading(false);
        return;
      }
      
      const phoneNumber = userData?.phone_number;
      
      // Get the most recent sent words for this user
      const { data: sentWords, error: sentWordsError } = await supabase
        .from('sent_words')
        .select('word_id, sent_at')
        .eq('user_id', userId)
        .eq('category', category)
        .order('sent_at', { ascending: false })
        .limit(20);
        
      if (sentWordsError) {
        console.error('Error fetching sent words:', sentWordsError);
        toast({
          title: "Error loading sent words",
          description: sentWordsError.message,
          variant: "destructive"
        });
      }
      
      if (sentWords && sentWords.length > 0) {
        console.log(`Found ${sentWords.length} words in sent_words table for category ${category}`);
        
        // Get the actual word data for the sent words
        const wordIds = sentWords.map(sw => sw.word_id);
        
        // Retrieve the words in order of most recently sent
        const { data: wordsData, error: wordsError } = await supabase
          .from('vocabulary_words')
          .select('*')
          .in('id', wordIds);
          
        if (wordsError) {
          console.error('Error fetching words:', wordsError);
          toast({
            title: "Error retrieving vocabulary words",
            description: wordsError.message,
            variant: "destructive"
          });
        } else if (wordsData && wordsData.length > 0) {
          // Sort the words in the same order as sentWords (by sent_at, most recent first)
          const sortedWords = sentWords.map(sentWord => 
            wordsData.find(word => word.id === sentWord.word_id)
          ).filter(Boolean) as VocabularyWord[];
          
          console.log('Retrieved and sorted words from sent words:', sortedWords.map(w => w.word));
          setWords(sortedWords);
          setLoading(false);
          return;
        } else {
          console.log('No vocabulary data found for sent word IDs:', wordIds);
        }
      } else {
        console.log('No sent words found for category:', category);
      }
      
      console.log('No word history found, fetching vocabulary words directly');
      // If no words were found in either table, fall back to getting vocabulary words directly
      const wordsData = await getVocabWordsByCategory(category);
      if (wordsData) {
        console.log(`Found ${wordsData.length} words directly from vocabulary_words`);
        setWords(wordsData);
      } else {
        console.log('No words found in any table');
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
      toast({
        title: "Error loading words",
        description: "There was a problem loading your vocabulary history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [isPro, isTrialExpired, category, toast]);

  // Load words when component mounts or dependencies change
  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // Listen for refresh events from ApiTestButton
  useEffect(() => {
    const handleRefreshEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventCategory = customEvent.detail?.category;
      
      console.log('Received refresh-word-history event with category:', eventCategory);
      
      // Only refresh if event is for current category or no category specified
      if (!eventCategory || eventCategory === category) {
        console.log('Refreshing word history based on event');
        loadWords();
      } else {
        console.log('Ignoring refresh event for different category:', eventCategory);
      }
    };
    
    document.addEventListener('refresh-word-history', handleRefreshEvent);
    
    return () => {
      document.removeEventListener('refresh-word-history', handleRefreshEvent);
    };
  }, [category, loadWords]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered for category:', category);
    loadWords();
  };

  if (isTrialExpired && !isPro) {
    return (
      <div className="py-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <Lock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Word History Locked</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Your trial has ended. Upgrade to Pro to see your word history and continue receiving vocabulary.
        </p>
        <Button className="mt-6 bg-gradient-to-r from-vocab-purple to-violet-500 hover:from-vocab-purple/90 hover:to-violet-500/90">
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="divide-y">
              {[1, 2].map((j) => (
                <div key={j} className="px-4 py-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Words Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Your vocabulary journey is about to begin! Use the "New Batch" button to get your first word drop or try the "API Test" button.
        </p>
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
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="text-vocab-teal border-vocab-teal/20 hover:bg-vocab-teal/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    
      {Object.entries(wordsByDate).map(([dateStr, dateWords]) => (
        <div key={dateStr} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 text-sm font-medium flex items-center">
            <Calendar date={dateStr} />
            <span className="ml-3">{format(new Date(dateStr), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="divide-y">
            {dateWords.map(word => (
              <Collapsible 
                key={word.id}
                open={openItems[word.id]}
                onOpenChange={() => toggleItem(word.id)}
                className="px-4 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-800 mr-2">{word.word}</h4>
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                      {word.category}
                    </Badge>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${openItems[word.id] ? 'transform rotate-180' : ''}`}
                      />
                      <span className="sr-only">Toggle details</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pt-3 text-sm space-y-3 animate-slide-in-right">
                  <div className="flex items-start">
                    <AlignLeft className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700 block mb-1">Definition:</span> 
                      <p className="text-gray-600">{word.definition}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Volume2 className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700 block mb-1">Example:</span> 
                      <p className="italic text-gray-600">"{word.example}"</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="text-xs h-7 rounded-full text-vocab-teal border-vocab-teal/30 hover:bg-vocab-teal/10 mr-2">
                      <Volume2 className="h-3 w-3 mr-1" /> Pronounce
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 rounded-full text-vocab-purple border-vocab-purple/30 hover:bg-vocab-purple/10">
                      <Check className="h-3 w-3 mr-1" /> Mark as learned
                    </Button>
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

// Helper component for calendar date display
const Calendar = ({ date }: { date: string }) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = format(dateObj, 'MMM');
  
  return (
    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
      <span className="text-xs font-bold uppercase text-vocab-purple">{month}</span>
      <span className="text-sm font-bold">{day}</span>
    </div>
  );
};

export default WordHistory;


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchNewWords } from "@/services/wordService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeSentiment, getSentimentSquare } from '@/utils/sentimentAnalysis';

interface WordHistoryProps {
  category: string;
  userId: string;
}

interface WordHistoryItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  sent_at?: string;
}

const WordHistory: React.FC<WordHistoryProps> = ({ category, userId }) => {
  const [recentWords, setRecentWords] = useState<WordHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Function to fetch recent words
  const fetchRecentWords = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log(`Fetching recent words for category: ${category}`);
      
      // Get sent words for this user and category
      const { data: sentWords, error: sentWordsError } = await supabase
        .from('sent_words')
        .select(`
          word_id,
          sent_at,
          vocabulary_words (
            id,
            word,
            definition,
            example,
            category
          )
        `)
        .eq('user_id', userId)
        .eq('category', category)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (sentWordsError) {
        console.error('Error fetching sent words:', sentWordsError);
        throw new Error('Failed to load your word history');
      }

      // Transform the data to a more usable format
      const formattedWords = sentWords?.map(item => ({
        id: item.vocabulary_words.id,
        word: item.vocabulary_words.word,
        definition: item.vocabulary_words.definition,
        example: item.vocabulary_words.example,
        category: item.vocabulary_words.category,
        sent_at: item.sent_at
      })) || [];

      console.log(`Found ${formattedWords.length} recent words`);
      setRecentWords(formattedWords);
    } catch (error) {
      console.error('Error in fetchRecentWords:', error);
      toast({
        title: "Error Loading Words",
        description: error instanceof Error ? error.message : "Failed to load word history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchRecentWords();
    }
  }, [userId, category]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshEvent = (event: CustomEvent) => {
      console.log('Received refresh-word-history event', event.detail);
      if (!event.detail?.category || event.detail.category === category) {
        fetchRecentWords(event.detail?.force);
      }
    };

    // Add event listener
    document.addEventListener('refresh-word-history', handleRefreshEvent as EventListener);

    // Clean up
    return () => {
      document.removeEventListener('refresh-word-history', handleRefreshEvent as EventListener);
    };
  }, [category]);

  if (loading && recentWords.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Words</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => fetchRecentWords(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-1">Refresh</span>
        </Button>
      </div>

      {recentWords.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No words have been sent to you yet for this category.</p>
            <p className="text-sm mt-2">Words will appear here after they're sent to your WhatsApp.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentWords.map((word) => {
            const sentiment = analyzeSentiment(word.word);
            const sentimentSquare = getSentimentSquare(sentiment);
            
            return (
            <Card key={word.id} className="overflow-hidden">
              <CardHeader className="py-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {word.word}
                    <span className="text-lg" title={`Sentiment: ${sentiment}`}>
                      {sentimentSquare}
                    </span>
                  </CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {word.category}
                  </Badge>
                </div>
                {word.sent_at && (
                  <CardDescription className="text-xs">
                    Sent on {new Date(word.sent_at).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Definition:</span> {word.definition}
                  </div>
                  <div>
                    <span className="font-medium">Example:</span> <em>"{word.example}"</em>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WordHistory;


import { supabase } from '@/integrations/supabase/client';

export interface EnrichedVocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  mnemonic?: string;
  synonyms?: string[];
  pronunciation?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  created_at: string;
}

interface WordEnrichmentData {
  mnemonic: string;
  synonyms: string[];
  pronunciation: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Enriches a vocabulary word with additional learning details using OpenAI
 */
export const enrichVocabularyWord = async (
  word: string,
  definition: string,
  example: string
): Promise<WordEnrichmentData> => {
  try {
    console.log(`Enriching vocabulary word: ${word}`);

    const { data, error } = await supabase.functions.invoke('enrich-vocabulary-word', {
      body: {
        word,
        definition,
        example
      }
    });

    if (error) {
      console.error('Error enriching vocabulary word:', error);
      throw new Error(`Failed to enrich word: ${error.message}`);
    }

    if (!data || !data.enrichment) {
      throw new Error('Invalid enrichment response received');
    }

    return data.enrichment;
  } catch (error) {
    console.error('Error in enrichVocabularyWord:', error);
    throw error;
  }
};

/**
 * Enriches multiple vocabulary words in batch
 */
export const enrichVocabularyWordsBatch = async (
  words: Array<{ word: string; definition: string; example: string }>
): Promise<WordEnrichmentData[]> => {
  try {
    const enrichmentPromises = words.map(wordData => 
      enrichVocabularyWord(wordData.word, wordData.definition, wordData.example)
    );

    const results = await Promise.allSettled(enrichmentPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to enrich word ${words[index].word}:`, result.reason);
        // Return fallback enrichment data
        return {
          mnemonic: `Remember: ${words[index].word} relates to ${words[index].definition}`,
          synonyms: [],
          pronunciation: `/${words[index].word.toLowerCase()}/`,
          sentiment: 'neutral' as const
        };
      }
    });
  } catch (error) {
    console.error('Error in batch enrichment:', error);
    throw error;
  }
};

/**
 * Creates a mnemonic for a word based on its definition
 */
export const generateMnemonic = (word: string, definition: string): string => {
  const wordLower = word.toLowerCase();
  
  // Simple mnemonic generation based on word patterns
  if (wordLower.includes('perplex')) {
    return "Puzzle + flexed = brain twisted in confusion";
  }
  
  // Default pattern
  return `Remember: ${word} - ${definition.split('.')[0]}`;
};

/**
 * Determines sentiment of a word based on its definition
 */
export const analyzeSentiment = (definition: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'beautiful', 'perfect', 'brilliant', 'outstanding'];
  const negativeWords = ['bad', 'terrible', 'awful', 'confused', 'puzzled', 'difficult', 'wrong', 'failed', 'problem', 'error'];
  
  const defLower = definition.toLowerCase();
  
  if (positiveWords.some(word => defLower.includes(word))) {
    return 'positive';
  }
  
  if (negativeWords.some(word => defLower.includes(word))) {
    return 'negative';
  }
  
  return 'neutral';
};

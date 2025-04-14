
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type VocabularyWord = Database['public']['Tables']['vocabulary_words']['Row'];

/**
 * Fetches new vocabulary words that haven't been sent to the user yet
 * @param category The category of words to fetch
 * @param limit The number of words to fetch
 * @returns An array of new vocabulary words
 */
export const fetchNewWords = async (
  category: string,
  limit: number = 5
): Promise<VocabularyWord[]> => {
  try {
    console.log(`Fetching new words for category: ${category}`);
    
    // Get the current user's session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      throw new Error('Authentication required');
    }
    
    // Get user's phone number
    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('phone_number')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Failed to retrieve user information');
    }
    
    const phoneNumber = userData?.phone_number;
    
    if (!phoneNumber) {
      console.error('No phone number found for user');
      throw new Error('User profile incomplete');
    }
    
    // Get IDs of words already sent to this user/phone - using a direct query to sent_words table
    // Using 'from' with 'sent_words' as string literal to bypass TypeScript checks
    const { data: sentWordsData, error: sentWordsError } = await supabase
      .from('sent_words' as any)
      .select('word_id')
      .eq('category', category)
      .eq('phone_number', phoneNumber);
      
    if (sentWordsError) {
      console.error('Error fetching sent words:', sentWordsError);
      throw new Error('Failed to check word history');
    }
    
    // Extract the word IDs from the sent words - using type assertion for sentWordsData
    const sentWordIds = (sentWordsData as any[])?.map(row => row.word_id) || [];
    console.log(`Found ${sentWordIds.length} previously sent words`);
    
    // Query for words in the specified category that haven't been sent yet
    let query = supabase
      .from('vocabulary_words')
      .select('*')
      .eq('category', category)
      .limit(limit);
      
    // If there are sent words, exclude them
    if (sentWordIds.length > 0) {
      query = query.not('id', 'in', `(${sentWordIds.join(',')})`);
    }
    
    const { data: words, error: wordsError } = await query;
    
    if (wordsError) {
      console.error('Error fetching new words:', wordsError);
      throw new Error('Failed to fetch vocabulary words');
    }
    
    console.log(`Retrieved ${words?.length || 0} new words from database`);
    
    // If not enough words found in the database, generate new ones with OpenAI
    if (!words || words.length < limit) {
      console.log('Not enough words in database, generating with OpenAI');
      const newWordsNeeded = limit - (words?.length || 0);
      
      // Call the OpenAI function to generate new words
      const { data: generatedData, error: generatedError } = await supabase.functions.invoke('generate-vocab-words', {
        body: { 
          category: category,
          count: newWordsNeeded
        }
      });
      
      if (generatedError) {
        console.error('Error generating words with OpenAI:', generatedError);
        // If generating fails, fallback to existing words or previously sent words
      } else if (generatedData && generatedData.words) {
        console.log(`Successfully generated ${generatedData.words.length} new words with OpenAI`);
        
        // Insert the generated words into the database
        const { data: insertedWords, error: insertError } = await supabase
          .from('vocabulary_words')
          .insert(generatedData.words)
          .select();
          
        if (insertError) {
          console.error('Error inserting generated words:', insertError);
        } else if (insertedWords) {
          console.log(`Inserted ${insertedWords.length} generated words into database`);
          // Combine existing words with new generated words
          return [...(words || []), ...insertedWords];
        }
      }
    }
    
    // If we still don't have enough words (generation failed or insertion failed)
    if (!words || words.length < limit) {
      console.log('Still not enough words, fetching some previously sent words');
      
      // Get some previously sent words as fallback
      const { data: fallbackWords, error: fallbackError } = await supabase
        .from('vocabulary_words')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit - (words?.length || 0));
        
      if (fallbackError) {
        console.error('Error fetching fallback words:', fallbackError);
      } else if (fallbackWords) {
        // Combine the new words with fallback words
        return [...(words || []), ...fallbackWords];
      }
    }
    
    return words || [];
  } catch (error) {
    console.error('Error in fetchNewWords:', error);
    throw error;
  }
};

/**
 * Marks words as sent to the user to avoid repetition
 * @param words The vocabulary words to mark as sent
 * @param category The category of the words
 * @returns Whether the operation was successful
 */
export const markWordsAsSent = async (
  words: VocabularyWord[],
  category: string
): Promise<boolean> => {
  try {
    if (!words || words.length === 0) {
      console.log('No words to mark as sent');
      return true;
    }
    
    // Get the current user's session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      throw new Error('Authentication required');
    }
    
    // Get user's phone number
    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('phone_number')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Failed to retrieve user information');
    }
    
    const phoneNumber = userData?.phone_number;
    
    if (!phoneNumber) {
      console.error('No phone number found for user');
      throw new Error('User profile incomplete');
    }
    
    // Prepare records to insert into sent_words table
    const sentWordsRecords = words.map(word => ({
      word_id: word.id,
      user_id: userId,
      phone_number: phoneNumber,
      category: category
    }));
    
    // Insert records into sent_words table - using 'from' with string literal to bypass TypeScript checks
    const { error: insertError } = await supabase
      .from('sent_words' as any)
      .insert(sentWordsRecords);
      
    if (insertError) {
      console.error('Error marking words as sent:', insertError);
      throw new Error('Failed to update word history');
    }
    
    console.log(`Successfully marked ${words.length} words as sent`);
    return true;
  } catch (error) {
    console.error('Error in markWordsAsSent:', error);
    throw error;
  }
};

/**
 * Fetches and processes a new batch of words for the user
 * @param category The category of words to fetch
 * @returns The new batch of vocabulary words
 */
export const generateNewWordBatch = async (
  category: string
): Promise<VocabularyWord[]> => {
  try {
    console.log(`Generating new word batch for category: ${category}`);
    
    // Fetch new words
    const newWords = await fetchNewWords(category);
    
    if (!newWords || newWords.length === 0) {
      console.error('No words found for category:', category);
      throw new Error(`No vocabulary words available for ${category}`);
    }
    
    // Mark words as sent
    await markWordsAsSent(newWords, category);
    
    return newWords;
  } catch (error) {
    console.error('Error generating new word batch:', error);
    throw error;
  }
};

/**
 * Generates new vocabulary words using OpenAI API
 * @param category The category of words to generate
 * @param count The number of words to generate
 * @returns The newly generated vocabulary words
 */
export const generateWordsWithAI = async (
  category: string,
  count: number = 5
): Promise<VocabularyWord[]> => {
  try {
    console.log(`Generating ${count} words for ${category} using OpenAI`);
    
    const { data, error } = await supabase.functions.invoke('generate-vocab-words', {
      body: { category, count }
    });
    
    if (error) {
      console.error('Error calling OpenAI generation function:', error);
      throw new Error('Failed to generate words with AI');
    }
    
    if (!data || !data.words || !Array.isArray(data.words)) {
      console.error('Invalid response from OpenAI function:', data);
      throw new Error('Invalid response from AI word generation');
    }
    
    console.log(`Successfully generated ${data.words.length} words with OpenAI`);
    
    // Insert the new words into the database
    const { data: insertedWords, error: insertError } = await supabase
      .from('vocabulary_words')
      .insert(data.words)
      .select();
      
    if (insertError) {
      console.error('Error inserting AI-generated words:', insertError);
      throw new Error('Failed to save generated words');
    }
    
    return insertedWords || [];
  } catch (error) {
    console.error('Error in generateWordsWithAI:', error);
    throw error;
  }
};

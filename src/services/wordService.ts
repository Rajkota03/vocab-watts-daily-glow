
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { checkUserProStatus } from "./subscriptionService"; // Import the status check function

type VocabularyWord = Database["public"]["Tables"]["vocabulary_words"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];

/**
 * Fetches new vocabulary words that haven't been sent to the user yet.
 * Respects the provided limit.
 * @param userId The ID of the user.
 * @param phoneNumber The phone number of the user.
 * @param category The category of words to fetch.
 * @param limit The maximum number of words to fetch.
 * @returns An array of new vocabulary words.
 */
export const fetchNewWords = async (
  userId: string,
  phoneNumber: string,
  category: string,
  limit: number
): Promise<VocabularyWord[]> => {
  try {
    console.log(`fetchNewWords: Fetching up to ${limit} new words for user ${userId}, category: ${category}`);

    // Get IDs of words already sent to this user/phone
    const { data: sentWordsData, error: sentWordsError } = await supabase
      .from("sent_words") // Assuming 'sent_words' table exists
      .select("word_id")
      .eq("user_id", userId)
      .eq("category", category);
      // Consider filtering by phone_number too if user_id isn't always the primary key

    if (sentWordsError) {
      console.error("fetchNewWords: Error fetching sent words:", sentWordsError);
      throw new Error("Failed to check word history");
    }

    const sentWordIds = sentWordsData?.map((row) => row.word_id) || [];
    console.log(`fetchNewWords: Found ${sentWordIds.length} previously sent words for user ${userId} in category ${category}`);

    // Query for words in the specified category that haven't been sent yet
    let query = supabase
      .from("vocabulary_words")
      .select("*")
      .eq("category", category)
      .limit(limit);

    if (sentWordIds.length > 0) {
      query = query.not("id", "in", `(${sentWordIds.join(",")})`);
    }

    const { data: words, error: wordsError } = await query;

    if (wordsError) {
      console.error("fetchNewWords: Error fetching new words:", wordsError);
      throw new Error("Failed to fetch vocabulary words");
    }

    console.log(`fetchNewWords: Retrieved ${words?.length || 0} new words from database`);

    // If not enough words found, try generating new ones with OpenAI
    if (!words || words.length < limit) {
      console.log("fetchNewWords: Not enough words in DB, attempting AI generation...");
      const newWordsNeeded = limit - (words?.length || 0);

      try {
        const generatedWords = await generateWordsWithAI(category, newWordsNeeded);
        if (generatedWords && generatedWords.length > 0) {
           console.log(`fetchNewWords: Successfully generated and saved ${generatedWords.length} new words.`);
           // Combine existing words with newly generated ones
           const combinedWords = [...(words || []), ...generatedWords];
           // Ensure we don't exceed the limit
           return combinedWords.slice(0, limit);
        }
      } catch (aiError) {
        console.error("fetchNewWords: AI generation failed:", aiError);
        // Fall through to fetch fallback words if AI fails
      }
    }
    
    // If still not enough words (DB + AI failed/insufficient), fetch fallback (e.g., older words)
    if (!words || words.length < limit) {
       console.warn(`fetchNewWords: Could only find ${words?.length || 0} unique words for category ${category}. Fetching fallback words.`);
       // Example: Fetch most recent words as fallback, even if sent before, up to the limit
       const fallbackLimit = limit - (words?.length || 0);
       const { data: fallbackWords, error: fallbackError } = await supabase
         .from("vocabulary_words")
         .select("*")
         .eq("category", category)
         .order("created_at", { ascending: false })
         .limit(fallbackLimit);
         
       if (fallbackError) {
         console.error("fetchNewWords: Error fetching fallback words:", fallbackError);
       } else if (fallbackWords) {
         console.log(`fetchNewWords: Using ${fallbackWords.length} fallback words.`);
         // Combine unique words with fallback words
         const combinedFallback = [...(words || []), ...fallbackWords];
         // Remove duplicates just in case, although fallback logic might allow repeats
         const uniqueFallback = Array.from(new Map(combinedFallback.map(w => [w.id, w])).values());
         return uniqueFallback.slice(0, limit);
       }
    }

    return words || []; // Return whatever was found up to the limit

  } catch (error) {
    console.error("fetchNewWords: Unexpected error:", error);
    throw error;
  }
};

/**
 * Marks words as sent to the user to avoid repetition.
 * @param userId The ID of the user.
 * @param phoneNumber The phone number of the user.
 * @param words The vocabulary words to mark as sent.
 * @param category The category of the words.
 * @returns True if successful, false otherwise.
 */
export const markWordsAsSent = async (
  userId: string,
  phoneNumber: string,
  words: VocabularyWord[],
  category: string
): Promise<boolean> => {
  try {
    if (!words || words.length === 0) {
      console.log("markWordsAsSent: No words provided to mark.");
      return true;
    }
    if (!userId || !phoneNumber) {
       console.error("markWordsAsSent: Missing userId or phoneNumber.");
       throw new Error("User identification required to mark words as sent.");
    }

    // Prepare records for the 'sent_words' table
    const sentWordsRecords = words.map((word) => ({
      word_id: word.id,
      user_id: userId,
      phone_number: phoneNumber, // Include phone number for potential lookups
      category: category,
      sent_at: new Date().toISOString(), // Record when it was sent
    }));

    // Insert records into sent_words table
    const { error } = await supabase
      .from("sent_words") // Assuming 'sent_words' table exists
      .insert(sentWordsRecords);

    if (error) {
      // Handle potential duplicate errors gracefully if needed (e.g., if retrying)
      if (error.code === '23505') { // Unique violation
         console.warn(`markWordsAsSent: Attempted to mark already sent words for user ${userId}. Error: ${error.message}`);
         return true; // Consider this a success if they were already marked
      }
      console.error("markWordsAsSent: Error inserting into sent_words:", error);
      throw new Error("Failed to update word history");
    }

    console.log(`markWordsAsSent: Successfully marked ${words.length} words as sent for user ${userId}`);
    return true;
  } catch (error) {
    console.error("markWordsAsSent: Unexpected error:", error);
    throw error;
  }
};

/**
 * Fetches and processes a new batch of words for the user based on their subscription.
 * @param userId The ID of the user.
 * @param category The category of words to fetch.
 * @returns The new batch of vocabulary words.
 */
export const generateNewWordBatch = async (
  userId: string,
  category: string
): Promise<VocabularyWord[]> => {
  try {
    console.log(`generateNewWordBatch: Starting for user ${userId}, category: ${category}`);

    if (!userId) {
      throw new Error("Authentication required to generate word batch.");
    }

    // 1. Get User Subscription Details (including phone number and word count preference)
    const { data: subscriptionData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("phone_number, is_pro, subscription_ends_at, word_count_preference") // Assume word_count_preference column exists
      .eq("user_id", userId)
      .single();

    if (subError || !subscriptionData) {
      console.error(`generateNewWordBatch: Error fetching subscription for user ${userId}:`, subError);
      throw new Error("Could not retrieve user subscription details.");
    }

    const { phone_number: phoneNumber, is_pro, subscription_ends_at, word_count_preference } = subscriptionData;

    if (!phoneNumber) {
      throw new Error("User subscription is missing a phone number.");
    }

    // 2. Determine if Pro is Active
    const isProActive = is_pro === true && 
                        subscription_ends_at && 
                        isAfter(new Date(subscription_ends_at), new Date());

    // 3. Determine Word Limit based on Pro status and preference
    const preferredCount = word_count_preference ?? (isProActive ? 3 : 1); // Default: 3 for Pro, 1 for Free
    const maxLimit = isProActive ? 5 : 3; // Max allowed: 5 for Pro, 3 for Free
    const actualLimit = Math.min(preferredCount, maxLimit);

    console.log(`generateNewWordBatch: User ${userId} - Pro Active: ${isProActive}, Preferred Count: ${preferredCount}, Actual Limit: ${actualLimit}`);

    // 4. Fetch New Words using the determined limit
    const newWords = await fetchNewWords(userId, phoneNumber, category, actualLimit);

    if (!newWords || newWords.length === 0) {
      console.warn(`generateNewWordBatch: No words found or generated for user ${userId}, category: ${category}`);
      // Depending on requirements, could return empty array or throw error
      return []; 
      // throw new Error(`No vocabulary words available for ${category}`);
    }

    console.log(`generateNewWordBatch: Fetched ${newWords.length} words for user ${userId}.`);

    // 5. Mark Words as Sent
    await markWordsAsSent(userId, phoneNumber, newWords, category);

    return newWords;

  } catch (error) {
    console.error(`generateNewWordBatch: Error for user ${userId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
};

/**
 * Generates new vocabulary words using OpenAI API and saves them to the DB.
 * @param category The category of words to generate.
 * @param count The number of words to generate.
 * @returns The newly generated and saved vocabulary words.
 */
export const generateWordsWithAI = async (
  category: string,
  count: number = 5
): Promise<VocabularyWord[]> => {
  if (count <= 0) {
     console.log("generateWordsWithAI: Count is zero or less, skipping generation.");
     return [];
  }
  try {
    console.log(`generateWordsWithAI: Generating ${count} words for ${category} using AI function...`);

    // Call the Supabase Edge Function responsible for AI generation
    const { data: functionResult, error: functionError } = await supabase.functions.invoke(
      "generate-vocab-words", // Ensure this is the correct function name
      {
        body: { category, count },
      }
    );

    if (functionError) {
      console.error("generateWordsWithAI: Error invoking AI generation function:", functionError);
      throw new Error(`AI function invocation failed: ${functionError.message}`);
    }

    // Validate the response from the Edge Function
    if (!functionResult || !Array.isArray(functionResult.words) || functionResult.words.length === 0) {
      console.error("generateWordsWithAI: Invalid or empty response from AI function:", functionResult);
      throw new Error("AI generation returned no valid words.");
    }

    console.log(`generateWordsWithAI: Received ${functionResult.words.length} words from AI function.`);

    // Prepare words for insertion (ensure they have necessary fields, maybe assign UUIDs if not done by function)
    const wordsToInsert = functionResult.words.map((word: any) => ({
      // Map fields from AI response to DB schema
      word: word.word,
      definition: word.definition,
      example: word.example,
      category: category, // Ensure category is set
      // Add other fields like difficulty, source='AI', etc. if needed
    }));

    // Insert the new words into the database
    const { data: insertedWords, error: insertError } = await supabase
      .from("vocabulary_words")
      .insert(wordsToInsert)
      .select(); // Select the inserted rows to return them

    if (insertError) {
      console.error("generateWordsWithAI: Error inserting AI-generated words:", insertError);
      // Decide if partial insert is acceptable or if it should throw
      throw new Error(`Failed to save generated words: ${insertError.message}`);
    }

    console.log(`generateWordsWithAI: Successfully inserted ${insertedWords?.length || 0} AI-generated words.`);
    return insertedWords || []; // Return the newly inserted words

  } catch (error) {
    console.error("generateWordsWithAI: Unexpected error:", error);
    // Avoid throwing if AI generation is optional, maybe return empty array
    // throw error; 
    return []; // Return empty array on failure
  }
};


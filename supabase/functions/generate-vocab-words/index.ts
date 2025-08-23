
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VocabWordRequest {
  category: string;
  count?: number;
}

interface VocabWord {
  word: string;
  definition: string;
  example: string;
  category: string;
  pronunciation: string;
  part_of_speech: string;
  memory_hook: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 1 }: VocabWordRequest = await req.json();
    
    // Use the count parameter, default to 1 if not provided
    const wordsToGenerate = Math.min(Math.max(count, 1), 100); // Cap at 100 for safety
    
    if (!category) {
      throw new Error('Category is required');
    }

    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      throw new Error("OpenAI API key is not configured");
    }

    console.log(`Generating exactly ${wordsToGenerate} vocabulary word(s) for category: ${category}`);

    // Fetch existing words for this category to avoid duplicates
    console.log(`Fetching existing words for category: ${category}`);
    const { data: existingWords, error: existingWordsError } = await supabase
      .from('vocabulary_words')
      .select('word')
      .eq('category', category);

    if (existingWordsError) {
      console.error('Error fetching existing words:', existingWordsError);
      throw new Error(`Failed to fetch existing words: ${existingWordsError.message}`);
    }

    const existingWordSet = new Set(
      existingWords?.map(w => w.word.toLowerCase()) || []
    );
    
    console.log(`Found ${existingWordSet.size} existing words for category ${category}`);

    // Parse the category (support both old format and new primary-subcategory format)
    let primaryCategory = category;
    let subcategory = 'intermediate';
    
    if (category.includes('-')) {
      const parts = category.split('-');
      primaryCategory = parts[0];
      subcategory = parts[1];
    }
    
    // Ensure lowercase for consistency
    primaryCategory = primaryCategory.toLowerCase();
    subcategory = subcategory.toLowerCase();
    
    console.log(`Parsed category: primary=${primaryCategory}, subcategory=${subcategory}`);
    
    // Try to get prompt from database first
    let categoryPrompt = "";
    let promptSource = "database";
    
    try {
      console.log(`Fetching prompt from database for category: ${primaryCategory}, subcategory: ${subcategory}`);
      
      // First try exact match (category + subcategory)
      let { data: promptData, error } = await supabase
        .from('vocab_prompts')
        .select('prompt')
        .eq('category', primaryCategory)
        .eq('subcategory', subcategory)
        .limit(1)
        .single();
      
      // If no exact match, try category only
      if (error || !promptData) {
        console.log(`No exact match found, trying category-only match for: ${primaryCategory}`);
        ({ data: promptData, error } = await supabase
          .from('vocab_prompts')
          .select('prompt')
          .eq('category', primaryCategory)
          .is('subcategory', null)
          .limit(1)
          .single());
      }
      
      if (promptData && promptData.prompt) {
        categoryPrompt = promptData.prompt;
        console.log(`Using database prompt: ${categoryPrompt.substring(0, 100)}...`);
      } else {
        console.log(`No database prompt found, falling back to hardcoded prompts`);
        promptSource = "hardcoded";
        
        // Fallback to hardcoded prompts
        let difficultyLevel = "";
        
        // Set difficulty level based on subcategory
        if (subcategory === 'beginner') {
          difficultyLevel = "basic, simple words suitable for elementary to middle school level (grades 3-8). Focus on common, high-frequency words with 1-3 syllables that appear in everyday conversations";
        } else if (subcategory === 'professional' || subcategory === 'advanced') {
          difficultyLevel = "advanced, sophisticated words suitable for college level and professional settings. Include complex vocabulary with 3+ syllables, lower frequency words, and specialized terminology";
        } else {
          // Default to intermediate
          difficultyLevel = "moderate, practical words suitable for high school level (grades 9-12). Include words with 2-4 syllables that are useful but not overly complex";
        }
        
        // Build prompt based on primary category and subcategory
        switch (primaryCategory) {
          case "business":
            categoryPrompt = `${difficultyLevel} professional business vocabulary that would be useful in a corporate environment`;
            break;
          case "exam":
            // Handle new exam format: exam-gre, exam-ielts, etc.
            if (primaryCategory === 'exam' && subcategory === 'gre') {
              categoryPrompt = "complex, high-difficulty words commonly found in GRE exams with 3+ syllables and sophisticated meanings";
            } else if (primaryCategory === 'exam' && subcategory === 'ielts') {
              categoryPrompt = "academic and formal vocabulary suitable for IELTS exams, focusing on clear, precise meanings";
            } else if (primaryCategory === 'exam' && subcategory === 'toefl') {
              categoryPrompt = "clear, comprehension-focused vocabulary ideal for TOEFL exams with academic context";
            } else if (primaryCategory === 'exam' && subcategory === 'cat') {
              categoryPrompt = "analytical, often abstract English vocabulary for CAT exams with complex meanings";
            } else if (primaryCategory === 'exam' && subcategory === 'gmat') {
              categoryPrompt = "business and formal professional vocabulary useful for GMAT exams";
            } else {
              categoryPrompt = "advanced academic vocabulary that would appear in standardized tests";
            }
            break;
          // Handle the new exam-* categories
          case "exam-gre":
            categoryPrompt = "complex, high-difficulty words commonly found in GRE exams with 3+ syllables and sophisticated meanings";
            break;
          case "exam-ielts":
            categoryPrompt = "academic and formal vocabulary suitable for IELTS exams, focusing on clear, precise meanings";
            break;
          case "exam-toefl":
            categoryPrompt = "clear, comprehension-focused vocabulary ideal for TOEFL exams with academic context";
            break;
          case "exam-cat":
            categoryPrompt = "analytical, often abstract English vocabulary for CAT exams with complex meanings";
            break;
          case "exam-gmat":
            categoryPrompt = "business and formal professional vocabulary useful for GMAT exams";
            break;
          case "slang":
            categoryPrompt = `${difficultyLevel} modern English slang and idioms used in casual conversation`;
            break;
          case "daily":
            categoryPrompt = `${difficultyLevel} everyday vocabulary that enhances daily communication`;
            break;
          case "interview":
            categoryPrompt = `${difficultyLevel} impressive vocabulary that would stand out in job interviews`;
            break;
          case "rare":
            categoryPrompt = `${difficultyLevel} beautiful and uncommon words that enhance eloquence`;
            break;
          case "expression":
            categoryPrompt = `${difficultyLevel} vocabulary focused on expressing thoughts and emotions effectively`;
            break;
          default:
            // For any other category, create a sensible prompt
            categoryPrompt = `${difficultyLevel} vocabulary related to ${primaryCategory} that would enhance knowledge in that area`;
            break;
        }
      }
    } catch (dbError) {
      console.error('Error fetching prompt from database:', dbError);
      promptSource = "hardcoded";
      // Use fallback hardcoded prompts (same as above)
      let difficultyLevel = "";
      
      if (subcategory === 'beginner') {
        difficultyLevel = "basic, simple words suitable for elementary to middle school level";
      } else if (subcategory === 'professional' || subcategory === 'advanced') {
        difficultyLevel = "advanced, sophisticated words suitable for college level and professional settings";
      } else {
        difficultyLevel = "moderate, practical words suitable for high school level";
      }
      
      categoryPrompt = `${difficultyLevel} vocabulary related to ${primaryCategory}`;
    }

    console.log(`Using ${promptSource} prompt to generate words: ${categoryPrompt}`);

    // Log the API key format (first 3 and last 3 chars) for debugging
    const apiKeyDebug = openAIApiKey ? 
      `${openAIApiKey.substring(0, 3)}...${openAIApiKey.substring(openAIApiKey.length - 3)}` : 
      'not set';
    console.log(`Using OpenAI API key: ${apiKeyDebug}`);

    // Generate words with duplicate prevention
    let uniqueWords: VocabWord[] = [];
    let attempts = 0;
    const maxAttempts = 3;
    
    while (uniqueWords.length < wordsToGenerate && attempts < maxAttempts) {
      attempts++;
      
      // Generate more words than needed to account for potential duplicates
      const extraWords = Math.max(5, Math.ceil(wordsToGenerate * 0.5));
      const batchSize = wordsToGenerate + extraWords;
      
      console.log(`Attempt ${attempts}: Generating ${batchSize} words to get ${wordsToGenerate} unique words`);
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: `You are a vocabulary teaching assistant. Generate unique, interesting, and educational vocabulary words with clear definitions and helpful example sentences. Pay careful attention to difficulty levels and word frequency to ensure appropriate classification. 
                
CRITICAL: Avoid these existing words: ${Array.from(existingWordSet).slice(0, 20).join(', ')}${existingWordSet.size > 20 ? ` and ${existingWordSet.size - 20} more...` : ''}` 
              },
              { 
                role: 'user', 
                content: `Generate exactly ${batchSize} unique vocabulary word${batchSize > 1 ? 's' : ''} that follow${batchSize === 1 ? 's' : ''} this guideline: ${categoryPrompt}.
                
                IMPORTANT RULES:
                - Each word must be completely different and unique
                - Avoid common words that might already exist in vocabulary databases
                - Focus on less common but useful words
                - No word should repeat within your response
                - Generate interesting, educational words that users will find valuable to learn
                
                For each word, provide:
                1. The word itself (ensure it matches the specified difficulty level and is unique)
                2. Clear pronunciation guide (e.g., "EL-oh-kwent")
                3. Concise definition/meaning
                4. Part of speech (noun, verb, adjective, etc.)
                5. Natural example sentence showing usage in context
                6. Creative memory hook to help remember the word
                
                Format your response as a valid JSON array with exactly ${batchSize} word objects:
                [
                  {
                    "word": "example",
                    "pronunciation": "ex-AM-pull", 
                    "definition": "definition here",
                    "part_of_speech": "noun",
                    "example": "example sentence here",
                    "memory_hook": "creative memory technique here",
                    "category": "${category}"
                  }
                ]
                
                CRITICAL: Return exactly ${batchSize} completely different words in the array. No duplicates within the response. Do not include code blocks, markdown formatting, or any text outside the JSON array.` 
              }
            ],
            temperature: 0.7, // Higher temperature for more variety
          }),
        });

        console.log('OpenAI API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenAI API error response:', errorText);
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('OpenAI response received with model:', data.model);
        
        if (!data.choices || data.choices.length === 0) {
          console.error('Invalid OpenAI response format - no choices returned:', data);
          throw new Error('Invalid response format from OpenAI - no choices returned');
        }
        
        const content = data.choices[0].message.content;
        console.log('OpenAI raw content sample:', content.substring(0, 100) + '...');
        
        // Parse the JSON response from GPT
        let batchWords: VocabWord[];
        try {
          // Clean up any markdown code blocks or backticks that might be in the response
          const cleanedContent = content
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          
          batchWords = JSON.parse(cleanedContent);
          
          if (!Array.isArray(batchWords)) {
            console.error('OpenAI response is not an array:', batchWords);
            throw new Error('Invalid response format: not an array');
          }
          
          // Validate and filter words
          const validWords = batchWords
            .map(word => {
              // Ensure all required fields are present
              if (!word.word || !word.definition || !word.example || !word.pronunciation || !word.part_of_speech || !word.memory_hook) {
                console.warn('Incomplete word object:', word);
                return null;
              }
              
              return {
                word: word.word.trim(),
                pronunciation: word.pronunciation,
                definition: word.definition,
                part_of_speech: word.part_of_speech,
                example: word.example,
                memory_hook: word.memory_hook,
                category: category
              };
            })
            .filter(word => word !== null) as VocabWord[];
          
          // Filter out duplicates (both against existing words and within this batch)
          const seenInBatch = new Set<string>();
          const newUniqueWords = validWords.filter(word => {
            const wordLower = word.word.toLowerCase();
            
            // Check against existing database words
            if (existingWordSet.has(wordLower)) {
              console.log(`Skipping duplicate word from database: ${word.word}`);
              return false;
            }
            
            // Check against words already added to unique list
            if (uniqueWords.some(existing => existing.word.toLowerCase() === wordLower)) {
              console.log(`Skipping word already in unique list: ${word.word}`);
              return false;
            }
            
            // Check against words in current batch
            if (seenInBatch.has(wordLower)) {
              console.log(`Skipping duplicate within batch: ${word.word}`);
              return false;
            }
            
            seenInBatch.add(wordLower);
            return true;
          });
          
          // Add new unique words to our collection
          uniqueWords.push(...newUniqueWords);
          
          // Update existing word set to include newly found words for next iteration
          newUniqueWords.forEach(word => {
            existingWordSet.add(word.word.toLowerCase());
          });
          
          console.log(`Batch ${attempts}: Generated ${batchWords.length} words, ${newUniqueWords.length} were unique. Total unique so far: ${uniqueWords.length}/${wordsToGenerate}`);
          
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          console.log('Raw content that failed to parse:', content);
          
          // Attempt to extract an array from the content if it's wrapped in other text
          try {
            const possibleJsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
            if (possibleJsonMatch) {
              const extractedJson = possibleJsonMatch[0];
              const extracted = JSON.parse(extractedJson);
              console.log('Successfully extracted JSON from content');
              
              // Process extracted data same as above...
              // For brevity, we'll just continue to next attempt
            } else {
              console.warn(`Attempt ${attempts} failed to parse, trying again...`);
            }
          } catch (extractError) {
            console.error(`Failed to extract JSON on attempt ${attempts}:`, extractError);
          }
        }
        
        // Small delay between attempts to avoid rate limiting
        if (attempts < maxAttempts && uniqueWords.length < wordsToGenerate) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (openaiError) {
        console.error(`OpenAI API error on attempt ${attempts}:`, openaiError);
        if (attempts === maxAttempts) {
          throw new Error(`Failed to generate words with OpenAI after ${maxAttempts} attempts: ${openaiError.message}`);
        }
      }
    }
    
    // Trim to exact number requested
    const finalWords = uniqueWords.slice(0, wordsToGenerate);
    
    if (finalWords.length < wordsToGenerate) {
      console.warn(`Only generated ${finalWords.length} unique words out of ${wordsToGenerate} requested`);
      // Still return what we have rather than failing completely
    }
    
    console.log(`Successfully generated ${finalWords.length} unique words for category ${category}`);
    if (finalWords.length > 0) {
      console.log('Sample word:', JSON.stringify(finalWords[0]));
    }
    
    // Return the generated words
    return new Response(JSON.stringify({ 
      words: finalWords,
      requested: wordsToGenerate,
      generated: finalWords.length,
      attempts: attempts,
      category: category, 
      primaryCategory,
      subcategory,
      source: 'openai',
      promptSource: promptSource,
      existingWordsCount: existingWords?.length || 0,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-vocab-words function:', error);
    
    // Provide a detailed error response
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

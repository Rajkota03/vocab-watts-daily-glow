
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
              content: `You are a vocabulary teaching assistant. Generate unique, interesting, and educational vocabulary words with clear definitions and helpful example sentences. Pay careful attention to difficulty levels and word frequency to ensure appropriate classification.` 
            },
            { 
              role: 'user', 
              content: `Generate exactly ${wordsToGenerate} vocabulary word${wordsToGenerate > 1 ? 's' : ''} that follow${wordsToGenerate === 1 ? 's' : ''} this guideline: ${categoryPrompt}.
              
              For each word, provide:
              1. The word itself (ensure it matches the specified difficulty level)
              2. Clear pronunciation guide (e.g., "EL-oh-kwent")
              3. Concise definition/meaning
              4. Part of speech (noun, verb, adjective, etc.)
              5. Natural example sentence showing usage in context
              6. Creative memory hook to help remember the word
              
              Format your response as a valid JSON array with exactly ${wordsToGenerate} word object${wordsToGenerate > 1 ? 's' : ''}:
              [
                {
                  "word": "example",
                  "pronunciation": "ex-AM-pull", 
                  "definition": "definition here",
                  "part_of_speech": "noun",
                  "example": "example sentence here",
                  "memory_hook": "creative memory technique here",
                  "category": "${category}"
                }${wordsToGenerate > 1 ? ',\n                {\n                  "word": "another",\n                  "pronunciation": "uh-NUHTH-er",\n                  "definition": "one more definition here",\n                  "part_of_speech": "adjective",\n                  "example": "another example sentence here",\n                  "memory_hook": "another memory technique here",\n                  "category": "' + category + '"\n                }' : ''}
              ]
              
              IMPORTANT: Return exactly ${wordsToGenerate} word${wordsToGenerate > 1 ? 's' : ''} in the array, no more, no less. Make sure each word is unique and different from the others. Do not include code blocks, markdown formatting, or any text outside the JSON array.` 
            }
          ],
          temperature: 0.3,
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
      let vocabWords: VocabWord[];
      try {
        // Clean up any markdown code blocks or backticks that might be in the response
        const cleanedContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        vocabWords = JSON.parse(cleanedContent);
        
        if (!Array.isArray(vocabWords)) {
          console.error('OpenAI response is not an array:', vocabWords);
          throw new Error('Invalid response format: not an array');
        }
        
        // Validate the structure of each word
        vocabWords = vocabWords.map(word => {
          // Ensure all required fields are present
          if (!word.word || !word.definition || !word.example || !word.pronunciation || !word.part_of_speech || !word.memory_hook) {
            console.warn('Incomplete word object:', word);
            throw new Error('Invalid word format: missing required fields');
          }
          
          return {
            word: word.word,
            pronunciation: word.pronunciation,
            definition: word.definition,
            part_of_speech: word.part_of_speech,
            example: word.example,
            memory_hook: word.memory_hook,
            category: category // Use the full category (including subcategory)
          };
        });
        
        console.log(`Successfully generated ${vocabWords.length} words for category ${category}`);
        console.log('Sample word:', JSON.stringify(vocabWords[0]));
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Raw content that failed to parse:', content);
        
        // Attempt to extract an array from the content if it's wrapped in other text
        try {
          const possibleJsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
          if (possibleJsonMatch) {
            const extractedJson = possibleJsonMatch[0];
            vocabWords = JSON.parse(extractedJson);
            console.log('Successfully extracted and parsed JSON from content');
          } else {
            throw new Error('Could not extract JSON from response');
          }
        } catch (extractError) {
          console.error('Failed to extract JSON:', extractError);
          throw new Error('Failed to parse vocabulary words from OpenAI response');
        }
      }

      // Return the generated words
      return new Response(JSON.stringify({ 
        words: vocabWords,
        category: category, 
        primaryCategory,
        subcategory,
        source: 'openai',
        promptSource: promptSource,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      throw new Error(`Failed to generate words with OpenAI: ${openaiError.message}`);
    }
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

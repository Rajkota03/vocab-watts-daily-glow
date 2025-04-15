
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 5 }: VocabWordRequest = await req.json();
    
    if (!category) {
      throw new Error('Category is required');
    }

    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      throw new Error("OpenAI API key is not configured");
    }

    console.log(`Generating ${count} vocabulary words for category: ${category}`);

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
    
    // Determine the prompt based on category and subcategory
    let categoryPrompt = "";
    let difficultyLevel = "";
    
    // Set difficulty level based on subcategory
    if (subcategory === 'beginner') {
      difficultyLevel = "basic, easy-to-understand";
    } else if (subcategory === 'professional') {
      difficultyLevel = "advanced, sophisticated";
    } else {
      // Default to intermediate
      difficultyLevel = "moderate, practical";
    }
    
    // Build prompt based on primary category and subcategory
    switch (primaryCategory) {
      case "business":
        categoryPrompt = `${difficultyLevel} professional business vocabulary that would be useful in a corporate environment`;
        break;
      case "exam":
        // For exam category, subcategory is the exam type not difficulty
        if (subcategory === 'gre') {
          categoryPrompt = "complex, high-difficulty words commonly found in GRE exams";
        } else if (subcategory === 'ielts') {
          categoryPrompt = "academic and formal vocabulary suitable for IELTS exams";
        } else if (subcategory === 'toefl') {
          categoryPrompt = "clear, comprehension-focused vocabulary ideal for TOEFL exams";
        } else if (subcategory === 'cat') {
          categoryPrompt = "analytical, often abstract English vocabulary for CAT exams";
        } else if (subcategory === 'gmat') {
          categoryPrompt = "business and formal professional vocabulary useful for GMAT exams";
        } else {
          categoryPrompt = "advanced academic vocabulary that would appear in standardized tests";
        }
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

    console.log(`Using OpenAI to generate words with prompt: ${categoryPrompt}`);

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
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: `You are a vocabulary teaching assistant. Generate unique, interesting, and educational vocabulary words with clear definitions and helpful example sentences.` 
            },
            { 
              role: 'user', 
              content: `Generate ${count} ${categoryPrompt}. Each word should be somewhat challenging but practical for everyday use.
              
              For each word, provide:
              1. The word itself
              2. A clear, concise definition
              3. A natural example sentence showing how to use it in context
              
              Format your response as a valid JSON array with this exact structure:
              [
                {
                  "word": "example",
                  "definition": "definition here",
                  "example": "example sentence here",
                  "category": "${category}"
                }
              ]
              
              Do not include code blocks, markdown formatting, or any text outside the JSON array. The response must be a plain valid JSON array and nothing else.` 
            }
          ],
          temperature: 0.7,
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
          if (!word.word || !word.definition || !word.example) {
            console.warn('Incomplete word object:', word);
            throw new Error('Invalid word format: missing required fields');
          }
          
          return {
            word: word.word,
            definition: word.definition,
            example: word.example,
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

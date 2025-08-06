
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentRequest {
  word: string;
  definition: string;
  example: string;
}

interface WordEnrichment {
  mnemonic: string;
  synonyms: string[];
  pronunciation: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, definition, example }: EnrichmentRequest = await req.json();
    
    if (!word || !definition) {
      throw new Error('Word and definition are required');
    }

    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      throw new Error("OpenAI API key is not configured");
    }

    console.log(`Enriching vocabulary word: ${word}`);

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
            content: `You are a vocabulary learning assistant that enriches words with educational details. 
            
            For each word, provide:
            1. A creative, memorable mnemonic device (fun phrase or logic to remember the word)
            2. 3-4 relevant synonyms
            3. Phonetic pronunciation using IPA notation
            4. Sentiment classification (positive, neutral, or negative)
            
            Respond ONLY with valid JSON in this exact format:
            {
              "mnemonic": "creative memory device here",
              "synonyms": ["synonym1", "synonym2", "synonym3"],
              "pronunciation": "/phonetic notation/",
              "sentiment": "positive|neutral|negative"
            }` 
          },
          { 
            role: 'user', 
            content: `Enrich this vocabulary word:
            
            Word: ${word}
            Definition: ${definition}
            Example: ${example}
            
            Provide the enrichment details in the specified JSON format.` 
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
    console.log('OpenAI response received');
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response format from OpenAI - no choices returned');
    }
    
    const content = data.choices[0].message.content;
    console.log('OpenAI raw content:', content);
    
    // Parse the JSON response from GPT
    let enrichment: WordEnrichment;
    try {
      // Clean up any markdown code blocks or backticks that might be in the response
      const cleanedContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      enrichment = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (!enrichment.mnemonic || !Array.isArray(enrichment.synonyms) || 
          !enrichment.pronunciation || !enrichment.sentiment) {
        throw new Error('Invalid enrichment format: missing required fields');
      }
      
      // Validate sentiment value
      if (!['positive', 'neutral', 'negative'].includes(enrichment.sentiment)) {
        enrichment.sentiment = 'neutral';
      }
      
      console.log(`Successfully enriched word "${word}"`);
      console.log('Enrichment sample:', JSON.stringify(enrichment));
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw content that failed to parse:', content);
      throw new Error('Failed to parse word enrichment from OpenAI response');
    }

    // Return the enrichment data
    return new Response(JSON.stringify({ 
      enrichment,
      word,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enrich-vocabulary-word function:', error);
    
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

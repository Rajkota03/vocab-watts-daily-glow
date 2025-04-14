import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

// Initialize Resend only if API key is available
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequestBody {
  email: string;
  category: string;
  wordCount?: number;
  force_new_words?: boolean;
}

interface VocabularyWord {
  id?: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  created_at?: string;
}

// Fallback vocabulary words for when the API fails
const fallbackWords = {
  business: [
    { word: "leverage", definition: "Use (something) to maximum advantage", example: "We need to leverage our network to expand into new markets.", category: "business" },
    { word: "scalable", definition: "Able to be changed in size or scale", example: "We need a scalable solution that can grow with our business.", category: "business" },
    { word: "paradigm", definition: "A typical example or pattern of something", example: "This represents a new paradigm in customer service.", category: "business" },
    { word: "synergy", definition: "The interaction of elements that when combined produce a total effect greater than the sum of the individual elements", example: "The merger created synergy between the two companies.", category: "business" },
    { word: "strategic", definition: "Relating to the identification of long-term or overall aims and interests and the means of achieving them", example: "We need to make strategic investments in emerging markets.", category: "business" },
  ],
  exam: [
    { word: "juxtapose", definition: "Place or deal with close together for contrasting effect", example: "The director juxtaposed scenes of wealth and poverty to highlight social inequality.", category: "exam" },
    { word: "ubiquitous", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society.", category: "exam" },
    { word: "ephemeral", definition: "Lasting for a very short time", example: "The ephemeral nature of fame in the digital age concerns many celebrities.", category: "exam" },
    { word: "esoteric", definition: "Intended for or likely to be understood by only a small number of people with specialized knowledge", example: "The professor's lecture contained esoteric terms that confused many students.", category: "exam" },
    { word: "pragmatic", definition: "Dealing with things sensibly and realistically in a way that is based on practical considerations", example: "We need a pragmatic approach to solving this complex problem.", category: "exam" },
  ],
  slang: [
    { word: "ghosting", definition: "Abruptly cutting off all contact with someone", example: "He was ghosting her after their third date.", category: "slang" },
    { word: "slay", definition: "To do something exceptionally well", example: "She absolutely slayed that presentation yesterday.", category: "slang" },
    { word: "cap", definition: "To lie or exaggerate about something", example: "No cap, this is the best pizza I've ever had.", category: "slang" },
    { word: "vibe check", definition: "An assessment of someone's mood or attitude", example: "Just doing a quick vibe check before I ask him for a favor.", category: "slang" },
    { word: "sus", definition: "Suspicious or questionable", example: "That guy looking at our bags seems kinda sus.", category: "slang" },
  ],
  general: [
    { word: "serendipity", definition: "The occurrence and development of events by chance in a happy or beneficial way", example: "It was serendipity that we met at the conference.", category: "general" },
    { word: "eloquent", definition: "Fluent or persuasive in speaking or writing", example: "She gave an eloquent speech that moved the entire audience.", category: "general" },
    { word: "resilience", definition: "The capacity to recover quickly from difficulties; toughness", example: "The resilience of the human spirit never ceases to amaze me.", category: "general" },
    { word: "meticulous", definition: "Showing great attention to detail; very careful and precise", example: "His meticulous planning ensured the event went smoothly.", category: "general" },
    { word: "ambivalent", definition: "Having mixed feelings or contradictory ideas about something or someone", example: "I'm ambivalent about moving to a new city.", category: "general" },
  ]
};

// Add UUIDs to fallback words to ensure they can be tracked in history
for (const category in fallbackWords) {
  fallbackWords[category as keyof typeof fallbackWords].forEach(word => {
    if (!word.id) {
      word.id = crypto.randomUUID();
    }
    if (!word.created_at) {
      word.created_at = new Date().toISOString();
    }
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, category, wordCount = 5, force_new_words = false }: EmailRequestBody = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`Generating ${wordCount} vocabulary words for category: ${category} to send to ${email} (force_new_words: ${force_new_words})`);

    let vocabWords: VocabularyWord[] = [];
    let isUsingFallback = false;

    try {
      // Modify word generation logic to ensure uniqueness
      if (force_new_words) {
        console.log("Forcing generation of new words with OpenAI");
        
        // Fetch the IDs of words already sent in this category
        const { data: sentWordIds } = await supabase
          .from('sent_words')
          .select('word_id')
          .eq('category', category);
        
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
                content: `You are a vocabulary teaching assistant. Generate unique vocabulary words.` 
              },
              { 
                role: 'user', 
                content: `Generate ${wordCount} vocabulary words for the category "${category}". 
                Ensure these words are completely different from the following word IDs: ${sentWordIds?.map(w => w.word_id).join(',')}
                
                For each word, provide:
                1. The word itself
                2. A clear, concise definition
                3. A natural example sentence showing how to use it in context
                
                Do not generate any words that might be similar to previously sent words.` 
              }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the JSON response from GPT
        const parsedWords = JSON.parse(content);
        
        // Add UUIDs to the words to ensure they can be tracked in history
        parsedWords.forEach((word: VocabularyWord) => {
          word.id = crypto.randomUUID();
          word.created_at = new Date().toISOString();
        });
        
        // Insert the words into the database for future use
        const { error: insertError } = await supabase
          .from('vocabulary_words')
          .insert(parsedWords);
          
        if (insertError) {
          console.error('Error inserting words into database:', insertError);
        }
        
        vocabWords = parsedWords;
        console.log(`Successfully generated ${vocabWords.length} words from OpenAI`);
      } else {
        // Original behavior: first try to get existing words from the database
        const { data: existingWords, error: existingWordsError } = await supabase
          .from('vocabulary_words')
          .select('*')
          .eq('category', category)
          .limit(wordCount);
          
        if (existingWordsError) {
          console.error('Error fetching existing words:', existingWordsError);
          throw new Error('Failed to fetch existing words');
        }
        
        if (existingWords && existingWords.length >= wordCount) {
          // Use existing words from the database
          vocabWords = existingWords.slice(0, wordCount);
          console.log(`Using ${vocabWords.length} existing words from the database`);
        } else {
          // Try to get words from OpenAI
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
                  content: `Generate ${wordCount} vocabulary words for the category "${category}". Each word should be somewhat challenging but practical for everyday use.
                  
                  For each word, provide:
                  1. The word itself
                  2. A clear, concise definition
                  3. A natural example sentence showing how to use it in context
      
                  Format your response as a valid JSON array of objects with the properties: "word", "definition", "example", and "category".
                  The category should be "${category}" for all words.
                  Do not include any explanations or text outside the JSON array.` 
                }
              ],
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;
          
          // Parse the JSON response from GPT
          const parsedWords = JSON.parse(content);
          
          // Add UUIDs to the words to ensure they can be tracked in history
          parsedWords.forEach((word: VocabularyWord) => {
            word.id = crypto.randomUUID();
            word.created_at = new Date().toISOString();
          });
          
          // Insert the words into the database for future use
          const { error: insertError } = await supabase
            .from('vocabulary_words')
            .insert(parsedWords);
            
          if (insertError) {
            console.error('Error inserting words into database:', insertError);
          }
          
          vocabWords = parsedWords;
          console.log(`Successfully generated ${vocabWords.length} words from OpenAI`);
        }
      }
    } catch (apiError) {
      console.error('API or database error:', apiError);
      
      // Use fallback words instead
      isUsingFallback = true;
      vocabWords = fallbackWords[category as keyof typeof fallbackWords] || fallbackWords.general;
      
      // Limit to requested word count
      vocabWords = vocabWords.slice(0, wordCount);
      
      console.log(`Using ${vocabWords.length} fallback words for category: ${category}`);
    }

    // Send email using Resend
    try {
      if (!resend) {
        throw new Error('Resend API key is not configured');
      }
      
      const emailResult = await resend.emails.send({
        from: 'VocabSpark <onboarding@resend.dev>',
        to: [email],
        subject: `Your VocabSpark ${category.charAt(0).toUpperCase() + category.slice(1)} Vocabulary Words`,
        html: generateEmailHtml(vocabWords, category, isUsingFallback)
      });

      console.log('Email sent successfully:', emailResult);

      // Check if there was an error in the response
      if (emailResult.error) {
        throw new Error(`Resend API error: ${emailResult.error.message || JSON.stringify(emailResult.error)}`);
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: `Email with ${vocabWords.length} vocabulary words sent to ${email}`,
        words: vocabWords,
        isUsingFallback,
        emailResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Return a more specific error for email sending failures, but still include the words
      // so they can be displayed in the history
      return new Response(JSON.stringify({ 
        success: false,
        error: `Failed to send email: ${emailError.message}`,
        words: vocabWords,
        isUsingFallback
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('Error in send-vocab-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailHtml(words: VocabularyWord[], category: string, isUsingFallback: boolean): string {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  let wordsHtml = '';
  words.forEach((word, index) => {
    wordsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 10px;">
        <h3 style="margin-top: 0; color: #3F3D56; font-size: 18px;">${index + 1}. ${word.word}</h3>
        <p style="margin: 8px 0; color: #555;"><strong>Definition:</strong> ${word.definition}</p>
        <p style="margin: 8px 0; color: #555;"><strong>Example:</strong> <em>${word.example}</em></p>
      </div>
    `;
  });
  
  const fallbackNotice = isUsingFallback ? 
    `<div style="padding: 10px; background-color: #fff9e5; border-left: 4px solid #ffc107; margin-bottom: 20px;">
      <p style="margin: 0; color: #856404;">Note: These are sample vocabulary words provided while we're working on our AI service. They are not personalized.</p>
    </div>` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your Daily VocabSpark Words</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3F3D56; margin-bottom: 10px;">VocabSpark</h1>
        <p style="color: #666; font-size: 16px;">Here are your ${categoryTitle} vocabulary words</p>
      </div>
      
      ${fallbackNotice}
      
      <div style="margin-bottom: 30px;">
        ${wordsHtml}
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
        <p>This is a test email from VocabSpark.</p>
      </div>
    </body>
    </html>
  `;
}

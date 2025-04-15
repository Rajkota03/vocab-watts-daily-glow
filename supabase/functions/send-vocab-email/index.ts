
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
  user_id?: string;
  debug?: boolean;
}

interface VocabularyWord {
  id?: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  created_at?: string;
}

interface DebugInfo {
  openAIAvailable: boolean;
  wordHistoryCount: number;
  databaseWordsCount: number;
  openAIResponse?: any;
  openAIError?: string;
  wordSource: string;
  previouslySentWords?: string[];
  apiKey?: string;
}

// Create a pool of fallback vocabulary words so we can rotate them
const fallbackWordsPool = {
  business: [
    { word: "leverage", definition: "Use (something) to maximum advantage", example: "We need to leverage our network to expand into new markets.", category: "business" },
    { word: "scalable", definition: "Able to be changed in size or scale", example: "We need a scalable solution that can grow with our business.", category: "business" },
    { word: "paradigm", definition: "A typical example or pattern of something", example: "This represents a new paradigm in customer service.", category: "business" },
    { word: "synergy", definition: "The interaction of elements that when combined produce a total effect greater than the sum of the individual elements", example: "The merger created synergy between the two companies.", category: "business" },
    { word: "strategic", definition: "Relating to the identification of long-term or overall aims and interests and the means of achieving them", example: "We need to make strategic investments in emerging markets.", category: "business" },
    { word: "disruptive", definition: "Causing or tending to cause disruption", example: "Their disruptive business model revolutionized the industry.", category: "business" },
    { word: "innovative", definition: "Featuring new methods; advanced and original", example: "We need innovative solutions to stay competitive.", category: "business" },
    { word: "streamline", definition: "Make (an organization or system) more efficient and effective", example: "We need to streamline our operations to reduce costs.", category: "business" },
    { word: "agile", definition: "Able to move quickly and easily; relating to or denoting a method of project management", example: "Our agile development process allows us to respond quickly to market changes.", category: "business" },
    { word: "optimize", definition: "Make the best or most effective use of (a situation, opportunity, or resource)", example: "We need to optimize our resources to maximize profit.", category: "business" }
  ],
  exam: [
    { word: "juxtapose", definition: "Place or deal with close together for contrasting effect", example: "The director juxtaposed scenes of wealth and poverty to highlight social inequality.", category: "exam" },
    { word: "ubiquitous", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society.", category: "exam" },
    { word: "ephemeral", definition: "Lasting for a very short time", example: "The ephemeral nature of fame in the digital age concerns many celebrities.", category: "exam" },
    { word: "esoteric", definition: "Intended for or likely to be understood by only a small number of people with specialized knowledge", example: "The professor's lecture contained esoteric terms that confused many students.", category: "exam" },
    { word: "pragmatic", definition: "Dealing with things sensibly and realistically in a way that is based on practical considerations", example: "We need a pragmatic approach to solving this complex problem.", category: "exam" },
    { word: "loquacious", definition: "Tending to talk a great deal; garrulous", example: "The loquacious presenter made the seminar run over time.", category: "exam" },
    { word: "perfunctory", definition: "Carried out with a minimum of effort or reflection", example: "The inspector gave the building a perfunctory examination.", category: "exam" },
    { word: "circumlocution", definition: "The use of many words where fewer would do", example: "His circumlocution confused rather than clarified the issue.", category: "exam" },
    { word: "pontificate", definition: "Express one's opinions in a pompous or dogmatic way", example: "He was pontificating about the economy without having all the facts.", category: "exam" },
    { word: "sycophant", definition: "A person who acts obsequiously toward someone important in order to gain advantage", example: "The politician surrounded himself with sycophants who never questioned his decisions.", category: "exam" }
  ],
  slang: [
    { word: "ghosting", definition: "Abruptly cutting off all contact with someone", example: "He was ghosting her after their third date.", category: "slang" },
    { word: "slay", definition: "To do something exceptionally well", example: "She absolutely slayed that presentation yesterday.", category: "slang" },
    { word: "cap", definition: "To lie or exaggerate about something", example: "No cap, this is the best pizza I've ever had.", category: "slang" },
    { word: "vibe check", definition: "An assessment of someone's mood or attitude", example: "Just doing a quick vibe check before I ask him for a favor.", category: "slang" },
    { word: "sus", definition: "Suspicious or questionable", example: "That guy looking at our bags seems kinda sus.", category: "slang" },
    { word: "low-key", definition: "Somewhat or secretly", example: "I'm low-key excited about the concert tomorrow.", category: "slang" },
    { word: "high-key", definition: "Very obviously or openly", example: "I'm high-key obsessed with this new song.", category: "slang" },
    { word: "clout", definition: "Influence or power, especially in social media", example: "He's just doing it for the clout.", category: "slang" },
    { word: "flex", definition: "To show off or boast about something", example: "She's always flexing her new car on Instagram.", category: "slang" },
    { word: "stan", definition: "To be an overly enthusiastic and devoted fan", example: "I stan that artist so much, I have all their albums.", category: "slang" }
  ],
  general: [
    { word: "serendipity", definition: "The occurrence and development of events by chance in a happy or beneficial way", example: "It was serendipity that we met at the conference.", category: "general" },
    { word: "eloquent", definition: "Fluent or persuasive in speaking or writing", example: "She gave an eloquent speech that moved the entire audience.", category: "general" },
    { word: "resilience", definition: "The capacity to recover quickly from difficulties; toughness", example: "The resilience of the human spirit never ceases to amaze me.", category: "general" },
    { word: "meticulous", definition: "Showing great attention to detail; very careful and precise", example: "His meticulous planning ensured the event went smoothly.", category: "general" },
    { word: "ambivalent", definition: "Having mixed feelings or contradictory ideas about something or someone", example: "I'm ambivalent about moving to a new city.", category: "general" },
    { word: "quintessential", definition: "Representing the most perfect or typical example of a quality or class", example: "This restaurant offers the quintessential Italian dining experience.", category: "general" },
    { word: "mellifluous", definition: "Sweet or musical; pleasant to hear", example: "She has a mellifluous voice that captivates listeners.", category: "general" },
    { word: "cacophony", definition: "A harsh, discordant mixture of sounds", example: "The cacophony of the construction site made it difficult to concentrate.", category: "general" },
    { word: "perspicacious", definition: "Having a ready insight into and understanding of things", example: "Her perspicacious analysis identified the root of the problem.", category: "general" },
    { word: "sanguine", definition: "Optimistic or positive, especially in an apparently bad or difficult situation", example: "Despite the challenges, he remained sanguine about the project's success.", category: "general" }
  ]
};

// Add UUIDs to fallback words to ensure they can be tracked in history
for (const category in fallbackWordsPool) {
  fallbackWordsPool[category as keyof typeof fallbackWordsPool].forEach(word => {
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
    const { email, category, wordCount = 5, force_new_words = false, user_id, debug = false }: EmailRequestBody = await req.json();
    
    const debugInfo: DebugInfo = {
      openAIAvailable: !!openAIApiKey,
      wordHistoryCount: 0,
      databaseWordsCount: 0,
      wordSource: 'unknown',
      apiKey: openAIApiKey ? `${openAIApiKey.substring(0, 3)}...${openAIApiKey.substring(openAIApiKey.length - 3)}` : 'not set'
    };
    
    if (!email) {
      throw new Error('Email is required');
    }

    // Validate user_id
    const currentUserId = user_id || (await (await supabase.auth.getSession()).data.session?.user?.id);
    if (!currentUserId) {
      throw new Error('User ID is required for word history tracking');
    }

    console.log(`Generating ${wordCount} vocabulary words for category: ${category} to send to ${email} (force_new_words: ${force_new_words})`);

    let vocabWords: VocabularyWord[] = [];
    let isUsingFallback = false;
    let wordSource = 'database'; // Track the source of words for history

    try {
      // STEP 1: Check Word History for this user
      console.log("Step 1: Checking word history for user", currentUserId);
      const { data: userWordHistory, error: historyError } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('user_id', currentUserId)
        .eq('category', category);
      
      if (historyError) {
        console.error("Error fetching user word history:", historyError);
        throw historyError;
      }
      
      const previousWords = userWordHistory?.map(entry => entry.word) || [];
      debugInfo.wordHistoryCount = previousWords.length;
      debugInfo.previouslySentWords = previousWords;
      
      console.log(`Found ${previousWords.length} previously sent words for this user`);
      
      // STEP 2: Try fetching from vocabulary_words Table (if not forcing new words)
      if (!force_new_words) {
        console.log("Step 2: Fetching words from vocabulary_words table not in user history");
        let query = supabase
          .from('vocabulary_words')
          .select('*')
          .eq('category', category)
          .limit(wordCount);
        
        // Exclude previously sent words if any exist
        if (previousWords.length > 0) {
          query = query.not('word', 'in', `(${previousWords.map(w => `'${w.replace(/'/g, "''")}'`).join(',')})`);
        }
        
        const { data: existingWords, error: existingWordsError } = await query;
        
        if (existingWordsError) {
          console.error("Error fetching words from vocabulary_words:", existingWordsError);
          throw existingWordsError;
        }
        
        if (existingWords) {
          debugInfo.databaseWordsCount = existingWords.length;
        }
        
        if (existingWords && existingWords.length >= wordCount) {
          // Use existing words from the database
          vocabWords = existingWords.slice(0, wordCount);
          wordSource = 'database';
          debugInfo.wordSource = 'database';
          console.log(`Using ${vocabWords.length} existing words from the database`);
        }
      }
      
      // STEP 3: If not enough words or force_new_words is true, Call OpenAI
      if (vocabWords.length < wordCount || force_new_words) {
        console.log("Step 3: Generating new words with OpenAI");
        
        // Check if OpenAI API key is available
        if (!openAIApiKey) {
          console.error("OpenAI API key is not configured");
          debugInfo.openAIError = "OpenAI API key is not configured";
          throw new Error("OpenAI API key is not configured");
        }
        
        wordSource = 'openai';
        debugInfo.wordSource = 'openai';
        
        // Calculate how many new words we need
        const newWordsNeeded = force_new_words ? wordCount : (wordCount - vocabWords.length);
        
        // Create the list of words to avoid
        const wordsToAvoid = previousWords.join(', ');
        
        // Call OpenAI to generate new words
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
                  content: `You are a vocabulary teaching assistant. Generate unique vocabulary words.` 
                },
                { 
                  role: 'user', 
                  content: `Generate ${newWordsNeeded} vocabulary words for the category "${category}".
                  
                  ${previousWords.length > 0 ? `IMPORTANT: Avoid using these words that the user has already seen: [${wordsToAvoid}]` : ''}
                  
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
            const errorText = await response.text();
            console.error(`OpenAI API error (${response.status}):`, errorText);
            debugInfo.openAIError = `Status ${response.status}: ${errorText}`;
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          debugInfo.openAIResponse = data;
          
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
          
          // Combine with any existing words if we're not forcing all new words
          if (force_new_words) {
            vocabWords = parsedWords;
          } else {
            vocabWords = [...vocabWords, ...parsedWords].slice(0, wordCount);
          }
          
          console.log(`Successfully generated ${parsedWords.length} words from OpenAI`);
        } catch (openAIError) {
          console.error('OpenAI API error:', openAIError);
          if (!debugInfo.openAIError) {
            debugInfo.openAIError = openAIError.message || 'Unknown OpenAI error';
          }
          throw openAIError;
        }
      }
    } catch (apiError) {
      console.error('API or database error:', apiError);
      
      // Use fallback words instead but avoid previously sent words
      isUsingFallback = true;
      wordSource = 'fallback';
      debugInfo.wordSource = 'fallback';
      
      // Get available fallback words for the category
      let availableFallbackWords = fallbackWordsPool[category as keyof typeof fallbackWordsPool] || fallbackWordsPool.general;
      
      // Check user history to avoid sending the same words again
      try {
        const { data: userWordHistory } = await supabase
          .from('user_word_history')
          .select('word')
          .eq('user_id', currentUserId)
          .eq('category', category);
        
        const previousWords = userWordHistory?.map(entry => entry.word) || [];
        
        // Filter out words that have already been sent to this user
        if (previousWords.length > 0) {
          const beforeFilter = availableFallbackWords.length;
          availableFallbackWords = availableFallbackWords.filter(word => 
            !previousWords.includes(word.word)
          );
          console.log(`Filtered fallback words: ${beforeFilter} -> ${availableFallbackWords.length}`);
        }
        
        // If we've used all fallback words, reset with some randomness by shuffling
        if (availableFallbackWords.length < wordCount) {
          console.log("All fallback words have been used, adding some shuffled ones");
          // Shuffle the full array to get random words
          const allFallbacks = [...fallbackWordsPool[category as keyof typeof fallbackWordsPool] || fallbackWordsPool.general];
          for (let i = allFallbacks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allFallbacks[i], allFallbacks[j]] = [allFallbacks[j], allFallbacks[i]];
          }
          
          // Use the shuffled array but give each word a new ID to track separately
          const shuffledWords = allFallbacks.slice(0, wordCount).map(word => ({
            ...word,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          }));
          
          availableFallbackWords = shuffledWords;
        }
      } catch (historyError) {
        console.error("Error checking user history for fallback words:", historyError);
        // If we can't check history, just shuffle the fallback words to add randomness
        availableFallbackWords = [...availableFallbackWords]
          .sort(() => Math.random() - 0.5)
          .slice(0, wordCount);
      }
      
      // Limit to requested word count
      vocabWords = availableFallbackWords.slice(0, wordCount);
      
      console.log(`Using ${vocabWords.length} fallback words for category: ${category}`);
    }

    // STEP 4: Log Final Sent Words to user_word_history
    try {
      console.log("Step 4: Logging sent words to user_word_history");
      const historyEntries = vocabWords.map(word => ({
        user_id: currentUserId,
        word: word.word,
        date_sent: new Date().toISOString(),
        category: category,
        source: wordSource,
        word_id: word.id
      }));
      
      const { error: historyError } = await supabase
        .from('user_word_history')
        .insert(historyEntries);
        
      if (historyError) {
        console.error('Error logging words to user history:', historyError);
      } else {
        console.log(`Successfully logged ${vocabWords.length} words to user history`);
      }
    } catch (historyError) {
      console.error('Error in word history logging:', historyError);
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

      // Return response with limited debug info if requested
      return new Response(JSON.stringify({ 
        success: true,
        message: `Email with ${vocabWords.length} vocabulary words sent to ${email}`,
        words: vocabWords,
        isUsingFallback,
        wordSource,
        emailResult,
        debugInfo: debug ? debugInfo : undefined
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
        isUsingFallback,
        wordSource,
        debugInfo: debug ? debugInfo : undefined
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
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

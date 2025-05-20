
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Content-Type': 'application/json'
};

// Define the expected response format
interface WordsResponse {
  nickname: string;
  words: string[];
  defs: string[];
  examples: string[];
}

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to handle requests
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    });
  }
  
  try {
    // Parse URL and get userId parameter
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const apiKey = req.headers.get("x-api-key");
    
    // Simple API key validation - you can set this as a secret in Supabase
    const validApiKey = Deno.env.get("WORDS_API_KEY");
    if (!apiKey || apiKey !== validApiKey) {
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid API key" }), {
        status: 401,
        headers: corsHeaders
      });
    }
    
    // Check if userId is provided
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId parameter" }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Get the user's profile to retrieve nickname
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("nick_name, first_name")
      .eq("id", userId)
      .single();
      
    if (profileError || !profileData) {
      console.error("Error fetching user profile:", profileError);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    // Get user subscription to determine category and check if active
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("category")
      .eq("user_id", userId)
      .single();
      
    if (subscriptionError || !subscriptionData) {
      console.error("Error fetching subscription:", subscriptionError);
      return new Response(JSON.stringify({ error: "User subscription not found" }), {
        status: 404,
        headers: corsHeaders
      });
    }
    
    const category = subscriptionData.category || "daily-beginner";
    
    // Get words for the user that were sent today or fetch new ones
    // First try to get recently sent words from sent_words table
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: sentWordsData, error: sentWordsError } = await supabase
      .from("sent_words")
      .select("word_id")
      .eq("user_id", userId)
      .eq("category", category)
      .gte("sent_at", today.toISOString())
      .order("sent_at", { ascending: false })
      .limit(5);
    
    let wordIds: string[] = [];
    
    if (sentWordsError || !sentWordsData || sentWordsData.length < 1) {
      console.log("No sent words found today, fetching vocabulary words directly");
      
      // Fetch 5 words directly from vocabulary_words table
      const { data: wordsData, error: wordsError } = await supabase
        .from("vocabulary_words")
        .select("id")
        .eq("category", category)
        .limit(5);
        
      if (wordsError || !wordsData || wordsData.length < 1) {
        return new Response(JSON.stringify({ error: "No vocabulary words found" }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      wordIds = wordsData.map(word => word.id);
    } else {
      // Use word IDs from sent_words
      wordIds = sentWordsData.map(sw => sw.word_id);
    }
    
    // Fetch the complete word details
    const { data: vocabularyData, error: vocabularyError } = await supabase
      .from("vocabulary_words")
      .select("word, definition, example")
      .in("id", wordIds);
      
    if (vocabularyError || !vocabularyData || vocabularyData.length < 1) {
      return new Response(JSON.stringify({ error: "Error fetching vocabulary details" }), {
        status: 500,
        headers: corsHeaders
      });
    }
    
    // Format the response according to the required structure
    const response: WordsResponse = {
      nickname: profileData.nick_name || profileData.first_name || "User",
      words: vocabularyData.map(item => item.word),
      defs: vocabularyData.map(item => item.definition),
      examples: vocabularyData.map(item => item.example)
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

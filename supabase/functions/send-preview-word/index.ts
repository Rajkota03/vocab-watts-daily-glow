import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreviewWordRequest {
  phoneNumber: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber }: PreviewWordRequest = await req.json();

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Format phone number (add +91 if no country code)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    console.log('Processing preview word request for:', formattedPhone);

    // Check rate limiting - prevent same number from requesting within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingRequest } = await supabase
      .from('preview_word_requests')
      .select('id')
      .eq('phone_number', formattedPhone)
      .gte('created_at', oneDayAgo)
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          error: 'You can only request one preview word per day. Please try again tomorrow.' 
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get a random starter word
    const { data: starterWords, error: wordsError } = await supabase
      .from('starter_words')
      .select('*')
      .eq('is_active', true);

    if (wordsError) {
      console.error('Error fetching starter words:', wordsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch vocabulary words' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!starterWords || starterWords.length === 0) {
      console.error('No active starter words found');
      return new Response(
        JSON.stringify({ error: 'No vocabulary words available' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Select random word
    const randomWord = starterWords[Math.floor(Math.random() * starterWords.length)];
    
    // Determine emoji based on word category (sentiment)
    const emoji = randomWord.category === 'challenging' ? '🟥' : '🟩';
    
    // Format the message according to the template
    const message = `Hi there,
Here is your requested content:

*Word:* ${randomWord.word} ${emoji} (${randomWord.part_of_speech || 'word'})
*Pronunciation:* ${randomWord.pronunciation}
*Meaning:* ${randomWord.definition}
*Example:* ${randomWord.example}
*Memory Hook:* ${randomWord.memory_hook}

— Glintup`;

    console.log('Sending word:', randomWord.word, 'to phone:', formattedPhone);

    // Send WhatsApp message using existing function
    const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        phoneNumber: formattedPhone,
        message: message,
        userId: null // No user ID for preview requests
      }
    });

    if (whatsappError) {
      console.error('WhatsApp sending error:', whatsappError);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Log the request for rate limiting
    const { error: logError } = await supabase
      .from('preview_word_requests')
      .insert({
        phone_number: formattedPhone,
        word_sent: randomWord.word
      });

    if (logError) {
      console.error('Error logging preview request:', logError);
      // Don't fail the request if logging fails
    }

    console.log('Preview word sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Word sent successfully!',
        word: randomWord.word 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in send-preview-word function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
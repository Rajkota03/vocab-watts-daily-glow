import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, phoneNumber, category } = body;

    if (!userId || !phoneNumber || !category) {
      return new Response(
        JSON.stringify({ error: 'userId, phoneNumber, and category are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Scheduling today's words for user ${userId}`);

    // Get user delivery settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_delivery_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError);
      throw settingsError;
    }

    if (!settings) {
      return new Response(
        JSON.stringify({ error: 'User delivery settings not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get schedule times
    let times: string[];
    
    if (settings.mode === 'custom') {
      const { data: customTimes, error: timesError } = await supabase
        .from('user_custom_times')
        .select('time')
        .eq('user_id', userId)
        .order('position');

      if (timesError) {
        throw timesError;
      }

      times = customTimes?.map(ct => ct.time) || [];
    } else {
      times = generateAutoTimes(settings.words_per_day);
    }

    // Get today's words for the category
    const words = await getTodaysWords(userId, category, settings.words_per_day);

    if (words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No words available for today' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create outbox messages for today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const outboxMessages = [];

    for (let i = 0; i < Math.min(words.length, settings.words_per_day, times.length); i++) {
      const word = words[i];
      const time = times[i];
      const sendAt = new Date(`${today}T${time}:00`);

      // Convert to user's timezone
      const sendAtUTC = new Date(sendAt.getTime());

      outboxMessages.push({
        user_id: userId,
        phone: phoneNumber,
        send_at: sendAtUTC.toISOString(),
        template: 'glintup_vocab_fulfilment',
        variables: {
          word: word.word,
          definition: word.definition,
          example: word.example,
          category: category,
          position: i + 1,
          totalWords: Math.min(words.length, settings.words_per_day)
        }
      });
    }

    // Insert outbox messages
    const { data: insertedMessages, error: insertError } = await supabase
      .from('outbox_messages')
      .insert(outboxMessages)
      .select();

    if (insertError) {
      console.error('Error inserting outbox messages:', insertError);
      throw insertError;
    }

    console.log(`Successfully scheduled ${insertedMessages?.length || 0} messages for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        scheduledMessages: insertedMessages?.length || 0,
        schedule: outboxMessages.map(msg => ({
          time: msg.send_at,
          word: msg.variables.word
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in schedule-today:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateAutoTimes(wordCount: number): string[] {
  const start = 9; // 9 AM
  const end = 21; // 9 PM
  const interval = (end - start) / Math.max(1, wordCount - 1);
  
  return Array.from({ length: wordCount }, (_, i) => {
    const hour = Math.round(start + (i * interval));
    return `${hour.toString().padStart(2, '0')}:00`;
  });
}

async function getTodaysWords(userId: string, category: string, count: number) {
  // Get words that haven't been sent to this user yet
  const { data: words, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('category', category)
    .not('id', 'in', `(
      SELECT word_id FROM sent_words 
      WHERE user_id = '${userId}' 
      AND category = '${category}'
    )`)
    .limit(count);

  if (error) {
    console.error('Error fetching words:', error);
    return [];
  }

  return words || [];
}
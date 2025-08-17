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

    // Clear any existing scheduled messages for today before creating new ones
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Clearing existing messages for user ${userId} on ${today}`);
    const { error: deleteError } = await supabase
      .from('outbox_messages')
      .delete()
      .eq('user_id', userId)
      .gte('send_at', `${today}T00:00:00.000Z`)
      .lt('send_at', `${today}T23:59:59.999Z`);

    if (deleteError) {
      console.error('Error clearing existing messages:', deleteError);
    }

    // Create outbox messages for today
    const outboxMessages = [];

    for (let i = 0; i < Math.min(words.length, settings.words_per_day, times.length); i++) {
      const word = words[i];
      const time = times[i];
      
      console.log(`Processing word ${i + 1}: ${word.word}, time: ${time}`);
      
      // Ensure time is in HH:MM format and handle both HH:MM and HH:MM:SS formats
      let timeFormatted = time;
      if (time.includes(':')) {
        // If it's already in time format, ensure it's HH:MM
        const timeParts = time.split(':');
        timeFormatted = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
      } else {
        timeFormatted = `${time.padStart(2, '0')}:00`;
      }
      
      console.log(`Formatted time: ${timeFormatted}`);
      
      try {
        // Convert IST to UTC: IST is UTC+5:30, so to get UTC we subtract 5.5 hours
        const [hours, minutes] = timeFormatted.split(':').map(Number);
        
        // Create date in UTC by subtracting IST offset (5.5 hours)
        const istDate = new Date(`${today}T${timeFormatted}:00`);
        const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
        
        if (isNaN(utcDate.getTime())) {
          console.error(`Invalid date created for time: ${timeFormatted}`);
          continue;
        }
        
        console.log(`Created valid date: ${utcDate.toISOString()} (IST: ${timeFormatted})`);
        const sendAtUTC = utcDate;

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
            totalWords: Math.min(words.length, settings.words_per_day),
            word_id: word.id
          }
        });
        
        console.log(`Added message for word: ${word.word} at ${sendAtUTC.toISOString()}`);
      } catch (dateError) {
        console.error(`Error creating date for time ${timeFormatted}:`, dateError);
        continue;
      }
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
  // Fixed timing schedule based on user preference
  const schedules = {
    1: ['09:00'],
    2: ['09:00', '12:00'],
    3: ['09:00', '12:00', '15:00'],
    4: ['09:00', '12:00', '15:00', '18:00'],
    5: ['09:00', '11:30', '14:00', '16:30', '19:00']
  };
  
  return schedules[wordCount as keyof typeof schedules] || schedules[3];
}

async function getTodaysWords(userId: string, category: string, count: number) {
  console.log(`Getting words for category: ${category}, user: ${userId}, count: ${count}`);
  
  // First try to get words from vocabulary_words table with exact category match
  let { data: words, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('category', category)
    .limit(count);

  if (error) {
    console.error('Error fetching words:', error);
  }

  // If no words found, try to generate them using the whatsapp-send function
  if (!words || words.length === 0) {
    console.log(`No words found in database for category ${category}, trying to generate new words`);
    
    try {
      const { data: generatedWords, error: generateError } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'generate_words_only',
          category: category,
          count: count
        }
      });

      if (generateError) {
        console.error('Error generating words:', generateError);
        return [];
      }

      if (generatedWords?.words) {
        console.log(`Generated ${generatedWords.words.length} words`);
        return generatedWords.words;
      }
    } catch (generateError) {
      console.error('Error calling word generation:', generateError);
    }
  }

  console.log(`Returning ${words?.length || 0} words`);
  return words || [];
}
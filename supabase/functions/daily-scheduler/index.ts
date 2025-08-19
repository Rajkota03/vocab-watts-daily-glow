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
    console.log('Daily scheduler started');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Scheduling words for date: ${today}`);

    // Get all active subscriptions (trial or pro)
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .or(`trial_ends_at.gte.${now.toISOString()},subscription_ends_at.gte.${now.toISOString()},and(is_pro.eq.true,subscription_ends_at.is.null)`);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    const results = [];

    for (const subscription of subscriptions || []) {
      try {
        // Check if already scheduled for today
        const { data: existingSchedule } = await supabase
          .from('outbox_messages')
          .select('id')
          .eq('user_id', subscription.user_id || 'no_user')
          .eq('phone', subscription.phone_number)
          .gte('send_at', `${today}T00:00:00.000Z`)
          .lt('send_at', `${today}T23:59:59.999Z`)
          .limit(1);

        if (existingSchedule && existingSchedule.length > 0) {
          console.log(`Already scheduled for subscription ${subscription.id}`);
          continue;
        }

        // Get user delivery settings or create default
        let { data: settings } = await supabase
          .from('user_delivery_settings')
          .select('*')
          .eq('user_id', subscription.user_id)
          .single();

        if (!settings && subscription.user_id) {
          // Create default settings
          const { data: newSettings } = await supabase
            .from('user_delivery_settings')
            .insert({
              user_id: subscription.user_id,
              mode: 'auto',
              words_per_day: 3,
              timezone: 'Asia/Kolkata',
              auto_window_start: '09:00:00',
              auto_window_end: '21:00:00'
            })
            .select()
            .single();
          settings = newSettings;
        }

        // Use delivery_time from subscription if no user settings
        const wordsPerDay = settings?.words_per_day || 3;
        const deliveryTimes = generateDeliveryTimes(subscription.delivery_time, wordsPerDay);

        console.log(`Scheduling ${wordsPerDay} words for ${subscription.phone_number} at times:`, deliveryTimes);

        // Get words for the category
        const words = await getWordsForCategory(subscription.category || 'general', wordsPerDay, subscription.phone_number);

        if (words.length === 0) {
          console.log(`No words available for category ${subscription.category} for ${subscription.phone_number}`);
          continue;
        }

        // Create outbox messages for each delivery time
        const outboxMessages = [];
        
        for (let i = 0; i < Math.min(words.length, deliveryTimes.length); i++) {
          const word = words[i];
          const time = deliveryTimes[i];
          
          // Convert IST to UTC
          const [hours, minutes] = time.split(':').map(Number);
          const istDate = new Date(`${today}T${time}:00`);
          const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
          
          outboxMessages.push({
            user_id: subscription.user_id || null,
            phone: subscription.phone_number,
            send_at: utcDate.toISOString(),
            template: 'glintup_vocab_fulfilment',
            variables: {
              word: word.word,
              definition: word.definition,
              example: word.example,
              pronunciation: word.pronunciation || '',
              part_of_speech: word.part_of_speech || 'Unknown',
              memory_hook: word.memory_hook || 'Remember this word!',
              category: subscription.category || 'general',
              position: i + 1,
              totalWords: Math.min(words.length, deliveryTimes.length),
              word_id: word.id,
              firstName: subscription.first_name || 'Friend'
            }
          });
        }

        // Insert outbox messages
        const { data: insertedMessages, error: insertError } = await supabase
          .from('outbox_messages')
          .insert(outboxMessages);

        if (insertError) {
          console.error(`Error inserting messages for ${subscription.phone_number}:`, insertError);
          results.push({
            subscriptionId: subscription.id,
            phone: subscription.phone_number,
            status: 'failed',
            error: insertError.message
          });
          continue;
        }

        console.log(`Scheduled ${outboxMessages.length} messages for ${subscription.phone_number}`);
        
        results.push({
          subscriptionId: subscription.id,
          phone: subscription.phone_number,
          status: 'scheduled',
          messagesCount: outboxMessages.length,
          deliveryTimes: deliveryTimes,
          words: words.map(w => w.word)
        });

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        results.push({
          subscriptionId: subscription.id,
          phone: subscription.phone_number,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        processedSubscriptions: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in daily-scheduler:', error);
    return new Response(
      JSON.stringify({
        success: false,
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

function generateDeliveryTimes(preferredTime: string | null, wordsPerDay: number): string[] {
  // If user has a preferred time, use it as base
  if (preferredTime && preferredTime.includes(':')) {
    const baseTime = preferredTime;
    
    if (wordsPerDay === 1) {
      return [baseTime];
    } else if (wordsPerDay === 2) {
      return [baseTime, addHours(baseTime, 6)];
    } else if (wordsPerDay === 3) {
      return [baseTime, addHours(baseTime, 4), addHours(baseTime, 8)];
    } else if (wordsPerDay === 4) {
      return [baseTime, addHours(baseTime, 3), addHours(baseTime, 6), addHours(baseTime, 9)];
    } else {
      return [baseTime, addHours(baseTime, 2), addHours(baseTime, 4), addHours(baseTime, 6), addHours(baseTime, 8)];
    }
  }
  
  // Default schedule
  const schedules = {
    1: ['10:00'],
    2: ['10:00', '16:00'],
    3: ['10:00', '14:00', '18:00'],
    4: ['09:00', '12:00', '15:00', '18:00'],
    5: ['09:00', '11:30', '14:00', '16:30', '19:00']
  };
  
  return schedules[wordsPerDay as keyof typeof schedules] || schedules[3];
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newHour = (h + hours) % 24;
  return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

async function getWordsForCategory(category: string, count: number, phoneNumber: string) {
  console.log(`Getting ${count} words for category: ${category}`);
  
  // Get words that haven't been sent to this phone number recently (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentWords } = await supabase
    .from('user_word_history')
    .select('word')
    .eq('category', category)
    .gte('date_sent', thirtyDaysAgo.toISOString());

  const recentWordsSet = new Set(recentWords?.map(w => w.word) || []);

  // Try to get words from vocabulary_words table
  let { data: words, error } = await supabase
    .from('vocabulary_words')
    .select('*')
    .eq('category', category)
    .limit(count * 3); // Get more to filter out recent ones

  if (error) {
    console.error('Error fetching words:', error);
    return [];
  }

  // Filter out recently sent words
  const filteredWords = words?.filter(word => !recentWordsSet.has(word.word)) || [];
  
  // If we don't have enough words, generate new ones
  if (filteredWords.length < count) {
    console.log(`Only ${filteredWords.length} unused words found, generating new ones`);
    
    try {
      const { data: generatedWords } = await supabase.functions.invoke('generate-vocab-words', {
        body: {
          category: category,
          count: count - filteredWords.length
        }
      });

      if (generatedWords?.words) {
        filteredWords.push(...generatedWords.words);
      }
    } catch (generateError) {
      console.error('Error generating words:', generateError);
    }
  }

  return filteredWords.slice(0, count);
}
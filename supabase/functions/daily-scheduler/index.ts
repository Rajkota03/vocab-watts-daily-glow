import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

async function sendAdminNotification(results: any[], today: string, totalSubscriptions: number) {
  try {
    const successfulSchedules = results.filter(r => r.status === 'scheduled').length;
    const partialSchedules = results.filter(r => r.status === 'partial').length;
    const failedSchedules = results.filter(r => r.status === 'failed').length;
    const totalMessages = results.reduce((sum, r) => sum + (r.messagesCount || 0), 0);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">GlintUp Daily Scheduler Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Date: ${today}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 5px 0; color: #28a745; font-size: 24px;">${successfulSchedules}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">Successful</p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 5px 0; color: #dc3545; font-size: 24px;">${failedSchedules}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">Failed</p>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #333;">Summary</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Total Active Subscriptions: ${totalSubscriptions}</li>
              <li>Successfully Scheduled: ${successfulSchedules}</li>
              <li>Partially Scheduled: ${partialSchedules}</li>
              <li>Failed: ${failedSchedules}</li>
              <li>Total Messages Scheduled: ${totalMessages}</li>
            </ul>
          </div>
          
          ${failedSchedules > 0 ? `
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #856404;">Failed Schedules</h3>
            ${results.filter(r => r.status === 'failed').map(r => `
              <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 4px;">
                <strong>Phone:</strong> ${r.phone}<br>
                <strong>Error:</strong> ${r.error}
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        
        <div style="background: #667eea; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from GlintUp Daily Scheduler</p>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'GlintUp System <noreply@glintup.com>',
      to: ['admin@glintup.com'],
      subject: `Daily Scheduler Report - ${today} (${successfulSchedules}/${totalSubscriptions} successful)`,
      html: emailHtml,
    });

    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Daily scheduler started');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`Scheduling words for date: ${today}`);

    // Get all active subscriptions (trial or pro) with valid user_id
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .not('user_id', 'is', null)  // Only include subscriptions with valid user_id
      .or(`trial_ends_at.gte.${now.toISOString()},subscription_ends_at.gte.${now.toISOString()},and(is_pro.eq.true,subscription_ends_at.is.null)`);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);

    const results = [];
    let processedCount = 0;
    let skippedCount = 0;

    for (const subscription of subscriptions || []) {
      try {
        // Skip if no valid user_id (this should be filtered out above, but double-check)
        if (!subscription.user_id) {
          console.log(`Skipping subscription ${subscription.id} - no user_id`);
          skippedCount++;
          continue;
        }
        // Check if already scheduled for today
        const { data: existingSchedule } = await supabase
          .from('outbox_messages')
          .select('id')
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
          .maybeSingle();

        if (!settings && subscription.user_id) {
          console.log(`Creating default delivery settings for user ${subscription.user_id}`);
          // Create default settings
          const { data: newSettings, error: createError } = await supabase
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
            
          if (createError) {
            console.error(`Error creating delivery settings for user ${subscription.user_id}:`, createError);
            results.push({
              subscriptionId: subscription.id,
              phone: subscription.phone_number,
              status: 'failed',
              error: 'Failed to create delivery settings'
            });
            skippedCount++;
            continue;
          }
          settings = newSettings;
        }

        // Get delivery times based on mode
        let deliveryTimes: string[];
        let wordsPerDay: number;
        
        if (settings?.mode === 'custom') {
          // Get custom times for this user
          const { data: customTimes } = await supabase
            .from('user_custom_times')
            .select('time')
            .eq('user_id', subscription.user_id)
            .order('position');
          
          if (customTimes && customTimes.length > 0) {
            deliveryTimes = customTimes.map(ct => ct.time);
            wordsPerDay = customTimes.length;
          } else {
            // Fallback to auto mode if no custom times found
            wordsPerDay = settings.words_per_day || 3;
            deliveryTimes = generateDeliveryTimes(subscription.delivery_time, wordsPerDay);
          }
        } else {
          // Auto mode
          wordsPerDay = settings?.words_per_day || 3;
          deliveryTimes = generateDeliveryTimes(subscription.delivery_time, wordsPerDay);
        }

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
          
          // Generate a proper UUID if user_id is missing
          const messageUserId = subscription.user_id || crypto.randomUUID();
          
          outboxMessages.push({
            user_id: messageUserId,
            phone: subscription.phone_number,
            send_at: utcDate.toISOString(),
            template: 'glintup_vocab_fulfilment',
            scheduler_source: 'daily-scheduler',
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

        // Insert outbox messages one by one to handle conflicts better
        let successfulInserts = 0;
        let insertError = null;
        
        for (const message of outboxMessages) {
          const { error: singleInsertError } = await supabase
            .from('outbox_messages')
            .insert(message);
            
          if (singleInsertError) {
            console.error(`Error inserting single message for ${subscription.phone_number} at ${message.send_at}:`, singleInsertError);
            insertError = singleInsertError;
          } else {
            successfulInserts++;
          }
        }

        if (insertError && successfulInserts === 0) {
          console.error(`Error inserting all messages for ${subscription.phone_number}:`, insertError);
          results.push({
            subscriptionId: subscription.id,
            phone: subscription.phone_number,
            status: 'failed',
            error: insertError.message
          });
          continue;
        }

        console.log(`Scheduled ${successfulInserts}/${outboxMessages.length} messages for ${subscription.phone_number}`);
        
        results.push({
          subscriptionId: subscription.id,
          phone: subscription.phone_number,
          status: successfulInserts === outboxMessages.length ? 'scheduled' : 'partial',
          messagesCount: successfulInserts,
          totalAttempted: outboxMessages.length,
          deliveryTimes: deliveryTimes,
          words: words.map(w => w.word)
        });
        
        processedCount++;

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        results.push({
          subscriptionId: subscription.id,
          phone: subscription.phone_number,
          status: 'failed',
          error: error.message
        });
        skippedCount++;
      }
    }

    console.log(`Processing complete: ${processedCount} processed, ${skippedCount} skipped`);
    
    // Alert if significantly fewer messages were scheduled than expected
    const successfullyScheduled = results.filter(r => r.status === 'scheduled').length;
    if (successfullyScheduled < (subscriptions?.length || 0) * 0.8) {
      console.warn(`WARNING: Only ${successfullyScheduled}/${subscriptions?.length || 0} subscriptions were successfully scheduled!`);
    }

    // Send admin notification email
    await sendAdminNotification(results, today, subscriptions?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        total_subscriptions: subscriptions?.length || 0,
        processed_count: processedCount,
        skipped_count: skippedCount,
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
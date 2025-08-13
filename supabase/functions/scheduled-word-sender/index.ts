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
    console.log('Scheduled word sender started');
    
    // Get current time in format HH:MM
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD format
    
    console.log(`Looking for scheduled sends at ${currentTime} on ${currentDate}`);

    // Find all users with scheduled delivery enabled and matching time slots
    const { data: schedules, error: scheduleError } = await supabase
      .from('word_schedules')
      .select(`
        *,
        profiles!inner(
          whatsapp_number,
          first_name
        ),
        user_subscriptions!inner(
          category,
          phone_number,
          is_pro
        )
      `)
      .eq('is_scheduled', true);

    if (scheduleError) {
      console.error('Error fetching schedules:', scheduleError);
      throw scheduleError;
    }

    console.log(`Found ${schedules?.length || 0} users with scheduled delivery`);

    const results = [];

    for (const schedule of schedules || []) {
      const scheduleTimes = Array.isArray(schedule.schedule_times) 
        ? schedule.schedule_times.filter(time => typeof time === 'string') as string[]
        : [];
      
      // Check if current time matches any of their scheduled times
      const timeIndex = scheduleTimes.findIndex(time => time === currentTime);
      
      if (timeIndex === -1) {
        console.log(`User ${schedule.user_id} - no matching time slot for ${currentTime}`);
        continue;
      }

      console.log(`User ${schedule.user_id} - found matching time slot ${currentTime} at index ${timeIndex}`);

      // Check if we already sent words to this user at this time today
      const { data: existingSend } = await supabase
        .from('scheduled_word_sends')
        .select('id')
        .eq('user_id', schedule.user_id)
        .eq('scheduled_date', currentDate)
        .eq('scheduled_time', currentTime)
        .eq('status', 'sent')
        .single();

      if (existingSend) {
        console.log(`User ${schedule.user_id} - already sent words at ${currentTime} today`);
        continue;
      }

      // Get phone number and category from user subscription
      const phoneNumber = schedule.user_subscriptions.phone_number;
      const category = schedule.user_subscriptions.category;
      const isPro = schedule.user_subscriptions.is_pro;

      if (!phoneNumber) {
        console.log(`User ${schedule.user_id} - no phone number configured`);
        continue;
      }

      try {
        // Create scheduled send record
        const { data: sendRecord, error: sendRecordError } = await supabase
          .from('scheduled_word_sends')
          .insert({
            user_id: schedule.user_id,
            phone_number: phoneNumber,
            category: category,
            scheduled_time: currentTime,
            scheduled_date: currentDate,
            word_batch_number: timeIndex + 1,
            status: 'pending'
          })
          .select()
          .single();

        if (sendRecordError) {
          console.error(`Error creating send record for user ${schedule.user_id}:`, sendRecordError);
          continue;
        }

        // Calculate how many words to send for this slot
        const wordsToSend = Math.ceil(schedule.total_daily_words / 5);

        // Send words via WhatsApp
        const { data: sendResult, error: sendError } = await supabase.functions.invoke('whatsapp-send', {
          body: {
            to: phoneNumber,
            category: category,
            isPro: isPro,
            wordsCount: wordsToSend,
            scheduledSlot: timeIndex + 1,
            totalSlots: 5,
            sendImmediately: true,
            message: `Time for your ${['morning', 'midday', 'afternoon', 'evening', 'night'][timeIndex]} vocabulary boost!`
          }
        });

        if (sendError) {
          console.error(`Error sending words to user ${schedule.user_id}:`, sendError);
          
          // Update send record with error
          await supabase
            .from('scheduled_word_sends')
            .update({
              status: 'failed',
              error_details: sendError.message
            })
            .eq('id', sendRecord.id);
          
          results.push({
            userId: schedule.user_id,
            status: 'failed',
            error: sendError.message
          });
          continue;
        }

        // Update send record with success
        await supabase
          .from('scheduled_word_sends')
          .update({
            status: 'sent',
            sent_at: now.toISOString(),
            message_id: sendResult?.messageId
          })
          .eq('id', sendRecord.id);

        console.log(`Successfully sent words to user ${schedule.user_id} at ${currentTime}`);
        
        results.push({
          userId: schedule.user_id,
          status: 'sent',
          messageId: sendResult?.messageId,
          timeSlot: timeIndex + 1,
          wordsCount: wordsToSend
        });

      } catch (error) {
        console.error(`Error processing user ${schedule.user_id}:`, error);
        results.push({
          userId: schedule.user_id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        currentTime,
        currentDate,
        processedUsers: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in scheduled-word-sender:', error);
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
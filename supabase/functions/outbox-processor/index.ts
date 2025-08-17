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
    console.log('Outbox processor started');
    
    const now = new Date();
    console.log(`Processing messages scheduled for ${now.toISOString()}`);

    // Get messages that are ready to send
    const { data: messages, error: fetchError } = await supabase
      .from('outbox_messages')
      .select('*')
      .eq('status', 'queued')
      .lte('send_at', now.toISOString())
      .limit(500);

    if (fetchError) {
      console.error('Error fetching outbox messages:', fetchError);
      throw fetchError;
    }

    if (!messages || messages.length === 0) {
      console.log('No messages to process');
      return new Response(
        JSON.stringify({
          success: true,
          processedMessages: 0,
          timestamp: now.toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${messages.length} messages to process`);

    const results = [];

    for (const message of messages) {
      try {
        // Mark as sending
        await supabase
          .from('outbox_messages')
          .update({ status: 'sending' })
          .eq('id', message.id);

        // Send the message via WhatsApp
        const sendResult = await sendWhatsAppMessage(message);

        if (sendResult.success) {
          // Mark as sent
          await supabase
            .from('outbox_messages')
            .update({ 
              status: 'sent',
              updated_at: now.toISOString()
            })
            .eq('id', message.id);

          console.log(`Successfully sent message ${message.id} to ${message.phone}`);
          
          results.push({
            messageId: message.id,
            phone: message.phone,
            status: 'sent',
            word: message.variables?.word || 'N/A'
          });
        } else {
          // Mark as failed and increment retries
          await supabase
            .from('outbox_messages')
            .update({ 
              status: 'failed',
              retries: message.retries + 1,
              updated_at: now.toISOString()
            })
            .eq('id', message.id);

          console.error(`Failed to send message ${message.id}:`, sendResult.error);
          
          results.push({
            messageId: message.id,
            phone: message.phone,
            status: 'failed',
            error: sendResult.error,
            word: message.variables?.word || 'N/A'
          });
        }

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('outbox_messages')
          .update({ 
            status: 'failed',
            retries: message.retries + 1,
            updated_at: now.toISOString()
          })
          .eq('id', message.id);

        results.push({
          messageId: message.id,
          phone: message.phone,
          status: 'failed',
          error: error.message,
          word: message.variables?.word || 'N/A'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedMessages: results.length,
        results,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in outbox-processor:', error);
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

async function sendWhatsAppMessage(message: any) {
  try {
    const { variables } = message;
    const { word, definition, example, category, position, totalWords, pronunciation, part_of_speech, memory_hook } = variables;

    console.log(`Sending word: ${word} to ${message.phone}`);

    // Format the message in the enhanced format with proper line breaks
    const formattedMessage = `*Word:* ${word} 🟩 (${part_of_speech || 'Unknown'})
*Pronunciation:* ${pronunciation || 'N/A'}
*Meaning:* ${definition}
*Example:* ${example}
*Memory Hook:* ${memory_hook || 'Remember this word!'}`;

    // Call the whatsapp-send function with the formatted message
    const { data, error } = await supabase.functions.invoke('whatsapp-send', {
      body: {
        category: category || 'daily-beginner',
        to: message.phone,
        isPro: false,
        wordsCount: 1,
        message: formattedMessage
      }
    });

    if (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      console.error('WhatsApp send failed:', data);
      return { success: false, error: data?.error || 'Unknown error' };
    }

    // Record in user word history
    try {
      await supabase
        .from('user_word_history')
        .insert({
          user_id: message.user_id,
          word_id: crypto.randomUUID(),
          word: word,
          category: category || 'daily-beginner',
          source: 'scheduled'
        });
    } catch (historyError) {
      console.error('Failed to record word history:', historyError);
      // Don't fail the send if history recording fails
    }

    return { success: true, messageId: data.messageId };

  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    return { success: false, error: error.message };
  }
}
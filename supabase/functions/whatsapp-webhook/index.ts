
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("WhatsApp webhook received", { method: req.method, url: req.url });
  
  // For GET requests, handle WhatsApp verification challenge
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const challenge = url.searchParams.get('hub.challenge');
    const token = url.searchParams.get('hub.verify_token');
    
    console.log("WhatsApp verification request", { mode, token, challenge: challenge ? 'present' : 'missing' });
    
    // Check if this is a verification request
    if (mode === 'subscribe') {
      // You should set this in your Supabase secrets and compare here
      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      
      if (!verifyToken) {
        console.error("WHATSAPP_VERIFY_TOKEN not set in environment");
        return new Response(
          JSON.stringify({ success: false, error: 'Verification token not configured' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (token === verifyToken) {
        console.log("Verification successful, returning challenge:", challenge);
        // If verification tokens match, respond with the challenge
        return new Response(challenge, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        console.error("Verification token mismatch", { 
          received: token, 
          expected: verifyToken ? '[hidden for security]' : 'not configured',
          match: token === verifyToken
        });
        return new Response('Verification failed', { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    }
    
    return new Response('Invalid request', { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
  
  // For POST requests, handle incoming WhatsApp messages
  if (req.method === 'POST') {
    let webhookData;
    try {
      webhookData = await req.json();
      console.log("WhatsApp webhook data received", JSON.stringify(webhookData));
    } catch (error) {
      console.error("Failed to parse webhook payload", error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Initialize Supabase client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Store the raw webhook data for debugging and analysis
      const { error: logError } = await supabaseAdmin
        .from('whatsapp_webhook_logs')
        .insert({
          raw_data: webhookData,
          source: 'meta',
          event_type: 'incoming_message'
        });
          
      if (logError) {
        console.error("Failed to log webhook data", logError);
      }
      
      // Process incoming WhatsApp message
      if (webhookData.entry && webhookData.entry.length > 0) {
        // Extract messages for Meta Business Platform format
        const entry = webhookData.entry[0];
        
        // Process Meta Business Platform messages
        if (entry.changes && entry.changes.length > 0) {
          const change = entry.changes[0];
          if (change.value && change.value.messages && change.value.messages.length > 0) {
            const messages = change.value.messages;
            
            for (const message of messages) {
              // Extract message details
              const from = message.from; // Phone number of the user
              const messageId = message.id;
              const timestamp = message.timestamp;
              let messageText = '';
              
              // Handle different message types
              if (message.type === 'text' && message.text) {
                messageText = message.text.body;
              } else if (message.type === 'button' && message.button) {
                messageText = `Button: ${message.button.text}`;
              } else if (message.type === 'interactive' && message.interactive) {
                if (message.interactive.type === 'button_reply') {
                  messageText = `Button: ${message.interactive.button_reply.title}`;
                } else if (message.interactive.type === 'list_reply') {
                  messageText = `List: ${message.interactive.list_reply.title}`;
                } else {
                  messageText = `Interactive: ${message.interactive.type}`;
                }
              } else {
                messageText = `${message.type} message`;
              }
              
              console.log("Processing incoming WhatsApp message", { 
                from, 
                messageText, 
                messageId,
                timestamp,
                type: message.type
              });
              
              // Store the incoming message
              const { error: msgError } = await supabaseAdmin
                .from('whatsapp_messages')
                .insert({
                  message_id: messageId,
                  phone_number: from,
                  message: messageText,
                  direction: 'incoming',
                  timestamp: new Date(Number(timestamp) * 1000).toISOString(),
                  raw_data: message
                });
                
              if (msgError) {
                console.error("Failed to store incoming message", msgError);
              } else {
                console.log("Successfully stored incoming message to database");
              }
              
              // Find the user associated with this phone number
              const cleanPhoneNumber = from.replace('whatsapp:', '');
              console.log("Looking for user with phone number:", cleanPhoneNumber);
              
              const { data: subscription } = await supabaseAdmin
                .from('user_subscriptions')
                .select('user_id, category, is_pro')
                .eq('phone_number', cleanPhoneNumber)
                .maybeSingle();
                
              if (subscription) {
                console.log("Found user subscription for incoming message", { 
                  userId: subscription.user_id,
                  category: subscription.category
                });
                
                // Send an automatic response if needed
                if (messageText.toLowerCase().includes('help')) {
                  // Call send-whatsapp function to send a response
                  const { data: responseData, error: responseError } = await supabaseAdmin.functions.invoke('send-whatsapp', {
                    body: {
                      to: cleanPhoneNumber,
                      message: "Hello! This is VocabSpark's automated response. For help, please reply with one of these keywords:\n\n- WORDS: Get today's vocabulary words\n- STOP: Unsubscribe from daily words\n- SETTINGS: Change your preferences",
                      sendImmediately: true
                    }
                  });
                  
                  if (responseError) {
                    console.error("Failed to send automatic response", responseError);
                  } else {
                    console.log("Sent automatic response to user", responseData);
                  }
                }
              } else {
                console.log("No subscription found for phone number:", cleanPhoneNumber);
              }
            }
          } else if (change.value && change.value.statuses) {
            // Handle message status updates
            for (const status of change.value.statuses) {
              console.log("Message status update received", {
                messageId: status.id,
                status: status.status,
                timestamp: status.timestamp
              });
              
              // Store the status update
              const { error: statusError } = await supabaseAdmin
                .from('whatsapp_message_statuses')
                .insert({
                  message_id: status.id,
                  status: status.status,
                  timestamp: new Date(Number(status.timestamp) * 1000).toISOString(),
                  raw_data: status
                })
                .onConflict('message_id')
                .merge();
              
              if (statusError) {
                console.error("Failed to store status update", statusError);
              } else {
                console.log("Successfully stored status update");
              }
            }
          }
        }
        // Handle potential Twilio message format as fallback
        else if (entry.Body && entry.From) {
          console.log("Processing Twilio format message", {
            from: entry.From,
            body: entry.Body
          });
          
          // Store the incoming message (Twilio format)
          const { error: msgError } = await supabaseAdmin
            .from('whatsapp_messages')
            .insert({
              message_id: entry.SmsMessageSid || `twilio-${Date.now()}`,
              phone_number: entry.From,
              message: entry.Body,
              direction: 'incoming',
              timestamp: new Date().toISOString(),
              raw_data: entry
            });
            
          if (msgError) {
            console.error("Failed to store incoming Twilio message", msgError);
          }
        }
      } else {
        console.log("Received webhook data without messages or in unknown format", webhookData);
      }
      
      // WhatsApp/Meta expects a 200 OK response to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error("Error processing WhatsApp webhook", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // For any other methods
  return new Response('Method not allowed', { 
    status: 405, 
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
  });
});


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

  console.log("WhatsApp webhook received", { method: req.method });
  
  // For GET requests, handle WhatsApp verification challenge
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const challenge = url.searchParams.get('hub.challenge');
    const token = url.searchParams.get('hub.verify_token');
    
    console.log("WhatsApp verification request", { mode, token });
    
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
        console.log("Verification successful, returning challenge");
        // If verification tokens match, respond with the challenge
        return new Response(challenge, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        console.error("Verification token mismatch", { received: token, expected: '[hidden]' });
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
      console.log("WhatsApp webhook data received", JSON.stringify(webhookData).substring(0, 200) + "...");
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
      
      // Process incoming WhatsApp message
      if (webhookData.entry && webhookData.entry.length > 0) {
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
        
        // Extract messages
        const entry = webhookData.entry[0];
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
              } else {
                messageText = `${message.type} message`;
              }
              
              console.log("Processing incoming WhatsApp message", { from, messageText, messageId });
              
              // Store the incoming message
              const { error: msgError } = await supabaseAdmin
                .from('whatsapp_messages')
                .insert({
                  message_id: messageId,
                  phone_number: from,
                  message: messageText,
                  direction: 'incoming',
                  timestamp: new Date(timestamp * 1000).toISOString()
                });
                
              if (msgError) {
                console.error("Failed to store incoming message", msgError);
              }
              
              // Find the user associated with this phone number
              const { data: subscription } = await supabaseAdmin
                .from('user_subscriptions')
                .select('user_id, category, is_pro')
                .eq('phone_number', from.replace('whatsapp:', ''))
                .maybeSingle();
                
              if (subscription) {
                console.log("Found user subscription for incoming message", { 
                  userId: subscription.user_id,
                  category: subscription.category
                });
                
                // TODO: Add any automated response logic here based on the message
                // For example, if the user sends "help" or specific keywords
              }
            }
          }
        }
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

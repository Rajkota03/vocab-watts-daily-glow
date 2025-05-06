
// /home/ubuntu/glintup_project/supabase/functions/whatsapp-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
// Import Twilio helper library for signature validation
import twilio from 'https://esm.sh/twilio@4.20.1'; // Use a specific version

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
};

// Helper function to parse form-encoded data from raw text
function parseFormDataFromText(text: string): URLSearchParams | null {
  try {
    return new URLSearchParams(text);
  } catch (e) {
    console.error("Error parsing form data from text:", e);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the raw request information for debugging
    console.log(`Received ${req.method} request to webhook at ${new URL(req.url).pathname}`);
    console.log(`Headers: ${JSON.stringify([...req.headers.entries()])}`);
    
    const rawBody = await req.text(); // Get the raw body *before* parsing
    console.log(`Raw body: ${rawBody.substring(0, 500)}${rawBody.length > 500 ? '...' : ''}`);

    // Get parameters and important headers
    const contentType = req.headers.get('content-type') || '';
    const signature = req.headers.get('x-twilio-signature');
    const url = req.url; // Full request URL
    const sourceIp = req.headers.get('x-forwarded-for') || 'unknown';

    // --- Handle GET for Webhook Verification (No signature validation needed for this) ---
    if (req.method === 'GET') {
      const getUrl = new URL(req.url);
      const mode = getUrl.searchParams.get('hub.mode');
      const token = getUrl.searchParams.get('hub.verify_token');
      const challenge = getUrl.searchParams.get('hub.challenge');

      console.log('WhatsApp webhook verification attempt:', { mode, tokenProvided: !!token, challengeProvided: !!challenge });

      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      if (mode === 'subscribe' && token === verifyToken && challenge) {
        console.log('WhatsApp webhook verified successfully.');
        return new Response(challenge, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      } else {
        console.error('Failed to verify webhook:', { mode, tokenMatch: token === verifyToken, challenge });
        return new Response('Verification failed', { status: 403, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      }
    }

    // --- For POST requests, first initialize Supabase client ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Process based on content type ---
    let messageData: any = null;

    // Handle form-encoded data from Twilio status callbacks
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = parseFormDataFromText(rawBody);
      if (!formData) {
        console.error("Could not parse form data");
        return new Response(JSON.stringify({ success: false, error: "Could not parse form data" }), {
          status: 200, // Return 200 even for errors to prevent Twilio retries
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Convert form data to an object for easier handling
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value;
      });
      
      console.log("Parsed form data:", params);

      // Handle status callbacks from Twilio (presence of MessageSid and MessageStatus indicates status update)
      if (params.MessageSid && params.MessageStatus) {
        console.log(`Processing status update for message ${params.MessageSid}: ${params.MessageStatus}`);
        
        try {
          // Store the status update in whatsapp_message_status table
          const { error } = await supabaseAdmin
            .from('whatsapp_message_status')
            .insert({
              message_sid: params.MessageSid,
              status: params.MessageStatus,
              error_code: params.ErrorCode || null,
              error_message: params.ErrorMessage || null,
              to_number: params.To || null,
              from_number: params.From || null,
              api_version: params.ApiVersion || null,
              request_method: req.method,
              source_ip: sourceIp,
              raw_data: params
            });

          if (error) {
            console.error("Error storing message status:", error);
          } else {
            console.log("Successfully stored message status");
          }
        } catch (e) {
          console.error("Exception processing status update:", e);
          // Continue processing even if storage fails
        }
        
        // Always respond with 200 OK to Twilio status callbacks
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // If it's an incoming message from Twilio (in form encoded format)
      else if (params.Body) {
        messageData = {
          from: params.From || params.WaId,
          body: params.Body,
          mediaUrl: params.MediaUrl0, // Twilio uses numbered media URLs
          provider: 'twilio',
          provider_message_id: params.SmsMessageSid || params.MessageSid
        };
      }
    }
    // Handle JSON data from Meta/WhatsApp
    else if (contentType.includes('application/json')) {
      try {
        const body = JSON.parse(rawBody);
        console.log("Parsed JSON body:", JSON.stringify(body).substring(0, 200));
        
        if (body.entry && body.entry.length > 0) {
          const entry = body.entry[0];
          if (entry.changes && entry.changes.length > 0) {
            const change = entry.changes[0];
            if (change.value && change.value.messages && change.value.messages.length > 0) {
              const message = change.value.messages[0];
              messageData = {
                from: message.from,
                body: message.text?.body || '',
                mediaUrl: message.image?.id || message.video?.id || message.audio?.id || message.document?.id || null,
                provider: 'meta',
                provider_message_id: message.id
              };
            }
          }
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
        // Always return 200 OK even for errors to prevent Twilio retries
        return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }), {
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } 
    else {
      console.warn(`Unsupported content type: ${contentType}`);
    }

    // Store incoming message if we have message data
    if (messageData) {
      try {
        console.log("Storing incoming message:", messageData);
        const { error } = await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            from_number: messageData.from,
            message: messageData.body,
            media_url: messageData.mediaUrl,
            provider: messageData.provider,
            provider_message_id: messageData.provider_message_id
          });

        if (error) {
          console.error("Error storing message:", error);
        } else {
          console.log("Message stored successfully");
        }
      } catch (e) {
        console.error("Exception storing message:", e);
        // Continue processing - we still want to acknowledge the webhook
      }
    }

    // Always respond with 200 OK to acknowledge receipt for all webhook events
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in WhatsApp webhook:', error);
    // Always return 200 OK even on errors to prevent retry loops
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

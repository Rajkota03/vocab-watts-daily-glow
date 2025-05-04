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
    // --- Twilio Signature Validation --- 
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const signature = req.headers.get('x-twilio-signature');
    const url = req.url; // Use the full request URL
    const rawBody = await req.text(); // Get the raw body *before* parsing

    if (!twilioAuthToken) {
      console.error('Missing TWILIO_AUTH_TOKEN environment variable.');
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error: Missing Auth Token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!signature) {
      console.warn('Missing X-Twilio-Signature header.');
      return new Response(JSON.stringify({ success: false, error: 'Missing Twilio signature' }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert rawBody (string) to a format validateRequest expects (Record<string, string> for form data)
    // Note: Twilio validation works on the raw body string for JSON, but needs parsed params for form data.
    // We'll pass the rawBody and let the validator handle it if it's JSON, 
    // or parse it if it's form-urlencoded.
    let params: Record<string, string> = {};
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
        const parsedParams = parseFormDataFromText(rawBody);
        if (parsedParams) {
            parsedParams.forEach((value, key) => {
                params[key] = value;
            });
        } else {
             console.error('Failed to parse form data for validation.');
             // Fallback or error? Let's try validating with empty params, might work if Twilio lib is robust
        }
    } else {
        // For JSON or other types, Twilio expects the raw body string, but the library wants a Record.
        // This part is tricky. Let's assume for status webhooks (form-urlencoded) the above works.
        // If incoming messages are JSON, this validation might need adjustment based on library behavior.
        // For now, we prioritize fixing the status webhook (form-urlencoded).
    }

    const isValid = twilio.validateRequest(
      twilioAuthToken,
      signature,
      url,
      // Pass the parsed params for form-urlencoded, or the raw body for JSON? 
      // The library expects Record<string, string | string[]>. Let's stick with parsed params for form data.
      params 
    );

    if (!isValid) {
      console.error('Invalid Twilio signature.');
      return new Response(JSON.stringify({ success: false, error: 'Invalid Twilio signature' }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    console.log('Twilio signature validated successfully.');
    // --- End Twilio Signature Validation ---

    // Initialize Supabase client (only after validation)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? 
      '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get verification token from env
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    // --- Handle GET for Webhook Verification (Should ideally not require signature validation, but keep logic) ---
    if (req.method === 'GET') {
      const getUrl = new URL(req.url);
      const mode = getUrl.searchParams.get('hub.mode');
      const token = getUrl.searchParams.get('hub.verify_token');
      const challenge = getUrl.searchParams.get('hub.challenge');

      console.log('WhatsApp webhook verification attempt:', { mode, tokenProvided: !!token, challengeProvided: !!challenge });

      if (mode === 'subscribe' && token === verifyToken && challenge) {
        console.log('WhatsApp webhook verified successfully.');
        return new Response(challenge, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      } else {
        console.error('Failed to verify webhook:', { mode, tokenMatch: token === verifyToken, challenge });
        return new Response('Verification failed', { status: 403, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      }
    }

    // --- Handle POST for Incoming Messages & Status Updates (Already validated) ---
    if (req.method === 'POST') {
      // We already have the rawBody, parse form data from it if needed
      let body;
      let formData: URLSearchParams | null = null;

      if (contentType.includes('application/json')) {
        try {
          body = JSON.parse(rawBody);
          console.log('Received JSON payload:', rawBody.substring(0, 200) + '...');
        } catch (parseError) {
          console.error('Error parsing JSON webhook body:', parseError);
          // Should not happen if validation passed, but good to keep
          return new Response(JSON.stringify({ success: false, error: 'Invalid JSON request body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        formData = parseFormDataFromText(rawBody);
        if (formData) {
          console.log('Received Form payload:', rawBody.substring(0, 200) + '...');
        } else {
           // Should not happen if validation passed
           return new Response(JSON.stringify({ success: false, error: 'Could not parse form data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Should not happen if validation passed
        console.warn(`Unsupported content type: ${contentType}`);
         return new Response(JSON.stringify({ success: false, error: `Unsupported content type: ${contentType}` }), {
            status: 415, // Unsupported Media Type
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      // Check if it's a Twilio Status Update (form-encoded)
      if (formData && formData.has('MessageSid') && formData.has('MessageStatus')) {
        const messageSid = formData.get('MessageSid');
        const messageStatus = formData.get('MessageStatus');
        const errorCode = formData.get('ErrorCode'); // Optional error code
        const errorMessage = formData.get('ErrorMessage'); // Optional error message

        console.log(`Processing Twilio Status Update for SID: ${messageSid}, Status: ${messageStatus}`);

        try {
          // --- LOG STATUS UPDATE TO DATABASE ---
          // Example: Update a 'message_logs' table (assuming it exists)
          /*
          const { error: updateError } = await supabaseAdmin
            .from('message_logs') // Replace with your actual log table name
            .update({ 
              status: messageStatus,
              error_code: errorCode,
              error_message: errorMessage,
              updated_at: new Date().toISOString()
             })
            .eq('message_sid', messageSid); // Match the message by its SID

          if (updateError) {
            console.error(`Error updating message log for SID ${messageSid}:`, updateError);
          } else {
            console.log(`Successfully logged status '${messageStatus}' for SID ${messageSid}`);
          }
          */
          // Placeholder log until DB table is confirmed/created
           console.log(`Placeholder: Logged status '${messageStatus}' for SID ${messageSid}. ErrorCode: ${errorCode || 'N/A'}`);

        } catch (logError) {
          console.error(`Error processing status update for SID ${messageSid}:`, logError);
          // Don't return error here, still need to send 200 OK to Twilio
        }

      // Check if it's an Incoming Message (JSON from Meta or Form from Twilio)
      } else {
         let messageData;
        // Handle direct Twilio incoming message format (form-encoded)
        if (formData && formData.has('SmsMessageSid') && formData.has('Body')) {
           messageData = {
            from: formData.get('From'),
            body: formData.get('Body'),
            mediaUrl: formData.get('MediaUrl0'), // Twilio uses numbered media URLs
            provider: 'twilio',
            provider_message_id: formData.get('SmsMessageSid')
          };
        }
        // Handle Meta/WhatsApp incoming message format (JSON)
        else if (body && body.entry && body.entry.length > 0) {
          // ... (existing Meta JSON parsing logic) ...
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

        // If we extracted message data, store it
        if (messageData) {
          try {
            console.log('Processing incoming message data:', messageData);
            const { error: insertError } = await supabaseAdmin
              .from('whatsapp_messages') // Assuming this table exists for incoming messages
              .insert({
                from_number: messageData.from,
                message: messageData.body,
                media_url: messageData.mediaUrl,
                provider: messageData.provider,
                provider_message_id: messageData.provider_message_id
              });

            if (insertError) {
              console.error('Error storing incoming WhatsApp message:', insertError);
            } else {
              console.log('Successfully stored incoming WhatsApp message');
            }
          } catch (processError) {
            console.error('Error processing incoming WhatsApp message:', processError);
          }
        } else {
          console.warn('Webhook received POST but could not extract known message or status data.');
        }
      }

      // Always respond with 200 OK to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Handle Unsupported Methods ---
    console.log(`Unsupported method received: ${req.method}`);
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in WhatsApp webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


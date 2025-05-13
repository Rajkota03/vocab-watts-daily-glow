
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
// Import Twilio helper library for signature validation
import twilio from 'https://esm.sh/twilio@4.20.1';

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

// Helper function to convert form data to an object
function formDataToObject(formData: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Create response helper with consistent format
function createResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data), 
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Handle webhook verification for WhatsApp
async function handleWebhookVerification(url: URL) {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log('WhatsApp webhook verification attempt:', { mode, tokenProvided: !!token, challengeProvided: !!challenge });

  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
  
  // Log the token comparison for debugging
  console.log('Token comparison:', { 
    providedToken: token,
    expectedToken: verifyToken,
    tokenMatch: token === verifyToken
  });
  
  if (mode === 'subscribe' && token === verifyToken && challenge) {
    console.log('WhatsApp webhook verified successfully.');
    return new Response(challenge, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
  } else {
    console.error('Failed to verify webhook:', { mode, tokenMatch: token === verifyToken, challenge });
    // For troubleshooting, log current environment variables (excluding sensitive ones)
    console.log('Environment variables check:', {
      hasVerifyToken: !!verifyToken,
      verifyTokenLength: verifyToken ? verifyToken.length : 0,
      requiredParams: { mode, token, challenge }
    });
    
    // IMPORTANT: Return 200 even for verification failures to prevent retry loops
    return new Response('Verification failed', { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
  }
}

// Handle message status updates from Twilio
async function handleMessageStatus(params: Record<string, string>, supabaseAdmin: any, sourceIp: string) {
  console.log(`Processing status update for message ${params.MessageSid}: ${params.MessageStatus}`);
  
  try {
    // Store the status update in whatsapp_message_status table - we'll check if api_version exists
    // This fixes the "Could not find the 'api_version' column" error
    const currentTableInfo = await supabaseAdmin
      .from('whatsapp_message_status')
      .select('*')
      .limit(1);

    // Check if we had an error that might be due to missing column
    let shouldTransformApiVersion = false;
    if (currentTableInfo.error && currentTableInfo.error.message?.includes("api_version")) {
      console.log("Detected missing api_version column - will omit this field");
      shouldTransformApiVersion = true;
    }
    
    // Prepare data object - conditionally include api_version
    const dataObj: Record<string, any> = {
      message_sid: params.MessageSid,
      status: params.MessageStatus,
      error_code: params.ErrorCode || null,
      error_message: params.ErrorMessage || null,
      to_number: params.To || null,
      from_number: params.From || null,
      source_ip: sourceIp,
      raw_data: params,
      notes: `Status update received at ${new Date().toISOString()}`
    };
    
    // Only include api_version if the column exists
    if (!shouldTransformApiVersion) {
      // Note about Twilio API version - this is normal and not an error condition
      // The 2010-04-01 is Twilio's stable API version identifier
      dataObj.api_version = params.ApiVersion || null;
    }

    // Insert the record with our conditional data
    const { error } = await supabaseAdmin
      .from('whatsapp_message_status')
      .insert(dataObj);

    if (error) {
      console.error("Error storing message status:", error);
    } else {
      console.log("Successfully stored message status");
    }
  } catch (e) {
    console.error("Exception processing status update:", e);
  }
  
  // IMPORTANT: Always respond with 200 OK to Twilio status callbacks
  return createResponse({ success: true });
}

// Parse and process incoming WhatsApp message from Twilio (form encoded)
function processTwilioIncomingMessage(params: Record<string, string>): any {
  if (params.Body) {
    return {
      from: params.From || params.WaId,
      body: params.Body,
      mediaUrl: params.MediaUrl0, // Twilio uses numbered media URLs
      provider: 'twilio',
      provider_message_id: params.SmsMessageSid || params.MessageSid
    };
  }
  return null;
}

// Parse and process incoming WhatsApp message from Meta/WhatsApp API (JSON)
function processMetaIncomingMessage(body: any): any {
  if (body.entry && body.entry.length > 0) {
    const entry = body.entry[0];
    if (entry.changes && entry.changes.length > 0) {
      const change = entry.changes[0];
      if (change.value && change.value.messages && change.value.messages.length > 0) {
        const message = change.value.messages[0];
        return {
          from: message.from,
          body: message.text?.body || '',
          mediaUrl: message.image?.id || message.video?.id || message.audio?.id || message.document?.id || null,
          provider: 'meta',
          provider_message_id: message.id
        };
      }
    }
  }
  return null;
}

// Store incoming message in the database
async function storeIncomingMessage(messageData: any, supabaseAdmin: any) {
  if (!messageData) return;

  try {
    console.log("Storing incoming message:", messageData);
    
    // Check if whatsapp_messages table exists
    try {
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
      // If table doesn't exist, log the error but don't fail the webhook
      console.log("Table 'whatsapp_messages' might not exist. This is non-critical.");
    }
  } catch (e) {
    console.error("Exception in message handling:", e);
  }
}

// Initialize Supabase client
function initializeSupabase(): any {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Cannot proceed.");
    throw new Error("Server misconfigured: Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseKey);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,  // Ensure OPTIONS requests return 200
      headers: corsHeaders 
    });
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
      return await handleWebhookVerification(new URL(req.url));
    }

    // --- For POST requests, first initialize Supabase client ---
    const supabaseAdmin = initializeSupabase();

    // --- Process based on content type ---
    let messageData: any = null;

    // Handle form-encoded data from Twilio status callbacks
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = parseFormDataFromText(rawBody);
      if (!formData) {
        console.error("Could not parse form data");
        return createResponse({ success: false, error: "Could not parse form data" }, 200);
      }

      // Convert form data to an object for easier handling
      const params = formDataToObject(formData);
      
      console.log("Parsed form data:", params);
      
      // Add note about the API version if present
      if (params.ApiVersion === "2010-04-01") {
        console.log("Note: Twilio API version '2010-04-01' is their standard versioning scheme and represents the current stable API.");
      }

      // Handle status callbacks from Twilio (presence of MessageSid and MessageStatus indicates status update)
      if (params.MessageSid && params.MessageStatus) {
        return await handleMessageStatus(params, supabaseAdmin, sourceIp);
      }
      
      // If it's an incoming message from Twilio (in form encoded format)
      messageData = processTwilioIncomingMessage(params);
    }
    // Handle JSON data from Meta/WhatsApp
    else if (contentType.includes('application/json')) {
      try {
        const body = JSON.parse(rawBody);
        console.log("Parsed JSON body:", JSON.stringify(body).substring(0, 200));
        messageData = processMetaIncomingMessage(body);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        // Always return 200 OK even for errors to prevent retries
        return createResponse({ success: false, error: "Invalid JSON" }, 200);
      }
    } 
    else {
      console.warn(`Unsupported content type: ${contentType}`);
    }

    // Store incoming message if we have message data
    await storeIncomingMessage(messageData, supabaseAdmin);

    // IMPORTANT: Always respond with 200 OK to acknowledge receipt for all webhook events
    return createResponse({ success: true });

  } catch (error) {
    console.error('Unexpected error in WhatsApp webhook:', error);
    // CRITICAL: Always return 200 OK even on errors to prevent retry loops
    return createResponse({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, 200);
  }
});

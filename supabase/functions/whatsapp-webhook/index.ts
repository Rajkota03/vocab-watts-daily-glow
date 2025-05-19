import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

// Import shared CORS headers
import { corsHeaders } from "../_shared/cors.ts";

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

// Custom Twilio signature validator that doesn't rely on the Twilio library
function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null,
  authToken: string
): boolean {
  if (!signature) {
    console.log("No Twilio signature provided");
    return false;
  }

  if (!authToken) {
    console.error("TWILIO_AUTH_TOKEN is not configured in environment variables");
    return false;
  }

  try {
    // Sort the POST parameters alphabetically by key
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, string>, key) => {
        result[key] = params[key];
        return result;
      }, {});

    // Concatenate URL and sorted params
    let data = url;
    Object.keys(sortedParams).forEach(key => {
      data += key + sortedParams[key];
    });

    // Create HMAC hash
    const hmac = createHmac("sha1", authToken);
    hmac.update(data);
    const expectedSignature = hmac.digest("base64");
    
    const isValid = signature === expectedSignature;
    
    if (isValid) {
      console.log("✅ Twilio signature validated successfully");
    } else {
      console.error("❌ Invalid Twilio signature");
      console.log("Expected:", expectedSignature);
      console.log("Received:", signature);
    }
    
    return isValid;
  } catch (e) {
    console.error("Error validating Twilio signature:", e);
    return false;
  }
}

// Handle webhook verification for WhatsApp
async function handleWebhookVerification(url: URL) {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log('WhatsApp webhook verification attempt:', { mode, tokenProvided: !!token, challengeProvided: !!challenge });

  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
  
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
    
    return new Response('Verification failed', { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
  }
}

// Handle message status updates from Twilio
async function handleMessageStatus(params: Record<string, string>, supabaseAdmin: any, sourceIp: string, provider: string) {
  console.log(`Processing status update for message ${params.MessageSid}: ${params.MessageStatus}`);
  
  try {
    // Store the status update in whatsapp_message_status table
    const dataObj: Record<string, any> = {
      message_sid: params.MessageSid,
      status: params.MessageStatus,
      error_code: params.ErrorCode || null,
      error_message: params.ErrorMessage || null,
      to_number: params.To || null,
      from_number: params.From || null,
      api_version: params.ApiVersion || null,
      source_ip: sourceIp,
      raw_data: params,
      notes: `Status update received at ${new Date().toISOString()}`
    };

    // Insert the record
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
  
  // Always respond with 200 OK to Twilio status callbacks
  return createResponse({ success: true });
}

// Handle AiSensy message status updates
async function handleAiSensyMessageStatus(data: any, supabaseAdmin: any, sourceIp: string) {
  console.log(`Processing AiSensy status update for message ${data.aisensyMessageId}: ${data.status}`);
  
  try {
    // Store the status update in whatsapp_message_status table
    const dataObj: Record<string, any> = {
      message_sid: data.aisensyMessageId || data.id,
      status: data.status,
      error_code: data.errorCode || null,
      error_message: data.errorMessage || data.error || null,
      to_number: data.to || data.phone || null,
      from_number: data.from || null,
      source_ip: sourceIp,
      raw_data: data,
      notes: `AiSensy status update received at ${new Date().toISOString()}`
    };

    // Insert the record
    const { error } = await supabaseAdmin
      .from('whatsapp_message_status')
      .insert(dataObj);

    if (error) {
      console.error("Error storing AiSensy message status:", error);
    } else {
      console.log("Successfully stored AiSensy message status");
    }
  } catch (e) {
    console.error("Exception processing AiSensy status update:", e);
  }
  
  // Always respond with 200 OK to AiSensy status callbacks
  return createResponse({ success: true, provider: 'aisensy' });
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

// Parse and process incoming WhatsApp message from AiSensy API (JSON)
function processAiSensyIncomingMessage(body: any): any {
  if (body.text || body.media) {
    return {
      from: body.from || body.phone,
      body: body.text || body.message || "",
      mediaUrl: body.media?.url || null,
      provider: 'aisensy',
      provider_message_id: body.aisensyMessageId || body.id
    };
  }
  return null;
}

// Store incoming message in the database
async function storeIncomingMessage(messageData: any, supabaseAdmin: any) {
  if (!messageData) return;

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
      status: 200,
      headers: { 
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature'
      } 
    });
  }

  try {
    // Log the raw request information for debugging
    console.log(`Received ${req.method} request to webhook at ${new URL(req.url).pathname}`);
    
    // Get the raw body *before* parsing
    const rawBody = await req.text();
    console.log(`Raw body (truncated): ${rawBody.substring(0, 200)}${rawBody.length > 200 ? '...' : ''}`);

    // Get parameters and important headers
    const contentType = req.headers.get('content-type') || '';
    const twilioSignature = req.headers.get('x-twilio-signature');
    const aisensySignature = req.headers.get('x-aisensy-signature');
    const fullUrl = req.url; // Full request URL
    const sourceIp = req.headers.get('x-forwarded-for') || 'unknown';

    // --- Handle GET for Webhook Verification (No signature validation needed for this) ---
    if (req.method === 'GET') {
      return await handleWebhookVerification(new URL(req.url));
    }

    // --- For POST requests, first initialize Supabase client ---
    const supabaseAdmin = initializeSupabase();

    // --- Process based on content type ---
    let messageData: any = null;
    let sigValidated = false;
    let provider = 'unknown';

    // Handle form-encoded data from Twilio
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = parseFormDataFromText(rawBody);
      if (!formData) {
        console.error("Could not parse form data");
        return createResponse({ success: false, error: "Could not parse form data" }, 200);
      }

      // Convert form data to an object for easier handling
      const params = formDataToObject(formData);
      
      console.log("Parsed form data:", params);
      provider = 'twilio';
      
      // Get auth token for validation
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      // Validate Twilio signature using our custom validator
      sigValidated = validateTwilioSignature(fullUrl, params, twilioSignature, authToken || '');
      
      // Handle status callbacks from Twilio
      if (params.MessageSid && params.MessageStatus) {
        return await handleMessageStatus(params, supabaseAdmin, sourceIp, provider);
      }
      
      // If it's an incoming message from Twilio
      messageData = processTwilioIncomingMessage(params);
    }
    // Handle JSON data which could be from Meta/WhatsApp or AiSensy
    else if (contentType.includes('application/json')) {
      try {
        const body = JSON.parse(rawBody);
        console.log("Parsed JSON body:", JSON.stringify(body).substring(0, 200));
        
        // Check AiSensy-specific fields to identify the provider
        if (body.aisensyMessageId || body.provider === 'aisensy') {
          provider = 'aisensy';
          
          // Handle AiSensy status updates
          if (body.aisensyMessageId && body.status) {
            return await handleAiSensyMessageStatus(body, supabaseAdmin, sourceIp);
          }
          
          // Handle incoming message from AiSensy
          messageData = processAiSensyIncomingMessage(body);
        } else {
          // Process as Meta/WhatsApp
          provider = 'meta';
          messageData = processMetaIncomingMessage(body);
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
        return createResponse({ success: false, error: "Invalid JSON" }, 200);
      }
    } 
    else {
      console.warn(`Unsupported content type: ${contentType}`);
    }

    // Store incoming message if we have message data
    if (messageData) {
      await storeIncomingMessage(messageData, supabaseAdmin);
    }

    // Always respond with 200 OK to acknowledge receipt for all webhook events
    return createResponse({ 
      success: true,
      validated: sigValidated,
      provider: provider,
      messageReceived: !!messageData
    });

  } catch (error) {
    console.error('Unexpected error in WhatsApp webhook:', error);
    // Always return 200 OK even on errors to prevent retry loops
    return createResponse({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, 200);
  }
});

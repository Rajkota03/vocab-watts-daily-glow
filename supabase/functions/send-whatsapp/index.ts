// /home/ubuntu/glintup_project/supabase/functions/send-whatsapp/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string;
  message?: string;
  category?: string;
  isPro?: boolean;
  skipSubscriptionCheck?: boolean;
  userId?: string;
  scheduledTime?: string;
  sendImmediately?: boolean;
  checkOnly?: boolean;
  debugMode?: boolean;
  extraDebugging?: boolean;
  testTwilioConnection?: boolean;
  // Added for OTP
  messageType?: 'otp' | 'regular'; // Distinguish message types
  otpCode?: string; // OTP code to send
}

function formatWhatsAppNumber(number: string): string {
  if (!number) {
    throw new Error('Phone number is required');
  }
  console.log(`Formatting number: ${number}`);
  if (number.startsWith('whatsapp:+')) {
    return number;
  }
  let cleaned = number.startsWith('whatsapp:') ? number.substring(9) : number;
  cleaned = cleaned.trim();
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/^\+*/, '').replace(/\D/g, '');
  } else {
    cleaned = '+' + cleaned.substring(1).replace(/\D/g, '');
  }
  if (cleaned.length < 9) {
    throw new Error(`Phone number ${cleaned} is too short, please include country code`);
  }
  console.log(`Formatted to: whatsapp:${cleaned}`);
  return `whatsapp:${cleaned}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    let requestBody: WhatsAppRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON in request body', details: String(parseError) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const { 
      to, 
      message, 
      category, 
      isPro, 
      skipSubscriptionCheck, 
      userId, 
      scheduledTime, 
      sendImmediately, 
      checkOnly,
      debugMode,
      extraDebugging,
      testTwilioConnection,
      messageType, // Get messageType
      otpCode      // Get otpCode
    } = requestBody;

    // Check for Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const storedFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID'); // Use configured SID
    
    console.log('Twilio credentials check:', { 
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 3)}` : 'missing',
      authToken: authToken ? 'present (hidden)' : 'missing',
      fromNumber: storedFromNumber ? 'present' : 'missing',
      verifyToken: verifyToken ? 'present' : 'missing',
      messagingServiceSid: messagingServiceSid ? `${messagingServiceSid.substring(0, 5)}...` : 'missing (will use fromNumber if available)'
    });

    if (checkOnly) {
      // ... (checkOnly logic remains the same) ...
      return new Response(JSON.stringify({ success: true, twilioConfigured: !!(accountSid && authToken), /* ... */ }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (testTwilioConnection) {
      // ... (testTwilioConnection logic remains the same) ...
      return new Response(JSON.stringify({ success: true, message: "Successfully connected...", /* ... */ }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('WhatsApp request received:', { 
      to, category, isPro, scheduledTime, sendImmediately, debugMode, extraDebugging, messageType, 
      messageLength: message ? message.length : 0,
      otpCodeProvided: !!otpCode,
      toFormatted: to ? to.substring(0, 5) + '...' : undefined,
      usingMessagingService: !!messagingServiceSid
    });

    if (!to || to.trim().length < 9) {
      // ... (phone number validation remains the same) ...
      return new Response(JSON.stringify({ success: false, error: 'Invalid phone number provided', /* ... */ }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!accountSid || !authToken) {
      // ... (credential validation remains the same) ...
      return new Response(JSON.stringify({ success: false, error: 'Missing Twilio credentials', /* ... */ }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!sendImmediately && scheduledTime) {
      // ... (scheduling logic remains the same) ...
      return new Response(JSON.stringify({ success: true, scheduled: true, /* ... */ }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    let nickname = "there";
    if (userId) {
      // ... (nickname lookup remains the same) ...
    }

    let toNumber;
    try {
      toNumber = formatWhatsAppNumber(to);
      console.log(`Formatted recipient phone number from ${to} to ${toNumber}`);
    } catch (formatError) {
      // ... (recipient number formatting error handling remains the same) ...
      return new Response(JSON.stringify({ success: false, error: String(formatError), /* ... */ }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    console.log('TWILIO_FROM_NUMBER from environment:', storedFromNumber);
    console.log('TWILIO_MESSAGING_SERVICE_SID from environment:', messagingServiceSid);
    
    if (!messagingServiceSid && !storedFromNumber) {
      // ... (sender configuration validation remains the same) ...
      return new Response(JSON.stringify({ success: false, error: "Missing sender configuration", /* ... */ }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    let fromNumber;
    if (!messagingServiceSid) {
      try {
        fromNumber = formatWhatsAppNumber(storedFromNumber);
        console.log(`Formatted sender phone number from ${storedFromNumber} to ${fromNumber}`);
      } catch (formatError) {
        // ... (sender number formatting error handling remains the same) ...
        return new Response(JSON.stringify({ success: false, error: `Invalid sender phone number: ${String(formatError)}`, /* ... */ }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // --- Prepare Twilio Payload - REMOVED Dummy Body for OTP --- 
    let twilioPayload: { [key: string]: string } = {};
    const otpTemplateSid = 'HXe0e06a16d020765e0bf19ee73f35166b'; // The Template SID you provided

    if (messageType === 'otp') {
      console.log("Detected OTP message type.");
      if (!otpCode) {
        console.error("Error: otpCode is required when messageType is 'otp' but was not provided.");
        throw new Error("otpCode is required when messageType is 'otp'");
      }
      
      twilioPayload = {
        To: toNumber, 
        ContentSid: otpTemplateSid, 
        ContentVariables: JSON.stringify({ '1': otpCode }), 
        // REMOVED: Dummy Body parameter
        // Body: `Your OTP code is ${otpCode}` 
      };
      
      // Add 'From' or 'MessagingServiceSid'
      if (messagingServiceSid) {
        twilioPayload.MessagingServiceSid = messagingServiceSid; 
      } else if (fromNumber) {
        twilioPayload.From = fromNumber; 
      } else {
         console.error("Error: Missing sender configuration (fromNumber or messagingServiceSid) for OTP.");
         throw new Error("Missing sender configuration (fromNumber or messagingServiceSid)");
      }
      console.log(`Preparing to send OTP template ${otpTemplateSid} to ${toNumber}`);

    } else {
      // Handle regular message (existing logic)
      console.log("Detected regular message type (or messageType not specified).");
      let finalMessage = message;
      
      // Generate message content if not provided directly
      if (!finalMessage && category) {
        // ... (existing logic to generate vocab words message) ...
        const vocabWords = [
          { word: "articulate", definition: "expressed, formulated, or presented with clarity", example: "She is known for her articulate explanations of complex topics." },
          { word: "resilient", definition: "able to withstand or recover quickly from difficult conditions", example: "The resilient community rebuilt after the disaster." },
          { word: "pragmatic", definition: "dealing with things sensibly and realistically", example: "We need a pragmatic approach to solve this issue." },
          { word: "perspicacious", definition: "having keen insight or understanding", example: "His perspicacious observation helped solve the mystery." },
          { word: "eloquent", definition: "fluent or persuasive in speaking or writing", example: "The politician gave an eloquent speech that moved the audience." }
        ];
        const header = `🌟 *Hi ${nickname}! Here are Your VocabSpark Words* 🌟\n\n`;
        const wordsList = vocabWords.map((word, index) => 
          `*${index + 1}. ${word.word}*\nDefinition: ${word.definition}\nExample: _"${word.example}"_\n\n`
        ).join('');
        const footer = isPro 
          ? `\n🚀 *${nickname}, thank you for being a Pro subscriber!*`
          : `\n👉 Hey ${nickname}, upgrade to Pro for custom word categories and more features!`;
        finalMessage = header + wordsList + footer;
      }
      
      // Add welcome message for immediate signup deliveries
      if (sendImmediately) {
         finalMessage = `👋 Welcome to GlintUp, ${nickname}!\n\nYou're all set to receive your daily vocabulary words via WhatsApp. Your first set will arrive at your selected time. Enjoy boosting your word power!\n\n(This is your free trial. Upgrade anytime in the dashboard!)`;
      }

      if (!finalMessage) {
        console.error("Error: Message content is empty or could not be generated for regular message.");
        throw new Error("Message content is empty or could not be generated.");
      }

      twilioPayload = {
        To: toNumber, 
        Body: finalMessage, 
      };
      
      // Add 'From' or 'MessagingServiceSid'
      if (messagingServiceSid) {
        twilioPayload.MessagingServiceSid = messagingServiceSid; 
      } else if (fromNumber) {
        twilioPayload.From = fromNumber; 
      } else {
         console.error("Error: Missing sender configuration (fromNumber or messagingServiceSid) for regular message.");
         throw new Error("Missing sender configuration (fromNumber or messagingServiceSid)");
      }
      console.log(`Preparing to send regular message to ${toNumber}`);
      console.log(`Message content (first 50 chars): ${finalMessage.substring(0, 50)}...`);
    }
    // --- END MODIFIED SECTION ---

    // Send message via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const basicAuth = btoa(`${accountSid}:${authToken}`);

    console.log('Sending Twilio API request:', { url: twilioUrl, method: 'POST' });
    if (extraDebugging) {
      console.log('Twilio Payload:', JSON.stringify(twilioPayload));
    }

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded', // Twilio expects form encoding
      },
      body: new URLSearchParams(twilioPayload).toString(), // Encode payload as form data
    });

    console.log('Twilio API response status:', response.status);
    const responseData = await response.json();
    console.log('Twilio response data:', JSON.stringify(responseData).substring(0, 200) + '...'); // Log truncated response

    if (!response.ok) {
      console.error('Twilio API error:', responseData);
      throw new Error(`Twilio API Error: ${response.status} - ${responseData.message || 'Unknown error'}`);
    }

    console.log('WhatsApp message sent successfully:', responseData.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp message sent successfully",
        twilioSid: responseData.sid,
        status: responseData.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


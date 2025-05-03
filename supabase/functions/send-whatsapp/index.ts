
// /home/ubuntu/glintup_project/supabase/functions/send-whatsapp/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

interface FunctionErrorDetails {
  status?: number;
  statusText?: string;
  responseText?: string;
  message?: string;
  providedNumber?: string;
  tip?: string;
  suggestion?: string;
  configurationStatus?: Record<string, string>;
  originalError?: string;
  twilioError?: any;
}

interface TwilioConfigStatus {
  accountSid?: string | null;
  authToken?: string | null;
  storedFromNumber?: string | null;
  verifyToken?: string | null;
  messagingServiceSid?: string | null;
}

/**
 * Format phone number for WhatsApp
 */
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

/**
 * Validate Twilio configuration
 */
function validateTwilioConfig(): TwilioConfigStatus {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const storedFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
  const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
  const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
  
  console.log('Twilio credentials check:', { 
    accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 3)}` : 'missing',
    authToken: authToken ? 'present (hidden)' : 'missing',
    fromNumber: storedFromNumber ? 'present' : 'missing',
    verifyToken: verifyToken ? 'present' : 'missing',
    messagingServiceSid: messagingServiceSid ? `${messagingServiceSid.substring(0, 5)}...` : 'missing (will use fromNumber if available)'
  });

  return {
    accountSid,
    authToken,
    storedFromNumber,
    verifyToken,
    messagingServiceSid
  };
}

/**
 * Get configuration status
 */
function getConfigStatus(twilioConfig: TwilioConfigStatus) {
  const { accountSid, authToken, storedFromNumber, verifyToken, messagingServiceSid } = twilioConfig;
  
  return {
    success: true, 
    webhookUrl: "https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/whatsapp-webhook",
    fromNumber: storedFromNumber,
    currentFromNumber: storedFromNumber,
    messagingServiceSid,
    twilioConfigured: !!(accountSid && authToken),
    fromNumberConfigured: !!storedFromNumber,
    messagingServiceConfigured: !!messagingServiceSid,
    verifyTokenConfigured: !!verifyToken,
    note: "At least one of fromNumber or messagingServiceSid must be configured",
    configStatus: {
      accountSid: accountSid ? 'configured' : 'missing',
      authToken: authToken ? 'configured' : 'missing',
      fromNumber: storedFromNumber || 'not configured',
      messagingServiceSid: messagingServiceSid || 'not configured',
      verifyToken: verifyToken ? 'configured' : 'not configured'
    },
    configRequired: {
      TWILIO_ACCOUNT_SID: false,
      TWILIO_AUTH_TOKEN: false,
      TWILIO_FROM_NUMBER: false,
      TWILIO_MESSAGING_SERVICE_SID: true,
      WHATSAPP_VERIFY_TOKEN: true
    },
    missingConfigHints: {
      TWILIO_AUTH_TOKEN: null
    },
    troubleshooting: {
      missingCredentials: "Set the TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your Supabase project secrets",
      missingFromNumber: "Set the TWILIO_FROM_NUMBER in your Supabase project secrets (include the + in the number)",
      twilioHelp: "Make sure your Twilio account has WhatsApp enabled and the Sandbox is set up correctly"
    }
  };
}

/**
 * Test connection to Twilio API
 */
async function testTwilioConnection(accountSid: string, authToken: string) {
  try {
    // Make a simple API call to Twilio to test credentials
    const basicAuth = btoa(`${accountSid}:${authToken}`);
    const twilioTestUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`;
    
    console.log('Testing Twilio API connection...');
    const testResponse = await fetch(twilioTestUrl, {
      headers: { 'Authorization': `Basic ${basicAuth}` }
    });
    
    const testResponseData = await testResponse.json();
    console.log(`Twilio API connection test result: ${testResponse.status}`);
    
    if (!testResponse.ok) {
      return {
        success: false,
        error: "Failed to connect to Twilio API with provided credentials",
        status: testResponse.status,
        twilioResponse: testResponseData
      };
    }
    
    return {
      success: true,
      message: "Successfully connected to Twilio API",
      accountName: testResponseData.friendly_name,
      accountStatus: testResponseData.status,
      twilioResponse: testResponseData
    };
  } catch (error) {
    console.error("Error testing Twilio API connection:", error);
    return {
      success: false,
      error: "Error connecting to Twilio API",
      details: String(error)
    };
  }
}

/**
 * Fetch user nickname
 */
async function fetchUserNickname(userId: string | undefined, supabaseClient: ReturnType<typeof createClient>) {
  let nickname = "there";
  if (userId) {
    try {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, nick_name')
        .eq('id', userId)
        .single();
      
      if (profile) {
        nickname = profile.nick_name || profile.first_name || nickname;
      }
    } catch (profileError) {
      console.log(`Could not find nickname for user ${userId}, using default`);
    }
  }
  return nickname;
}

/**
 * Prepare Twilio payload for OTP message
 */
function prepareOtpPayload(toNumber: string, otpCode: string) {
  const otpTemplateSid = 'HXe0e06a16d020765e0bf19ee73f35166b'; // The Template SID for OTP
  
  return {
    To: toNumber, 
    ContentSid: otpTemplateSid, 
    ContentVariables: JSON.stringify({ '1': otpCode }),
  };
}

/**
 * Check if a date is after the current date
 */
function isDateAfter(dateToCheck: string | Date, compareDate: Date = new Date()): boolean {
  const checkDate = typeof dateToCheck === 'string' ? new Date(dateToCheck) : dateToCheck;
  return checkDate > compareDate;
}

/**
 * Generate message content
 */
function generateMessageContent(message: string | undefined, 
                              category: string | undefined,
                              isPro: boolean | undefined, 
                              nickname: string, 
                              sendImmediately: boolean | undefined) {
  if (message) {
    return message;
  }

  if (sendImmediately) {
    return `👋 Welcome to VocabSpark, ${nickname}!\n\nYou're all set to receive your daily vocabulary words via WhatsApp. Your first set will arrive at your selected time. Enjoy boosting your word power!\n\n(This is your free trial. Upgrade anytime in the dashboard!)`;
  }

  if (category) {
    // Sample words for demonstration
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
    
    return header + wordsList + footer;
  }

  throw new Error("Message content is empty or could not be generated.");
}

/**
 * Prepare message payload
 */
function prepareMessagePayload(toNumber: string, message: string) {
  return {
    To: toNumber,
    Body: message
  };
}

/**
 * Add sender information to payload
 * Fixed to prioritize fromNumber when messagingServiceSid causes issues
 */
function addSenderToPayload(payload: Record<string, string>, 
                          fromNumber: string | undefined, 
                          messagingServiceSid: string | undefined,
                          extraDebugging: boolean | undefined) {
                          
  // Always prioritize using the from number if it exists to avoid messaging service issues
  if (fromNumber) {
    if (extraDebugging) {
      console.log(`Using From Number: ${fromNumber} (prioritized to avoid Messaging Service issues)`);
    }
    console.log(`Sending WhatsApp message from ${fromNumber} to ${payload.To}`);
    return { ...payload, From: fromNumber };
  } else if (messagingServiceSid) {
    if (extraDebugging) {
      console.log(`Using Messaging Service SID: ${messagingServiceSid} (only when From Number not available)`);
      console.log(`WARNING: Messaging Service may cause Error 21701 if not correctly configured`);
    }
    console.log(`Sending WhatsApp message using Messaging Service: ${messagingServiceSid} to ${payload.To}`);
    return { ...payload, MessagingServiceSid: messagingServiceSid };
  }
  
  throw new Error("Missing sender configuration (both fromNumber and messagingServiceSid)");
}

/**
 * Send WhatsApp message via Twilio API
 */
async function sendTwilioMessage(twilioPayload: Record<string, string>, accountSid: string, authToken: string, extraDebugging: boolean | undefined) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const basicAuth = btoa(`${accountSid}:${authToken}`);

  // Log the API request details
  console.log('Twilio API request:', { 
    url: twilioUrl, 
    to: twilioPayload.To,
    messagingService: twilioPayload.MessagingServiceSid || undefined,
    from: twilioPayload.MessagingServiceSid ? "using messaging service" : twilioPayload.From,
    messageLength: twilioPayload.Body?.length || 0
  });

  if (extraDebugging) {
    // Only log full payload if extra debugging is enabled
    console.log('Twilio Payload:', JSON.stringify(twilioPayload));
    
    // Add detailed debugging of request
    console.log('Full request details:', {
      method: 'POST',
      auth: `${accountSid}:${authToken.substring(0, 3)}...`,
      contentType: 'application/x-www-form-urlencoded',
      requestBody: new URLSearchParams(twilioPayload).toString()
    });
  }

  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(twilioPayload).toString(),
    });

    console.log('Twilio API response status:', response.status);
    
    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = await response.json();
      if (extraDebugging) {
        console.log('Twilio response data:', JSON.stringify(responseData).substring(0, 200) + '...');
      }
    } catch (jsonError) {
      // If we can't parse the response as JSON, get the text instead
      const responseText = await response.text();
      console.error('Error parsing Twilio response as JSON:', jsonError);
      console.error('Twilio response text:', responseText);
      responseData = { error: 'Could not parse Twilio response', responseText };
    }

    // Check if the request was successful
    if (!response.ok) {
      console.error('Twilio API error:', responseData);
      console.error('Twilio error response:', JSON.stringify(responseData));
      
      // Return a detailed error response
      return {
        success: false, 
        error: `Twilio API Error: ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          responseText: responseData.message || JSON.stringify(responseData),
          message: response.status === 404 ? 
            "Twilio account not found or API credentials incorrect. Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN." :
            `Twilio returned error status: ${response.status}`,
          tip: response.status === 404 ? 
            "Make sure you're using the correct Account SID and Auth Token from your Twilio console" :
            "Check your Twilio account status in the Twilio console",
          twilioError: responseData
        }
      };
    }

    console.log('WhatsApp message sent successfully:', responseData.sid);

    // Return success response
    return {
      success: true, 
      message: "WhatsApp message sent successfully",
      messageId: responseData.sid,
      status: responseData.status,
      twilioResponse: responseData,
      instructions: [
        "If the message doesn't arrive, make sure your WhatsApp number is active",
        "For a Twilio Sandbox, you need to join the sandbox by sending the correct code to the Twilio number first"
      ],
      troubleshooting: {
        twilioSandbox: "If using Twilio Sandbox, make sure the recipient has joined your sandbox by sending the 'join' code",
        productionSetup: "If using production, make sure your Twilio account is fully set up and approved for WhatsApp messaging",
        consoleCheck: "Check the message status in your Twilio Console for detailed delivery information"
      }
    };
  } catch (fetchError) {
    console.error('Error making Twilio API request:', fetchError);
    
    return {
      success: false, 
      error: "Failed to connect to Twilio API",
      details: {
        message: String(fetchError),
        suggestion: "Check your network connection and Twilio API credentials",
        originalError: String(fetchError)
      }
    };
  }
}

// Main request handler function
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body', 
          details: String(parseError) 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      testTwilioConnection: shouldTestConnection,
      messageType, 
      otpCode
    } = requestBody;

    // Get Twilio configuration
    const twilioConfig = validateTwilioConfig();
    const { accountSid, authToken, storedFromNumber, messagingServiceSid } = twilioConfig;

    // Check Twilio configuration first - return detailed status
    if (checkOnly) {
      const configStatus = getConfigStatus(twilioConfig);
      return new Response(
        JSON.stringify(configStatus), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test Twilio API connection
    if (shouldTestConnection && accountSid && authToken) {
      const testResult = await testTwilioConnection(accountSid, authToken);
      return new Response(
        JSON.stringify(testResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the request details
    console.log('WhatsApp request received:', { 
      to, 
      category, 
      isPro, 
      scheduledTime, 
      sendImmediately, 
      debugMode, 
      extraDebugging, 
      messageType, 
      messageLength: message ? message.length : 0,
      otpCodeProvided: !!otpCode,
      toFormatted: to ? to.substring(0, 5) + '...' : undefined,
      usingMessagingService: !!messagingServiceSid
    });

    // Validate phone number
    if (!to || to.trim().length < 9) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid phone number provided', 
          providedNumber: to,
          tip: "Phone number should include country code with + prefix (e.g., +919123456789)" 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Twilio credentials
    if (!accountSid || !authToken) {
      console.error("Missing Twilio credentials", { accountSid: !!accountSid, authToken: !!authToken });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing Twilio credentials', 
          configurationStatus: {
            accountSid: accountSid ? 'configured' : 'missing',
            authToken: authToken ? 'configured' : 'missing'
          },
          tip: "Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your Supabase project secrets"
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate that we have at least a from number
    if (!storedFromNumber && !messagingServiceSid) {
      console.error("Missing sender configuration");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing sender configuration", 
          details: "Either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID must be configured in your Supabase secrets",
          suggestion: "Set up at least one of these in your Supabase project secrets" 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle scheduled messages
    if (!sendImmediately && scheduledTime) {
      // Store the message in the database for later sending
      // This is just a placeholder - actual implementation would store this for scheduled sending
      console.log(`Message scheduled to be sent at ${scheduledTime}`);
      return new Response(
        JSON.stringify({ success: true, scheduled: true, scheduledTime }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Lookup user's nickname if userId provided
    const nickname = await fetchUserNickname(userId, supabaseClient);

    // Format the recipient's phone number for WhatsApp
    let toNumber;
    try {
      toNumber = formatWhatsAppNumber(to);
      
      // Add more detailed debugging for recipient number
      if (extraDebugging) {
        console.log(`Recipient number details:`, {
          original: to,
          formatted: toNumber,
          length: toNumber.length,
          hasCountryCode: to.includes('+'),
          hasWhatsAppPrefix: toNumber.startsWith('whatsapp:')
        });
      } else {
        console.log(`Formatted recipient phone number from ${to} to ${toNumber}`);
      }
    } catch (formatError) {
      console.error("Error formatting recipient number:", formatError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: String(formatError), 
          providedNumber: to,
          tip: "Make sure the phone number includes the country code with + prefix" 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('TWILIO_FROM_NUMBER from environment:', storedFromNumber);
    console.log('TWILIO_MESSAGING_SERVICE_SID from environment:', messagingServiceSid);
    
    // Format the sender's number if we have one
    let fromNumber;
    if (storedFromNumber) {
      try {
        fromNumber = formatWhatsAppNumber(storedFromNumber);
        console.log(`Formatted sender phone number from ${storedFromNumber} to ${fromNumber}`);
      } catch (formatError) {
        console.error("Error formatting sender number:", formatError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Invalid sender phone number: ${String(formatError)}`,
            configuredNumber: storedFromNumber,
            tip: "Make sure TWILIO_FROM_NUMBER includes the country code with + prefix, or configure a TWILIO_MESSAGING_SERVICE_SID instead" 
          }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // --- Prepare Twilio Payload --- 
    let twilioPayload: Record<string, string>;
    
    // Configure message based on type
    if (messageType === 'otp') {
      console.log("Sending OTP message");
      if (!otpCode) {
        console.error("Error: otpCode is required for OTP messages but was not provided");
        throw new Error("otpCode is required when messageType is 'otp'");
      }
      
      twilioPayload = prepareOtpPayload(toNumber, otpCode);
      
    } else {
      // Handle regular message
      console.log("Sending regular message");
      
      // Generate message content
      let finalMessage;
      try {
        finalMessage = generateMessageContent(message, category, isPro, nickname, sendImmediately);
      } catch (messageError) {
        console.error("Error generating message content:", messageError);
        throw new Error("Message content is empty or could not be generated.");
      }

      twilioPayload = prepareMessagePayload(toNumber, finalMessage);
    }
    
    // Add sender information (prioritize From number over MessagingServiceSid)
    try {
      twilioPayload = addSenderToPayload(twilioPayload, fromNumber, messagingServiceSid, extraDebugging);
    } catch (senderError) {
      console.error("Error adding sender information:", senderError);
      throw new Error("Missing sender configuration (fromNumber or messagingServiceSid)");
    }

    // Debug the message content
    if (messageType !== 'otp') {
      console.log(`Message content (first 50 chars): ${twilioPayload.Body?.substring(0, 50)}...`);
    } else {
      console.log(`Preparing to send OTP template to ${toNumber}`);
    }

    // Send message via Twilio API
    console.log('Preparing to send message with Twilio API');
    
    const sendResult = await sendTwilioMessage(twilioPayload, accountSid, authToken, extraDebugging);
    
    if (!sendResult.success) {
      return new Response(
        JSON.stringify(sendResult),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Filter twilioResponse for non-debug mode
    if (!debugMode && sendResult.twilioResponse) {
      delete sendResult.twilioResponse;
    }
    
    return new Response(
      JSON.stringify(sendResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
      
  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error sending WhatsApp message',
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

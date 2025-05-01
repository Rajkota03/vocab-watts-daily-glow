
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
}

function formatWhatsAppNumber(number: string): string {
  if (!number) {
    throw new Error('Phone number is required');
  }
  
  // For debugging - log the input number
  console.log(`Formatting number: ${number}`);
  
  // If already properly formatted with whatsapp: prefix, return it
  if (number.startsWith('whatsapp:+')) {
    return number;
  }
  
  // Remove any "whatsapp:" prefix if present
  let cleaned = number.startsWith('whatsapp:') ? number.substring(9) : number;
  
  // Ensure we have a plus sign
  cleaned = cleaned.trim();
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/^\+*/, '').replace(/\D/g, '');
  } else {
    // Keep the plus sign but remove non-digits
    cleaned = '+' + cleaned.substring(1).replace(/\D/g, '');
  }
  
  // Validate minimum length (country code + at least 8 digits)
  if (cleaned.length < 9) {
    throw new Error(`Phone number ${cleaned} is too short, please include country code`);
  }
  
  // Log the formatted number for debugging
  console.log(`Formatted to: whatsapp:${cleaned}`);
  
  return `whatsapp:${cleaned}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json() as WhatsAppRequest;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: String(parseError)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
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
      testTwilioConnection
    } = requestBody;

    // Check for Twilio credentials with detailed logging
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const storedFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    
    console.log('Twilio credentials check:', { 
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 3)}` : 'missing',
      authToken: authToken ? 'present (hidden)' : 'missing',
      fromNumber: storedFromNumber ? 'present' : 'missing',
      verifyToken: verifyToken ? 'present' : 'missing'
    });

    // If only checking configuration, return status
    if (checkOnly) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          twilioConfigured: !!(accountSid && authToken),
          fromNumberConfigured: !!storedFromNumber,
          verifyTokenConfigured: !!verifyToken,
          configStatus: {
            accountSid: accountSid ? 'configured' : 'missing',
            authToken: authToken ? 'configured' : 'missing',
            fromNumber: storedFromNumber ? 'configured' : 'missing',
            verifyToken: verifyToken ? 'configured' : 'missing'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle connection test request
    if (testTwilioConnection) {
      if (!accountSid || !authToken) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Missing Twilio credentials",
            configStatus: {
              accountSid: accountSid ? 'configured' : 'missing',
              authToken: authToken ? 'configured' : 'missing',
              fromNumber: storedFromNumber ? 'configured' : 'missing',
              verifyToken: verifyToken ? 'configured' : 'missing'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        console.log("Testing direct Twilio API connection");
        
        // Fetch account information to test connection
        const accountInfoResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!accountInfoResponse.ok) {
          const errorText = await accountInfoResponse.text();
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to connect to Twilio API: ${accountInfoResponse.status}`,
              details: errorText
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const accountInfo = await accountInfoResponse.json();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Successfully connected to Twilio API",
            accountInfo: {
              friendlyName: accountInfo.friendly_name,
              status: accountInfo.status,
              type: accountInfo.type,
              createdAt: accountInfo.date_created
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (connErr) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Connection test failed: ${String(connErr)}`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('WhatsApp request received:', { 
      to, 
      category, 
      isPro, 
      scheduledTime, 
      sendImmediately,
      debugMode,
      extraDebugging,
      messageLength: message ? message.length : 0,
      toFormatted: to ? to.substring(0, 5) + '...' : undefined
    });

    // Validate required fields
    if (!to || to.trim().length < 9) {
      const errorMessage = 'Invalid phone number provided';
      console.error(errorMessage, { phoneNumber: to });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: { 
            message: "Please provide a valid phone number with country code.",
            providedNumber: to
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!accountSid || !authToken) {
      const errorMessage = 'Missing Twilio credentials';
      console.error(errorMessage, { 
        hasSid: !!accountSid, 
        hasToken: !!authToken 
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: { 
            message: "Please check that TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in Supabase environment variables.",
            configurationStatus: {
              TWILIO_ACCOUNT_SID: accountSid ? "configured" : "missing",
              TWILIO_AUTH_TOKEN: authToken ? "configured" : "missing"
            }
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If we're sending immediately as requested from signup, skip scheduling
    if (!sendImmediately && scheduledTime) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: scheduleError } = await supabaseClient
          .from('scheduled_messages')
          .insert({
            phone_number: to,
            message,
            category,
            is_pro: isPro,
            scheduled_time: scheduledTime,
            user_id: userId
          });

        if (scheduleError) {
          console.error('Error scheduling message:', scheduleError);
          throw new Error(`Failed to schedule message: ${scheduleError.message}`);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            scheduled: true,
            scheduledTime,
            message: "Message scheduled successfully"
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (scheduleErr) {
        console.error('Error in message scheduling:', scheduleErr);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to schedule message: ${String(scheduleErr)}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Initialize Supabase client for user profile lookups
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get nickname from profile if user ID provided
    let nickname = "there";
    if (userId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('nick_name, first_name')
        .eq('id', userId)
        .single();

      if (profile) {
        nickname = profile.nick_name || profile.first_name || nickname;
      }
    }

    // Format WhatsApp number for recipient with enhanced error handling
    let toNumber;
    try {
      toNumber = formatWhatsAppNumber(to);
      console.log(`Formatted recipient phone number from ${to} to ${toNumber}`);
      
      if (extraDebugging) {
        console.log('Recipient number details:', {
          original: to,
          formatted: toNumber,
          length: toNumber.length,
          hasCountryCode: toNumber.includes('+'),
          hasWhatsAppPrefix: toNumber.startsWith('whatsapp:')
        });
      }
    } catch (formatError) {
      console.error('Error formatting phone number:', formatError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: String(formatError),
          details: { 
            message: "Could not format phone number properly.",
            providedNumber: to,
            tip: "Make sure your number includes the country code (e.g., +1 for US, +91 for India)"
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get the from number from environment variables with better logging
    console.log('TWILIO_FROM_NUMBER from environment:', storedFromNumber);
    
    if (!storedFromNumber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing sender WhatsApp number",
          details: { 
            message: "The TWILIO_FROM_NUMBER is not set in Supabase environment variables.",
            required: "Set TWILIO_FROM_NUMBER in Supabase secrets"
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Default to WhatsApp Business number if no number is provided
    const defaultNumber = '+918978354242';
    let fromNumber;
    let isTwilioSandbox = false;
    
    // Check if using Twilio sandbox number
    isTwilioSandbox = storedFromNumber === '+14155238886';
    
    // Format the from number properly with error handling
    try {
      fromNumber = formatWhatsAppNumber(storedFromNumber);
      console.log(`Formatted sender phone number from ${storedFromNumber} to ${fromNumber}`);
    } catch (formatError) {
      console.error('Error formatting from number:', formatError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid sender phone number: ${String(formatError)}`,
          details: { 
            message: "The configured TWILIO_FROM_NUMBER is invalid.",
            providedNumber: storedFromNumber,
            suggestion: "Make sure the number includes the country code (e.g. +1 for US or +91 for India)"
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Using from number:', fromNumber, isTwilioSandbox ? '(Twilio Sandbox)' : '(WhatsApp Business)');
    
    // Generate message content
    let finalMessage = message;
    if (!finalMessage && category) {
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
    
    // For immediate signup deliveries, add a special welcome message
    if (sendImmediately) {
      finalMessage = `Welcome to VocabSpark! 🎉\n\n${finalMessage || ''}`;
      console.log('Sending immediate welcome message to new signup:', toNumber);
    }
    
    // Add sandbox instructions only for the Twilio sandbox number
    if (finalMessage && isTwilioSandbox) {
      finalMessage += `\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.`;
    } else if (!finalMessage) {
      if (isTwilioSandbox) {
        finalMessage = `Hello ${nickname}! This is a test message from VocabSpark.\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.`;
      } else {
        finalMessage = `Hello ${nickname}! This is a test message from VocabSpark.`;
      }
    }
    
    if (debugMode || extraDebugging) {
      console.log(`Debug mode enabled. Extra logging will be performed.`);
    }
    
    console.log(`Sending WhatsApp message from ${fromNumber} to ${toNumber}`);
    console.log(`Message content (first 50 chars): ${finalMessage.substring(0, 50)}...`);
    
    // Send message via Twilio API with enhanced error handling
    try {
      console.log('Preparing to send message with Twilio API');
      
      // Create the request body
      const requestBody = new URLSearchParams();
      
      // Set To and From numbers
      requestBody.append('To', toNumber);
      requestBody.append('From', fromNumber);
      requestBody.append('Body', finalMessage);
      
      const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      console.log('Twilio API request:', {
        url: apiUrl,
        to: toNumber,
        from: fromNumber,
        messageLength: finalMessage.length,
      });
      
      if (debugMode || extraDebugging) {
        console.log('Full request details:', {
          method: 'POST',
          auth: `${accountSid}:${authToken.substring(0, 3)}...`,
          contentType: 'application/x-www-form-urlencoded',
          requestBody: requestBody.toString()
        });
      }
      
      const twilioResponse = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody.toString(),
        }
      );

      console.log('Twilio API response status:', twilioResponse.status);
      
      // Check if response is ok before attempting to parse JSON
      if (!twilioResponse.ok) {
        let errorText;
        try {
          errorText = await twilioResponse.text();
          console.error('Twilio error response:', errorText);
        } catch (textError) {
          errorText = `Could not get error text: ${String(textError)}`;
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Twilio API error: ${twilioResponse.status}`,
            details: {
              status: twilioResponse.status,
              statusText: twilioResponse.statusText,
              responseText: errorText
            }
          }),
          {
            status: twilioResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      let twilioData;
      try {
        twilioData = await twilioResponse.json();
        console.log('Twilio response data:', JSON.stringify(twilioData).substring(0, 200) + '...');
        
        if (extraDebugging) {
          console.log('Complete Twilio response:', JSON.stringify(twilioData));
        }
      } catch (jsonError) {
        console.error('Error parsing Twilio response:', jsonError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Could not parse Twilio response: ${String(jsonError)}`,
            twilioStatus: twilioResponse.status
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('WhatsApp message sent successfully:', twilioData.sid);

      // Add clearer instructions based on response
      const responseData = {
        success: true, 
        messageId: twilioData.sid,
        status: twilioData.status,
        details: twilioData,
        usingMetaIntegration: !isTwilioSandbox,
        to: toNumber,
        from: fromNumber,
        rawTo: to, // Include the original number for comparison
        rawFrom: storedFromNumber
      };
      
      if (isTwilioSandbox) {
        responseData.instructions = [
          "You must join the Twilio sandbox first!",
          "Send 'join part-every' to +1 415 523 8886 on WhatsApp",
          "Then try sending the test message again"
        ];
      } else if (twilioData.status === "queued") {
        responseData.instructions = [
          "Message is queued for delivery.",
          "If you don't receive it, verify your WhatsApp Business Provider is properly set up.",
          "Make sure the recipient number is properly formatted with country code."
        ]; 
      }

      // Get current URL for hostname construction for webhook information
      const requestUrl = new URL(req.url);
      const hostname = requestUrl.hostname;
      const protocol = hostname.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${hostname}`;
      const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
      
      responseData.webhookUrl = webhookUrl;

      // Include common troubleshooting info in the response
      responseData.troubleshooting = {
        checkPhoneFormat: !to.includes('+') ? "Add country code with + to your phone number" : "Phone format looks good",
        checkSandbox: isTwilioSandbox ? "You're using Twilio Sandbox - send 'join part-every' to +1 415 523 8886" : "You're using WhatsApp Business API",
        messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
        verifyInternet: "Ensure recipient's phone has internet connection",
        appNeeded: "Make sure recipient has WhatsApp installed"
      };

      return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (twilioError) {
      console.error('Error during Twilio API call:', twilioError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioError.message || 'Network error while calling Twilio API',
          details: {
            message: "There was an error communicating with the Twilio API.",
            originalError: String(twilioError)
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Unhandled error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message',
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

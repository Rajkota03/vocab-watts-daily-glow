
// /home/ubuntu/glintup_project/supabase/functions/send-whatsapp/index.ts

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

// Function to test the Twilio account connection
async function testTwilioConnection(detailed: boolean = false) {
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!twilioAccountSid || !twilioAuthToken) {
      return {
        success: false,
        error: "Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your Supabase secrets.",
      };
    }
    
    // Create a Twilio client
    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    // Test the connection by fetching the account details
    const account = await client.api.accounts(twilioAccountSid).fetch();
    
    // Extract only what we need to return, never expose the full account details
    return {
      success: true,
      accountName: account.friendlyName,
      accountStatus: account.status,
      accountSidPrefix: twilioAccountSid.substring(0, 6),
      accountType: account.type,
      dateCreated: account.dateCreated
    };
  } catch (error) {
    console.error("Twilio connection test error:", error);
    
    let errorResponse: any = {
      success: false,
      error: "Failed to connect to Twilio API"
    };
    
    // Add more details if requested
    if (detailed) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      errorResponse.accountSidPrefix = twilioAccountSid?.substring(0, 6);
      
      if (error.code) {
        errorResponse.errorCode = error.code;
      }
      
      if (error.message) {
        errorResponse.error = error.message;
      }
      
      if (error.status) {
        errorResponse.status = error.status;
      }
    }
    
    return errorResponse;
  }
}

// Function to test the Messaging Service SID specifically
async function testMessagingService(detailed: boolean = false) {
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
    
    if (!twilioAccountSid || !twilioAuthToken) {
      return {
        messagingServiceValid: false,
        error: "Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your Supabase secrets."
      };
    }
    
    if (!messagingServiceSid) {
      return {
        messagingServiceValid: false,
        error: "Missing TWILIO_MESSAGING_SERVICE_SID in your Supabase secrets."
      };
    }
    
    // Create a Twilio client
    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    try {
      // Test the connection by fetching the specific messaging service
      const service = await client.messaging.services(messagingServiceSid).fetch();
      
      return {
        messagingServiceValid: true,
        messagingServiceName: service.friendlyName,
        messagingServiceSidPrefix: messagingServiceSid.substring(0, 6),
        inboundRequestUrl: service.inboundRequestUrl,
        status: service.status
      };
    } catch (msError) {
      console.error("Error fetching messaging service:", msError);
      
      return {
        messagingServiceValid: false,
        error: msError.message || "Messaging Service not found or access denied",
        errorCode: msError.code || "Unknown",
        messagingServiceSidPrefix: messagingServiceSid.substring(0, 6)
      };
    }
  } catch (error) {
    console.error("Messaging service test error:", error);
    
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
    
    return {
      messagingServiceValid: false,
      error: error.message || "Failed to test Messaging Service SID",
      messagingServiceSidPrefix: messagingServiceSid?.substring(0, 6)
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();

    // --- Handle test connection request ---
    if (reqBody.testTwilioConnection === true) {
      console.log("Testing direct Twilio API connection");
      const testResult = await testTwilioConnection(reqBody.detailed === true);
      return new Response(JSON.stringify(testResult), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // --- Handle messaging service test request ---
    if (reqBody.testMessagingService === true) {
      console.log("Testing Twilio Messaging Service");
      const msTestResult = await testMessagingService(reqBody.detailed === true);
      return new Response(JSON.stringify(msTestResult), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Check if only configuration check is requested ---
    if (reqBody.checkOnly === true) {
      // Check Twilio credentials are configured
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      const whatsappVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
      
      // Log the credentials check (without exposing actual values)
      console.log("Twilio credentials check:", {
        accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...${twilioAccountSid.substring(twilioAccountSid.length - 3)}` : "missing",
        authToken: twilioAuthToken ? "present (hidden)" : "missing",
        fromNumber: twilioFromNumber ? "present" : "missing",
        verifyToken: whatsappVerifyToken ? "present" : "missing",
        messagingServiceSid: messagingServiceSid ? `${messagingServiceSid.substring(0, 6)}...` : "missing"
      });
      
      let configResult = {
        twilioConfigured: !!(twilioAccountSid && twilioAuthToken),
        fromNumberConfigured: !!twilioFromNumber,
        messagingServiceConfigured: !!messagingServiceSid,
        verifyTokenConfigured: !!whatsappVerifyToken,
        success: true
      };
      
      // If verifying credentials is requested, test the connection
      if (reqBody.verifyCredentials && configResult.twilioConfigured) {
        try {
          const testResult = await testTwilioConnection(false);
          configResult.accountVerified = testResult.success;
          if (testResult.success) {
            configResult.accountName = testResult.accountName;
            configResult.accountStatus = testResult.accountStatus;
          }
        } catch (verifyError) {
          console.error("Error verifying credentials:", verifyError);
          configResult.accountVerified = false;
          configResult.verifyError = verifyError.message;
        }
      }
      
      return new Response(JSON.stringify(configResult), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Process actual WhatsApp message sending ---
    // Initialize Twilio client
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
    const messagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
    
    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your Supabase secrets.');
    }
    
    if (!twilioFromNumber && !messagingServiceSid) {
      throw new Error('Missing Twilio sender configuration. Please set either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID in your Supabase secrets.');
    }
    
    // Create Twilio client
    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    // Extract request parameters
    const { to, message, messageType, otpCode, category, isPro, userId, sendImmediately, debugMode } = reqBody;
    
    // Validate required parameters
    if (!to) {
      throw new Error('Missing required parameter: to (phone number)');
    }
    
    // Format the phone number if needed
    let formattedTo = to;
    if (!to.startsWith('whatsapp:')) {
      formattedTo = `whatsapp:${to}`;
    }
    
    // Determine the message content
    let messageContent = message;
    
    // Handle OTP message type
    if (messageType === 'otp' && otpCode) {
      // If a specific message is already provided, use that
      if (!messageContent) {
        messageContent = `Your VocabSpark verification code is: *${otpCode}*\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;
      }
    }
    
    // If no message content is provided and it's not an OTP, throw an error
    if (!messageContent) {
      throw new Error('Missing required parameter: message');
    }
    
    // Prepare message options
    const messageOptions: any = {
      to: formattedTo,
      body: messageContent,
    };
    
    // Use either messagingServiceSid or from number
    if (messagingServiceSid) {
      messageOptions.messagingServiceSid = messagingServiceSid;
    } else {
      // Format the from number if needed
      let formattedFrom = twilioFromNumber;
      if (!twilioFromNumber.startsWith('whatsapp:')) {
        formattedFrom = `whatsapp:${twilioFromNumber}`;
      }
      messageOptions.from = formattedFrom;
    }
    
    // Add optional statusCallback URL if configured
    const statusCallbackUrl = Deno.env.get('TWILIO_STATUS_CALLBACK_URL');
    if (statusCallbackUrl) {
      messageOptions.statusCallback = statusCallbackUrl;
    }
    
    // Log the message being sent (without exposing full phone numbers)
    console.log('Sending WhatsApp message:', {
      to: `${formattedTo.substring(0, 12)}...`,
      messageType: messageType || 'standard',
      category: category || 'N/A',
      isPro: isPro || false,
      hasUserId: !!userId,
      sendImmediately: sendImmediately || false,
      usingMessagingService: !!messagingServiceSid,
      hasStatusCallback: !!statusCallbackUrl
    });
    
    // Send the message
    try {
      const twilioResponse = await client.messages.create(messageOptions);
      
      console.log('WhatsApp message sent successfully:', {
        sid: twilioResponse.sid,
        status: twilioResponse.status,
        errorCode: twilioResponse.errorCode,
        direction: twilioResponse.direction,
        price: twilioResponse.price
      });
      
      // Prepare the response
      const responseData: any = {
        success: true,
        messageId: twilioResponse.sid,
        status: twilioResponse.status
      };
      
      // For OTP messages, add additional context
      if (messageType === 'otp') {
        responseData.otpSent = true;
        responseData.phoneNumber = to;
      }
      
      // Add debugging information if requested
      if (debugMode) {
        responseData.twilioResponse = {
          sid: twilioResponse.sid,
          status: twilioResponse.status,
          errorCode: twilioResponse.errorCode,
          direction: twilioResponse.direction,
          price: twilioResponse.price,
          dateCreated: twilioResponse.dateCreated
        };
        
        // Add troubleshooting tips
        responseData.troubleshooting = {
          pendingStatus: "If status is 'queued' or 'sending', the message is being processed by Twilio.",
          deliveryTime: "WhatsApp messages may take a few moments to deliver.",
          sandboxTip: "If using a sandbox, make sure the recipient has opted in by sending the correct code to your Twilio number."
        };
      }
      
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (twilioError) {
      console.error('Twilio error sending WhatsApp message:', twilioError);
      
      // Prepare error response
      const errorResponse: any = {
        success: false,
        error: twilioError.message || 'Failed to send WhatsApp message'
      };
      
      // Add detailed error information if debug mode is enabled
      if (debugMode) {
        errorResponse.details = {
          twilioError: {
            code: twilioError.code,
            status: twilioError.status,
            moreInfo: twilioError.moreInfo,
            details: twilioError.details
          },
          providedNumber: to,
          tip: getTwilioErrorTip(twilioError.code)
        };
        
        // If it's a messaging service error, add specific guidance
        if (twilioError.code === 21701) {
          errorResponse.details.suggestion = "Check that your TWILIO_MESSAGING_SERVICE_SID is correct and belongs to the same account as your TWILIO_ACCOUNT_SID.";
          
          // Add the first few characters of the messaging service SID for debugging
          if (messagingServiceSid) {
            errorResponse.details.messagingServiceSidPrefix = messagingServiceSid.substring(0, 6);
          }
        }
      }
      
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Other endpoint logic ---
    // This section would handle other types of requests not covered above
    return new Response(JSON.stringify({ success: false, error: 'Invalid request type' }), {
      status: 400,
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

// Helper function to provide tips based on Twilio error codes
function getTwilioErrorTip(errorCode: number | string | undefined): string {
  if (!errorCode) return "Check your Twilio credentials and message parameters.";
  
  switch (errorCode.toString()) {
    case '20404':
      return "The Twilio Account SID doesn't exist or has been deactivated. Verify your Account SID in the Twilio Console.";
    case '20003':
      return "Authentication failed. Check that your Auth Token is correct.";
    case '21211':
      return "The 'To' phone number is invalid. Make sure it includes the country code (e.g., +1 for US).";
    case '21608':
      return "The 'From' phone number is not a valid WhatsApp sender. Make sure it's enabled for WhatsApp in your Twilio console.";
    case '21610':
      return "The recipient has not opted in to receive WhatsApp messages from this number.";
    case '21701':
      return "The Messaging Service SID is invalid or doesn't belong to this account. Verify it in your Twilio Console.";
    case '63018':
      return "Your Twilio account doesn't have permission to send WhatsApp messages. Check your account status.";
    default:
      return `Error code ${errorCode}: Check the Twilio documentation for more information.`;
  }
}

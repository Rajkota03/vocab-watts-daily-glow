
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

  try {
    // Parse request body
    const { fromNumber, verifyToken, messagingServiceSid, checkOnly, debugMode } = await req.json();
    
    if (debugMode) {
      console.log('Debug mode enabled. Extra logging will be performed.');
    }
    
    if (checkOnly) {
      // Just check current configuration without making changes
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const currentFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      const currentVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      const currentMessagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
      
      // Get current URL for hostname construction
      const requestUrl = new URL(req.url);
      const hostname = requestUrl.hostname;
      const protocol = hostname.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${hostname}`;
      
      // Calculate webhook URL
      const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
      
      // Test if we can access Twilio API
      let twilioApiAccessible = false;
      let twilioApiError = null;
      
      if (twilioAccountSid && twilioAuthToken) {
        try {
          const testResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              }
            }
          );
          
          twilioApiAccessible = testResponse.ok;
          
          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            twilioApiError = {
              status: testResponse.status,
              text: errorText
            };
            console.error("Twilio API test failed:", twilioApiError);
          } else {
            console.log("Twilio API test successful");
          }
        } catch (err) {
          twilioApiError = {
            message: String(err)
          };
          console.error("Error testing Twilio API connection:", err);
        }
      } else {
        console.log("Twilio credentials not configured, skipping API test");
      }
      
      // Check if the auth token is valid (not empty string)
      const validAuthToken = twilioAuthToken && twilioAuthToken.trim() !== '';
      
      if (validAuthToken) {
        console.log("Auth token is configured and not empty");
      } else {
        console.log("Auth token is missing or empty");
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          webhookUrl,
          fromNumber: currentFromNumber || '+918978354242',
          currentFromNumber: currentFromNumber || null,
          messagingServiceSid: currentMessagingServiceSid || null,
          twilioConfigured: !!(twilioAccountSid && validAuthToken),
          verifyTokenConfigured: !!currentVerifyToken,
          twilioApiAccessible,
          twilioApiError,
          configStatus: {
            accountSid: twilioAccountSid ? 'configured' : 'missing',
            authToken: validAuthToken ? 'configured' : 'missing',
            fromNumber: currentFromNumber ? 'configured' : 'missing',
            messagingServiceSid: currentMessagingServiceSid ? 'configured' : 'missing',
            verifyToken: currentVerifyToken ? 'configured' : 'missing'
          },
          configRequired: {
            TWILIO_ACCOUNT_SID: twilioAccountSid ? false : true,
            TWILIO_AUTH_TOKEN: validAuthToken ? false : true,
            TWILIO_FROM_NUMBER: currentFromNumber ? false : true,
            TWILIO_MESSAGING_SERVICE_SID: messagingServiceSid ? false : true,
            WHATSAPP_VERIFY_TOKEN: verifyToken ? false : true
          },
          missingConfigHints: {
            TWILIO_AUTH_TOKEN: validAuthToken ? null : 
              "The Twilio Auth Token is required. Find it in your Twilio Console at https://console.twilio.com/."
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Updating WhatsApp settings", { 
      fromNumber: fromNumber ? fromNumber : "not provided",
      messagingServiceSid: messagingServiceSid ? "provided" : "not provided",
      verifyToken: verifyToken ? "provided" : "not provided" 
    });
    
    // Format phone number correctly
    let phoneNumber = fromNumber;
    if (phoneNumber) {
      // Remove any "whatsapp:" prefix if present
      if (phoneNumber.startsWith('whatsapp:')) {
        phoneNumber = phoneNumber.substring(9);
      }
      
      // Ensure it has a plus sign
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber.replace(/^\+*/, '').replace(/\D/g, '');
      }
      
      console.log(`Formatted phone number to: ${phoneNumber}`);
    } else {
      // If no number is provided, use the default number
      phoneNumber = '+918978354242';
      console.log(`Using default phone number: ${phoneNumber}`);
    }
    
    // Get current URL for hostname construction
    const requestUrl = new URL(req.url);
    const hostname = requestUrl.hostname;
    const protocol = hostname.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostname}`;
    
    // Calculate webhook URL
    const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
    
    console.log("Generated webhook URLs", { webhookUrl });
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    try {
      // Check if current environment variables are set
      const currentFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      const currentVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      const currentMessagingServiceSid = Deno.env.get('TWILIO_MESSAGING_SERVICE_SID');
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      console.log("Current configuration:", { 
        currentFromNumber: currentFromNumber || "not set", 
        currentMessagingServiceSid: currentMessagingServiceSid || "not set",
        hasVerifyToken: currentVerifyToken ? true : false,
        hasSid: twilioAccountSid ? true : false,
        hasAuthToken: twilioAuthToken ? true : false
      });
      
      // Test if we can access Twilio API
      let twilioApiAccessible = false;
      let twilioApiError = null;
      
      if (twilioAccountSid && twilioAuthToken) {
        try {
          const testResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              }
            }
          );
          
          twilioApiAccessible = testResponse.ok;
          
          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            twilioApiError = {
              status: testResponse.status,
              text: errorText
            };
          } else {
            console.log('Twilio API access successful');
          }
        } catch (err) {
          console.error('Error accessing Twilio API:', err);
          twilioApiError = {
            message: String(err)
          };
        }
      }
      
      // Success response with webhook URLs and explicit instructions
      const response = {
        success: true, 
        webhookUrl,
        fromNumber: phoneNumber,
        currentFromNumber: currentFromNumber || null,
        messagingServiceSid: messagingServiceSid || currentMessagingServiceSid || null,
        usingMetaIntegration: true,
        twilioConfigured: !!(twilioAccountSid && twilioAuthToken),
        twilioApiAccessible,
        twilioApiError,
        configRequired: {
          TWILIO_ACCOUNT_SID: twilioAccountSid ? false : true,
          TWILIO_AUTH_TOKEN: twilioAuthToken ? false : true,
          TWILIO_FROM_NUMBER: currentFromNumber ? false : messagingServiceSid ? false : true,
          TWILIO_MESSAGING_SERVICE_SID: messagingServiceSid ? false : currentMessagingServiceSid ? false : currentFromNumber ? false : true,
          WHATSAPP_VERIFY_TOKEN: verifyToken ? false : currentVerifyToken ? false : true
        },
        // Include instructions for manual steps with specific values
        instructions: [
          `1. ${twilioAccountSid ? '✅' : '⚠️'} ${twilioAccountSid ? 'TWILIO_ACCOUNT_SID is configured' : 'Set TWILIO_ACCOUNT_SID in Supabase secrets'}`,
          `2. ${twilioAuthToken ? '✅' : '⚠️'} ${twilioAuthToken ? 'TWILIO_AUTH_TOKEN is configured' : 'Set TWILIO_AUTH_TOKEN in Supabase secrets - Find this in your Twilio console'}`,
          `3. ${currentFromNumber || messagingServiceSid ? '✅' : '⚠️'} ${currentFromNumber ? `TWILIO_FROM_NUMBER is set to: ${currentFromNumber}` : messagingServiceSid ? 'Will use Messaging Service instead of From Number' : 'Set TWILIO_FROM_NUMBER in Supabase secrets to: ' + phoneNumber}`,
          `4. ${currentMessagingServiceSid || messagingServiceSid ? '✅' : '⚠️'} ${currentMessagingServiceSid ? `TWILIO_MESSAGING_SERVICE_SID is set to: ${currentMessagingServiceSid}` : messagingServiceSid ? `Set TWILIO_MESSAGING_SERVICE_SID in Supabase secrets to: ${messagingServiceSid}` : 'Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER must be configured'}`,
          `5. ${currentVerifyToken || verifyToken ? '✅' : '⚠️'} ${currentVerifyToken ? 'WHATSAPP_VERIFY_TOKEN is configured' : verifyToken ? `Set WHATSAPP_VERIFY_TOKEN in Supabase secrets to: ${verifyToken}` : 'Create a WHATSAPP_VERIFY_TOKEN in Supabase secrets (any secure random string)'}`,
          `6. ${twilioApiAccessible ? '✅ Twilio API connection successful' : '⚠️ Could not connect to Twilio API - check your credentials'}`
        ]
      };
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (storageError) {
      console.error("Failed to store WhatsApp settings", storageError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to store settings', 
          details: storageError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error updating WhatsApp settings", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


// /home/ubuntu/glintup_project/supabase/functions/whatsapp-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
// Import Twilio helper library for signature validation
import twilio from 'https://esm.sh/twilio@4.20.1'; // Use a specific version

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
};

// Onboarding flow states
enum OnboardingState {
  Initial = "initial",
  WelcomeSent = "welcome_sent", 
  AskingDeliveryTime = "asking_delivery_time",
  AskingName = "asking_name",
  Complete = "complete"
}

// Helper function for delivery time options
function mapDeliveryTimeResponse(response: string): string | null {
  const lowercaseResponse = response.toLowerCase().trim();
  
  if (lowercaseResponse.includes('1') || lowercaseResponse.includes('morning')) {
    return 'morning';
  } else if (lowercaseResponse.includes('2') || lowercaseResponse.includes('noon')) {
    return 'noon';
  } else if (lowercaseResponse.includes('3') || lowercaseResponse.includes('evening')) {
    return 'evening';
  }
  
  return null;
}

// Helper function to add days to a date without using date-fns
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to parse form-encoded data from raw text
function parseFormDataFromText(text: string): URLSearchParams | null {
  try {
    return new URLSearchParams(text);
  } catch (e) {
    console.error("Error parsing form data from text:", e);
    return null;
  }
}

// Helper function to handle the onboarding process
async function handleOnboarding(
  supabaseAdmin: any, 
  fromNumber: string, 
  messageBody: string, 
  onboardingData: any
): Promise<{response: string, updatedState: any}> {
  // Default to initial state if none exists
  const currentState = onboardingData?.state || OnboardingState.Initial;
  let response = "";
  let updatedState = { ...onboardingData };
  
  console.log(`Processing message in state ${currentState} for ${fromNumber}: "${messageBody}"`);
  
  // Handle based on current state
  switch(currentState) {
    case OnboardingState.Initial:
      // Check if this is a JOIN message
      if (messageBody.toUpperCase().includes('JOIN')) {
        response = "👋 *Welcome to VocabSpark!*\n\nWhen would you like to receive your daily words?\n\n1️⃣ Morning (around 7 AM)\n2️⃣ Noon (around 12 PM)\n3️⃣ Evening (around 7 PM)\n\nReply with 1, 2, or 3.";
        updatedState = {
          state: OnboardingState.AskingDeliveryTime,
          phone_number: fromNumber,
          created_at: new Date().toISOString()
        };
      } else {
        // Regular message, not part of onboarding
        response = "👋 Welcome to VocabSpark! Reply with JOIN to start your free trial and receive vocabulary words daily.";
      }
      break;
      
    case OnboardingState.AskingDeliveryTime:
      const deliveryTime = mapDeliveryTimeResponse(messageBody);
      
      if (deliveryTime) {
        updatedState.delivery_time = deliveryTime;
        updatedState.state = OnboardingState.AskingName;
        response = "Great choice! What's your name so we can personalize your experience?";
      } else {
        response = "I didn't understand that choice. Please reply with 1 (Morning), 2 (Noon), or 3 (Evening).";
      }
      break;
      
    case OnboardingState.AskingName:
      // Parse name (could be more sophisticated)
      const name = messageBody.trim();
      if (name.length < 1) {
        response = "Please share your name so we can personalize your experience.";
      } else {
        // Store the name
        const firstName = name.split(' ')[0];
        const lastName = name.split(' ').slice(1).join(' ');
        
        updatedState.first_name = firstName;
        updatedState.last_name = lastName || '';
        updatedState.state = OnboardingState.Complete;
        
        // Create the subscription
        try {
          // Check if subscription already exists
          const { data: existingSub, error: checkError, count } = await supabaseAdmin
            .from("user_subscriptions")
            .select("id", { count: "exact" })
            .eq("phone_number", fromNumber);

          if (checkError) {
            console.error("Error checking for existing subscription:", checkError);
            throw new Error("Database error checking subscription.");
          }

          if (count && count > 0) {
            console.log("Subscription already exists for phone number:", fromNumber);
            
            // Update the existing subscription with new data
            const { error: updateError } = await supabaseAdmin
              .from("user_subscriptions")
              .update({
                delivery_time: updatedState.delivery_time, 
                first_name: firstName,
                last_name: lastName || '',
                // Don't update trial period if it already exists
              })
              .eq("phone_number", fromNumber);
              
            if (updateError) {
              console.error("Error updating subscription data:", updateError);
              throw new Error("Failed to update subscription data.");
            }
            
            response = `Welcome back, ${firstName}! Your VocabSpark preferences have been updated. Your daily words will be delivered in the ${updatedState.delivery_time}.`;
          } else {
            // Create new subscription
            const trialEndsAt = addDays(new Date(), 3).toISOString(); // Free trial lasts 3 days
            
            const subscriptionData = {
              phone_number: fromNumber,
              is_pro: false,
              trial_ends_at: trialEndsAt,
              delivery_time: updatedState.delivery_time,
              first_name: firstName,
              last_name: lastName || '',
            };

            const { data: newSubscription, error: insertError } = await supabaseAdmin
              .from("user_subscriptions")
              .insert(subscriptionData)
              .select()
              .single();

            if (insertError) {
              console.error("Error inserting free trial subscription:", insertError);
              throw new Error(`Failed to create subscription: ${insertError.message}`);
            }

            console.log("Free trial subscription created successfully:", newSubscription);
            
            response = `✨ *Congratulations, ${firstName}!* ✨\n\nYour 3-day free trial is now active. You'll receive 5 fresh vocabulary words ${updatedState.delivery_time === 'morning' ? 'every morning' : updatedState.delivery_time === 'noon' ? 'every noon' : 'every evening'}.\n\n🎁 *Your first words will be sent right away!*`;
            
            // Send first words immediately
            try {
              console.log("Invoking send-whatsapp function for welcome message...");
              await supabaseAdmin.functions.invoke("send-whatsapp", {
                body: {
                  to: fromNumber,
                  category: "general", // Or a default category
                  isPro: false,
                  sendImmediately: true,
                  firstName: firstName, // Pass name for personalization
                  debugMode: true
                },
              });
            } catch (invokeErr) {
              console.error("Failed to invoke send-whatsapp function:", invokeErr);
              // We'll continue even if this fails, the subscription is still created
            }
          }
        } catch (error) {
          console.error("Error processing subscription:", error);
          response = "I'm sorry, we encountered an issue setting up your subscription. Please try again or contact support.";
          updatedState.state = OnboardingState.Initial; // Reset state
        }
      }
      break;
      
    case OnboardingState.Complete:
      // They've already completed onboarding
      // Here we can either provide help or take other actions based on their message
      
      const lowercaseMsg = messageBody.toLowerCase().trim();
      
      if (lowercaseMsg.includes('help') || lowercaseMsg === 'menu') {
        response = "*VocabSpark Commands*\n\n• *CHANGE TIME* - Update your delivery time\n• *PAUSE* - Temporarily pause your words\n• *RESUME* - Resume your daily words\n• *UPGRADE* - Get Pro features\n• *HELP* - See this menu";
      } 
      else if (lowercaseMsg.includes('change time') || lowercaseMsg.includes('time')) {
        response = "When would you like to receive your daily words?\n\n1️⃣ Morning (around 7 AM)\n2️⃣ Noon (around 12 PM)\n3️⃣ Evening (around 7 PM)\n\nReply with 1, 2, or 3.";
        updatedState.state = OnboardingState.AskingDeliveryTime;
      }
      else {
        // Default response
        response = `Hi ${updatedState.first_name || 'there'}! You're all set up with VocabSpark. Your daily words will be delivered ${updatedState.delivery_time === 'morning' ? 'every morning' : updatedState.delivery_time === 'noon' ? 'every noon' : 'every evening'}. Reply with HELP to see available commands.`;
      }
      break;
  }
  
  return { response, updatedState };
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
        }
    }

    const isValid = twilio.validateRequest(
      twilioAuthToken,
      signature,
      url,
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } }
      }
    );

    // Get verification token from env
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    // --- Handle GET for Webhook Verification ---
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
           return new Response(JSON.stringify({ success: false, error: 'Could not parse form data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
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
        console.log(`Placeholder: Logged status '${messageStatus}' for SID ${messageSid}. ErrorCode: ${errorCode || 'N/A'}`);

      // Handle Incoming Message
      } else {
        let fromNumber = '';
        let messageBody = '';
        let messageId = '';
        
        // Extract message data based on the format
        if (formData && formData.has('From') && formData.has('Body')) {
          // Twilio format
          fromNumber = formData.get('From') || '';
          messageBody = formData.get('Body') || '';
          messageId = formData.get('MessageSid') || '';
          
          // Format the number without WhatsApp: prefix if it exists
          fromNumber = fromNumber.replace('whatsapp:', '');
          
        } else if (body && body.entry && body.entry.length > 0) {
          // Meta format
          const entry = body.entry[0];
          if (entry.changes && entry.changes.length > 0) {
            const change = entry.changes[0];
            if (change.value && change.value.messages && change.value.messages.length > 0) {
              const message = change.value.messages[0];
              fromNumber = message.from || '';
              messageBody = message.text?.body || '';
              messageId = message.id || '';
            }
          }
        }
        
        if (fromNumber && messageBody) {
          console.log(`Processing incoming message from ${fromNumber}: "${messageBody}"`);
          
          // Store the incoming message
          const { error: insertError } = await supabaseAdmin
            .from('whatsapp_messages')
            .insert({
              from_number: fromNumber,
              message: messageBody,
              provider_message_id: messageId,
              provider: formData ? 'twilio' : 'meta'
            });

          if (insertError) {
            console.error('Error storing incoming WhatsApp message:', insertError);
          }
          
          // Check for existing onboarding data for this number
          const { data: existingOnboarding, error: onboardingError } = await supabaseAdmin
            .from('whatsapp_onboarding')
            .select('*')
            .eq('phone_number', fromNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (onboardingError) {
            console.error('Error fetching onboarding data:', onboardingError);
          }
          
          // Process the message through our onboarding flow
          const { response, updatedState } = await handleOnboarding(
            supabaseAdmin, 
            fromNumber, 
            messageBody, 
            existingOnboarding
          );
          
          // Store or update the onboarding state
          if (existingOnboarding?.id) {
            // Update existing record
            const { error: updateError } = await supabaseAdmin
              .from('whatsapp_onboarding')
              .update({
                state: updatedState.state,
                delivery_time: updatedState.delivery_time,
                first_name: updatedState.first_name,
                last_name: updatedState.last_name,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingOnboarding.id);
              
            if (updateError) {
              console.error('Error updating onboarding state:', updateError);
            }
          } else if (updatedState?.state) {
            // Insert new record
            const { error: insertError } = await supabaseAdmin
              .from('whatsapp_onboarding')
              .insert({
                phone_number: fromNumber,
                state: updatedState.state,
                delivery_time: updatedState.delivery_time,
                first_name: updatedState.first_name,
                last_name: updatedState.last_name,
              });
              
            if (insertError) {
              console.error('Error inserting onboarding state:', insertError);
            }
          }
          
          // Send the response message back to the user
          if (response) {
            try {
              console.log(`Sending response to ${fromNumber}: "${response.substring(0, 50)}..."`);
              
              const { error: whatsappError } = await supabaseAdmin.functions.invoke(
                "send-whatsapp",
                {
                  body: {
                    to: fromNumber,
                    message: response,
                    messageType: "onboarding",
                  },
                }
              );
              
              if (whatsappError) {
                console.error('Error sending WhatsApp response:', whatsappError);
              }
            } catch (sendError) {
              console.error('Error invoking send-whatsapp function:', sendError);
            }
          }
        } else {
          console.warn('Webhook received POST but could not extract message data.');
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

// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Define the Twilio API URL with dynamic account SID
const twilioApiUrl = (accountSid: string) => 
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

// Define AiSensy API URL
const aisensyApiUrl = "https://backend.aisensy.com/campaign/t1/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request data
    const requestData = await req.json();
    
    // Determine which provider to use - default to twilio for backward compatibility
    const provider = requestData.provider || 'twilio';

    console.log(`Using provider: ${provider}`);

    if (provider === 'aisensy') {
      return await handleAiSensyRequest(req, requestData);
    } else {
      return await handleTwilioRequest(req, requestData);
    }
  } catch (error) {
    console.error(`WhatsApp message error:`, error);
    
    // Format detailed error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: {
          message: error.message,
          suggestion: "Check your configuration and try again",
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Handle AiSensy requests
async function handleAiSensyRequest(req: Request, requestData: any) {
  // --- Extract credentials from environment variables ---
  const aisensyApiKey = Deno.env.get("AISENSY_API_KEY");
  
  // Debug credential check
  console.log("AiSensy credentials check:", {
    apiKey: aisensyApiKey ? `${aisensyApiKey.substring(0, 5)}...` : "missing"
  });

  // Check if this is just a configuration verification request
  if (requestData.checkConfig === true) {
    const configStatus = {
      aisensyConfigured: !!aisensyApiKey,
      apiKey: aisensyApiKey ? "configured" : "missing"
    };
    
    return new Response(JSON.stringify({ 
      success: configStatus.aisensyConfigured,
      configStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  }
  
  // Check if this is a templates fetch request
  if (requestData.action === "getTemplates") {
    return await fetchAiSensyTemplates(aisensyApiKey);
  }

  // --- Parse WhatsApp message request ---
  const to = requestData.to || requestData.phoneNumber;
  const message = requestData.message;
  const templateName = requestData.templateName;
  const templateParams = requestData.templateParams || {};
  const category = requestData.category;
  const isPro = requestData.isPro;
  const sendImmediately = requestData.sendImmediately;

  // Debug logging
  console.log("AiSensy request received:", { 
    to, 
    messageLength: message ? message.length : 0,
    templateName,
    hasTemplateParams: Object.keys(templateParams).length > 0,
    category,
    isPro,
    sendImmediately
  });

  // Validate input
  if (!to) {
    throw new Error("Recipient phone number is required");
  }

  if (!aisensyApiKey) {
    throw new Error("AiSensy API key is not configured");
  }

  // If category is provided, generate vocabulary words
  let finalMessage = message;
  if (category && sendImmediately) {
    console.log(`Generating vocabulary words for category: ${category}`);
    try {
      const wordsResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-vocab-words`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
        },
        body: JSON.stringify({
          category: category,
          count: 3 // Send 3 words for testing
        })
      });

      if (wordsResponse.ok) {
        const wordsData = await wordsResponse.json();
        if (wordsData.words && Array.isArray(wordsData.words)) {
          // Format the vocabulary words into a nice message
          const formattedWords = wordsData.words.map((word: any, index: number) => 
            `${index + 1}. *${word.word}*\n   _${word.definition}_\n   Example: ${word.example}`
          ).join('\n\n');
          
          finalMessage = `📚 Your Daily Vocabulary Words (${category})\n\n${formattedWords}\n\n✨ Keep learning!`;
        }
      } else {
        console.warn("Failed to generate vocabulary words, using default message");
      }
    } catch (error) {
      console.error("Error generating vocabulary words:", error);
      // Continue with default message if word generation fails
    }
  }

  if (!finalMessage && !templateName) {
    throw new Error("Either message content or template name is required");
  }

  // Determine which type of message to send
  let aisensyPayload;
  
  if (templateName) {
    // Template message
    aisensyPayload = {
      apiKey: aisensyApiKey,
      campaign: {
        campaignName: templateName,
        recipientPhone: to,
        userName: templateParams.userName || "",
        broadcast: false,
        variables: templateParams
      }
    };
  } else {
    // Direct message (text message) - Updated payload structure for AiSensy
    aisensyPayload = {
      apiKey: aisensyApiKey,
      destination: to,
      userName: requestData.userName || "User",
      templateName: "direct_message_template",
      source: "glintup_app",
      media: {},
      message: finalMessage,
      buttons: []
    };
  }
  
  console.log("AiSensy payload prepared:", JSON.stringify(aisensyPayload).substring(0, 200) + "...");

  // Make the API request to AiSensy
  const aisensyResponse = await fetch(aisensyApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aisensyPayload),
  });

  // Log the API response status
  console.log("AiSensy API response status:", aisensyResponse.status);

  // Parse the response JSON
  const aisensyData = await aisensyResponse.json();
  console.log("AiSensy response data:", JSON.stringify(aisensyData));

  // Check if the API call was successful
  if (!aisensyResponse.ok || aisensyData.error) {
    throw new Error(`AiSensy API error: ${aisensyData.message || aisensyData.error || aisensyResponse.statusText}`);
  }

  // Log a success message
  console.log("WhatsApp message sent successfully via AiSensy:", aisensyData.id || aisensyData);

  // --- Return success response ---
  const webhookUrl = Deno.env.get("SUPABASE_URL") ? 
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-webhook` : undefined;
  
  // Create a response with helpful information
  const response = {
    success: true,
    messageId: aisensyData.id || "unknown",
    status: aisensyData.status || "sent",
    details: aisensyData,
    to: to,
    provider: "aisensy",
    webhookUrl: webhookUrl,
    troubleshooting: {
      checkAiSensyDashboard: "Check your AiSensy dashboard for message delivery status",
      messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
      businessReady: "Your account is configured for WhatsApp Business API"
    }
  };

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

// Fetch templates from AiSensy
async function fetchAiSensyTemplates(apiKey: string | undefined) {
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "AiSensy API key is not configured" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  }
  
  try {
    // AiSensy templates endpoint
    const templatesUrl = `https://api.aisensy.com/templates/list?apiKey=${apiKey}`;
    
    const response = await fetch(templatesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      templates: data.templates || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error fetching AiSensy templates:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      templates: []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  }
}

// Handle Twilio requests (existing functionality)
async function handleTwilioRequest(req: Request, requestData: any) {
  // --- Extract credentials from environment variables ---
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");
  
  // Debug credential check
  console.log("Twilio credentials check:", {
    accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...${twilioAccountSid.slice(-3)}` : "missing",
    authToken: twilioAuthToken ? "present (hidden)" : "missing",
    fromNumber: twilioFromNumber ? "present" : "missing",
    messagingServiceSid: messagingServiceSid ? `${messagingServiceSid.substring(0, 5)}...` : "missing",
  });

  // Check only configuration without sending messages
  if (requestData.checkOnly === true) {
    // ... keep existing code (config status check)
  }
  
  // If this is a test connection request, just verify the credentials
  if (requestData.testTwilioConnection === true) {
    // ... keep existing code (connection test)
  }

  // --- Parse WhatsApp message request ---
  const to = requestData.to || requestData.phoneNumber;
  const message = requestData.message;
  
  // Debug logging
  console.log("WhatsApp request received:", { 
    to, 
    messageLength: message ? message.length : 0,
    toFormatted: to ? `${to.substring(0, 5)}...` : undefined,
    usingDirectMessage: true,
  });

  // Validate input
  if (!to) {
    throw new Error("Recipient phone number is required");
  }

  // Always require a message for direct messaging
  if (!message) {
    throw new Error("Message content is required for direct messaging");
  }

  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error("Twilio credentials are not configured");
  }

  // --- Process phone number format ---
  const formatWhatsAppNumber = (phoneNumber: string) => {
    // First, sanitize the number to only contain digits and '+' at the start
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ensure the number starts with '+' if it doesn't already
    if (!formatted.startsWith('+')) {
      formatted = `+${formatted}`;
    }
    
    // Validate that we have a reasonable length for an international phone number
    const digitsOnly = formatted.replace(/[^\d]/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      console.warn(`Warning: Phone number ${formatted} has unusual length (${digitsOnly.length} digits)`);
    }
    
    // For WhatsApp, Twilio requires the 'whatsapp:' prefix
    return `whatsapp:${formatted}`;
  };

  // Format phone numbers
  const formattedTo = formatWhatsAppNumber(to);
  let formattedFrom = null;
  if (twilioFromNumber) {
    formattedFrom = formatWhatsAppNumber(twilioFromNumber);
  }
  
  // --- Determine which number to send from ---
  console.log("TWILIO_FROM_NUMBER from environment:", twilioFromNumber);
  console.log("TWILIO_MESSAGING_SERVICE_SID from environment:", messagingServiceSid);

  // Use Messaging Service if available, otherwise use From Number
  const useMessagingService = !!messagingServiceSid;
  
  // --- Prepare and send the message ---
  console.log(`Sending WhatsApp message using ${useMessagingService ? "Messaging Service" : "From Number"} to ${formattedTo}`);
  
  console.log("Using direct message: ", message.substring(0, 50) + (message.length > 50 ? "..." : ""));

  // Prepare the request body for Twilio
  const formData = new FormData();
  formData.append("To", formattedTo);
  
  // IMPORTANT: Always add both MessagingServiceSid AND From number when available
  if (useMessagingService) {
    formData.append("MessagingServiceSid", messagingServiceSid);
    if (twilioFromNumber) {
      formData.append("From", formattedFrom);
    }
  } else {
    formData.append("From", formattedFrom);
  }
  
  // Set the message body - always use direct messaging
  formData.append("Body", message);
  
  // Make the API request to Twilio
  const twilioResponse = await fetch(twilioApiUrl(twilioAccountSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
    },
    body: formData,
  });

  // Log the API response status
  console.log("Twilio API response status:", twilioResponse.status);

  // Parse the response JSON
  const twilioData = await twilioResponse.json();
  console.log("Twilio response data:", JSON.stringify(twilioData));

  // Check if the API call was successful
  if (!twilioResponse.ok || twilioData.error_code) {
    throw new Error(`Twilio API error: ${twilioData.error_message || twilioResponse.statusText}`);
  }

  // Log a success message
  console.log("WhatsApp message sent successfully:", twilioData.sid);

  // --- Return success response ---
  const webhookUrl = Deno.env.get("SUPABASE_URL") ? 
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-webhook` : undefined;
  
  // Create a response with helpful information
  const response = {
    success: true,
    messageId: twilioData.sid,
    status: twilioData.status,
    details: twilioData,
    to: formattedTo,
    from: twilioData.from || (useMessagingService ? 
      (twilioFromNumber ? `whatsapp:${twilioFromNumber}` : "via messaging service") : 
      formattedFrom),
    webhookUrl: webhookUrl,
    usingDirectMessage: true,
    provider: "twilio",
    businessAccount: true,
    troubleshooting: {
      checkTwilioConsole: "Check your Twilio console for message delivery status",
      messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
      directMessageUsed: "Using direct message mode only",
      businessReady: "Your account is configured for WhatsApp Business API"
    }
  };

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

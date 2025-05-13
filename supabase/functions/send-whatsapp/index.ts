
// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Define the Twilio API URL with dynamic account SID
const twilioApiUrl = (accountSid: string) => 
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const requestData = await req.json();
    
    // If this is a test connection request, just verify the credentials
    if (requestData.testTwilioConnection === true) {
      if (!twilioAccountSid || !twilioAuthToken) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Missing Twilio credentials",
            accountSidPrefix: twilioAccountSid ? twilioAccountSid.substring(0, 6) : null
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          }
        );
      }
      
      try {
        // Call Twilio API to check account status
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`, {
          headers: {
            Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
          }
        });
        
        if (!response.ok) {
          const responseText = await response.text();
          return new Response(JSON.stringify({ 
            success: false, 
            error: `Twilio API returned ${response.status}`,
            details: { 
              status: response.status, 
              statusText: response.statusText,
              responseText: responseText
            },
            accountSidPrefix: twilioAccountSid.substring(0, 6)
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          });
        }
        
        const accountData = await response.json();
        return new Response(JSON.stringify({ 
          success: true, 
          accountName: accountData.friendly_name,
          accountStatus: accountData.status,
          accountType: accountData.type,
          accountSidPrefix: twilioAccountSid.substring(0, 6)
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Connection error: ${error.message}`,
          accountSidPrefix: twilioAccountSid ? twilioAccountSid.substring(0, 6) : null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    }

    // --- Parse WhatsApp message request ---
    const { to, message, templateId, templateValues } = requestData;

    // Debug logging
    console.log("WhatsApp request received:", { 
      to, 
      messageLength: message ? message.length : 0,
      templateId: templateId || "none",
      toFormatted: to ? `${to.substring(0, 5)}...` : undefined,
      usingTemplate: !!templateId
    });

    // Validate input
    if (!to) {
      throw new Error("Recipient phone number is required");
    }

    if (!message && !templateId) {
      throw new Error("Either message content or templateId is required");
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
    
    console.log(`Formatted recipient phone number from ${to} to ${formattedTo}`);
    if (formattedFrom) {
      console.log(`Formatted sender phone number to ${formattedFrom}`);
    }

    // --- Determine which number to send from ---
    console.log("TWILIO_FROM_NUMBER from environment:", twilioFromNumber);
    console.log("TWILIO_MESSAGING_SERVICE_SID from environment:", messagingServiceSid);

    // Use Messaging Service if available, otherwise use From Number
    const useMessagingService = !!messagingServiceSid;
    if (useMessagingService) {
      console.log("Using Messaging Service SID:", messagingServiceSid);
    } else if (twilioFromNumber) {
      console.log("Using From Number:", formattedFrom);
    } else {
      throw new Error("Either Twilio From Number or Messaging Service SID must be configured");
    }
    
    // --- Prepare and send the message ---
    console.log(`Sending WhatsApp message using ${useMessagingService ? "Messaging Service" : "From Number"} to ${formattedTo}`);
    
    // Check if we're using a template
    const usingTemplate = !!templateId;
    if (usingTemplate) {
      console.log(`Using template ID: ${templateId}`);
      if (templateValues) {
        console.log("Template values:", templateValues);
      }
    } else {
      console.log("Message content (first 50 chars):", message.substring(0, 50) + "...");
    }

    // Prepare the request body for Twilio
    const formData = new FormData();
    formData.append("To", formattedTo);
    
    if (useMessagingService) {
      formData.append("MessagingServiceSid", messagingServiceSid);
    } else {
      formData.append("From", formattedFrom);
    }
    
    // Handle template vs regular message
    if (usingTemplate) {
      // If using a template, add the template SID
      const contentSid = templateId;
      formData.append("ContentSid", contentSid);
      
      // Add template parameters if provided
      if (templateValues && typeof templateValues === 'object') {
        const contentVariables = JSON.stringify(templateValues);
        formData.append("ContentVariables", contentVariables);
      }
      
      console.log("Using template message with ContentSid:", contentSid);
    } else {
      // For regular message, just use the Body parameter
      formData.append("Body", message);
    }

    // Log the API request details (but not the full auth token)
    console.log("Twilio API request:", {
      url: twilioApiUrl(twilioAccountSid),
      to: formattedTo,
      messagingService: useMessagingService ? messagingServiceSid : undefined,
      from: useMessagingService ? "using messaging service" : formattedFrom,
      contentType: usingTemplate ? "template" : "text",
      templateId: usingTemplate ? templateId : undefined,
    });

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
      from: useMessagingService ? "via messaging service" : formattedFrom,
      webhookUrl: webhookUrl,
      usingTemplate: usingTemplate,
      templateId: usingTemplate ? templateId : undefined,
      troubleshooting: usingTemplate ? {
        templates: "You are using a WhatsApp template which bypasses the opt-in requirement",
        checkTwilioConsole: "Check your Twilio console for message delivery status and template approval",
        makeProductionReady: "For production, apply for WhatsApp Business API access through Twilio"
      } : {
        checkTwilioConsole: "Check your Twilio console for message delivery status",
        sandboxInstructions: "If using sandbox, recipient must send 'join <sandbox-code>' first",
        messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
        makeProductionReady: "For production, apply for WhatsApp Business API access through Twilio"
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("WhatsApp message error:", error);
    
    // Format detailed error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: {
          message: error.message,
          tip: "Check your Twilio credentials and WhatsApp number formatting",
          suggestion: "Make sure your Twilio account is active and has WhatsApp capability",
          twilioGuide: "https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates"
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

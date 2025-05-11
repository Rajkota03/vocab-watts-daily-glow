// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Define the Twilio API URL with dynamic account SID
const twilioApiUrl = (accountSid: string, resource = 'Messages') => 
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/${resource}.json`;

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
    const defaultTemplateSid = Deno.env.get("WHATSAPP_TEMPLATE_SID");
    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

    // Debug credential check
    console.log("Twilio credentials check:", {
      accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...${twilioAccountSid.slice(-3)}` : "missing",
      authToken: twilioAuthToken ? "present (hidden)" : "missing",
      fromNumber: twilioFromNumber ? "present" : "missing",
      verifyToken: verifyToken ? "present" : "missing",
      messagingServiceSid: messagingServiceSid ? `${messagingServiceSid.substring(0, 5)}...` : "missing",
      templateSid: defaultTemplateSid ? `${defaultTemplateSid.substring(0, 5)}...` : "missing"
    });

    const requestData = await req.json();
    
    // Only do config check if explicitly requested
    if (requestData.checkOnly === true) {
      const configStatus = {
        success: !!(twilioAccountSid && twilioAuthToken),
        twilioConfigured: !!(twilioAccountSid && twilioAuthToken),
        fromNumberConfigured: !!twilioFromNumber,
        messagingServiceConfigured: !!messagingServiceSid,
        templateSidConfigured: !!defaultTemplateSid,
        verifyTokenConfigured: !!verifyToken,
        configStatus: {
          accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...` : null,
        }
      };
      return new Response(JSON.stringify(configStatus), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

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
    const { 
      to, 
      message, 
      messageType, 
      templateId, 
      templateValues,
      category, 
      userId, 
      isPro, 
      sendImmediately, 
      firstName 
    } = requestData;

    // Debug logging
    console.log("WhatsApp request received:", { 
      to, 
      messageType,
      category, 
      isPro, 
      templateId: templateId || defaultTemplateSid,
      templateValues: templateValues ? "present" : "not provided",
      scheduledTime: requestData.scheduledTime,
      sendImmediately,
      debugMode: requestData.debugMode,
      extraDebugging: requestData.extraDebugging,
      messageLength: message ? message.length : 0,
      toFormatted: to ? `${to.substring(0, 5)}...` : undefined,
      usingMessagingService: !!messagingServiceSid 
    });

    // Validate input
    if (!to) {
      throw new Error("Recipient phone number is required");
    }

    // --- Generate message content if not provided ---
    // If neither message nor template is provided but category is, we need to generate message content
    let finalMessage = message;
    if (!finalMessage && !templateId && !defaultTemplateSid) {
      if (category) {
        // Create a simple test message when category is provided but no message
        finalMessage = `This is a test message for category: ${category}. If you see this, WhatsApp integration is working!`;
        console.log("Generated test message for category:", category);
      } else {
        // If no content can be determined, throw an error
        throw new Error("Either message content, message type, or template ID is required");
      }
    }

    // --- Process phone number format ---
    const formatWhatsAppNumber = (phoneNumber: string) => {
      console.log("Formatting number:", phoneNumber);
      // Remove any non-digit characters except the leading +
      let formatted = phoneNumber.replace(/[^\d+]/g, '');
      
      // Ensure the number starts with + if it doesn't already
      if (!formatted.startsWith('+')) {
        formatted = `+${formatted}`;
      }
      
      // Add WhatsApp: prefix for Twilio
      formatted = `whatsapp:${formatted}`;
      console.log("Formatted to:", formatted);
      return formatted;
    };

    const formattedTo = formatWhatsAppNumber(to);
    console.log(`Formatted recipient phone number from ${to} to ${formattedTo}`);

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error("Twilio credentials are not configured");
    }

    // --- Determine which number to send from ---
    console.log("TWILIO_FROM_NUMBER from environment:", twilioFromNumber);
    console.log("TWILIO_MESSAGING_SERVICE_SID from environment:", messagingServiceSid);

    // Use Messaging Service if available, otherwise use From Number
    const useMessagingService = !!messagingServiceSid;
    if (useMessagingService) {
      console.log("Using Messaging Service SID:", messagingServiceSid);
    } else if (twilioFromNumber) {
      console.log("Using From Number:", formatWhatsAppNumber(twilioFromNumber));
    } else {
      throw new Error("Either Twilio From Number or Messaging Service SID must be configured");
    }
    
    // --- Prepare and send the message ---
    console.log(`Sending WhatsApp message using ${useMessagingService ? "Messaging Service" : "From Number"} to ${formattedTo}`);
    console.log("Message content (first 50 chars):", finalMessage ? `${finalMessage.substring(0, 50)}...` : "No message content");

    // Prepare the request body for Twilio
    const formData = new FormData();
    formData.append("To", formattedTo);
    
    if (useMessagingService) {
      formData.append("MessagingServiceSid", messagingServiceSid);
    } else {
      formData.append("From", formatWhatsAppNumber(twilioFromNumber!));
    }
    
    // Check if we should use a template
    const useTemplate = templateId || defaultTemplateSid;
    if (useTemplate) {
      console.log(`Using template: ${templateId || defaultTemplateSid}`);
      formData.append("ContentSid", templateId || defaultTemplateSid!);
      
      // Add template variables if provided
      if (templateValues) {
        console.log("Adding template values:", templateValues);
        Object.entries(templateValues).forEach(([key, value], index) => {
          formData.append(`ContentVariables`, JSON.stringify({
            [key]: value
          }));
        });
      }
    } else {
      // Use regular body if no template
      formData.append("Body", finalMessage!);
    }

    // Log the API request details (but not the full auth token)
    console.log("Twilio API request:", {
      url: twilioApiUrl(twilioAccountSid),
      to: formattedTo,
      messagingService: useMessagingService ? messagingServiceSid : undefined,
      from: useMessagingService ? "using messaging service" : formatWhatsAppNumber(twilioFromNumber!),
      template: useTemplate || "none",
      messageLength: finalMessage ? finalMessage.length : 0
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
    console.log("Twilio response data:", JSON.stringify(twilioData).substring(0, 200) + "...");

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
      usingMessagingService: useMessagingService,
      messagingServiceSid: useMessagingService ? messagingServiceSid : undefined,
      usingTemplate: !!useTemplate,
      templateSid: useTemplate || undefined,
      usingMetaIntegration: true,
      to: formattedTo,
      from: useMessagingService ? "via messaging service" : formatWhatsAppNumber(twilioFromNumber!),
      rawTo: to,
      rawFrom: twilioFromNumber,
      webhookUrl: webhookUrl,
      troubleshooting: {
        checkPhoneFormat: "Phone format looks good",
        checkSandbox: "You're using WhatsApp Business API",
        messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
        verifyInternet: "Ensure recipient's phone has internet connection",
        appNeeded: "Make sure recipient has WhatsApp installed"
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
          suggestion: "Make sure your Twilio account is active and has WhatsApp capability"
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

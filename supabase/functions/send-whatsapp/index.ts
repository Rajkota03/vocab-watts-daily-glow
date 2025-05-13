
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
    
    // Check only configuration without sending messages
    if (requestData.checkOnly === true) {
      const configStatus = {
        twilioConfigured: !!twilioAccountSid && !!twilioAuthToken,
        fromNumberConfigured: !!twilioFromNumber,
        messagingServiceConfigured: !!messagingServiceSid,
        accountSid: twilioAccountSid ? `${twilioAccountSid.substring(0, 6)}...` : null,
      };
      
      // If we should also verify credentials, test Twilio API connectivity
      if (requestData.verifyCredentials && twilioAccountSid && twilioAuthToken) {
        try {
          // Call Twilio API to check account status
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`, {
            headers: {
              Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
            }
          });
          
          if (!response.ok) {
            return new Response(JSON.stringify({ 
              success: false, 
              twilioConfigured: true,
              accountVerified: false,
              error: `Twilio API returned ${response.status}`,
              configStatus
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200 // Still return 200 for frontend to process
            });
          }
          
          const accountData = await response.json();
          return new Response(JSON.stringify({ 
            success: true, 
            twilioConfigured: true,
            accountVerified: true,
            accountName: accountData.friendly_name,
            accountStatus: accountData.status,
            accountType: accountData.type,
            configStatus
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            twilioConfigured: true,
            accountVerified: false,
            error: `Connection error: ${error.message}`,
            configStatus
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 // Still return 200 for frontend to process
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: configStatus.twilioConfigured && (configStatus.fromNumberConfigured || configStatus.messagingServiceConfigured),
        configStatus
      }), {
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
            status: 200 // Return 200 for frontend handling
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
            status: 200 // Return 200 for frontend handling
          });
        }
        
        const accountData = await response.json();
        return new Response(JSON.stringify({ 
          success: true, 
          accountName: accountData.friendly_name,
          accountStatus: accountData.status,
          accountType: accountData.type,
          accountSidPrefix: twilioAccountSid.substring(0, 6),
          fromNumber: twilioFromNumber
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
          status: 200 // Return 200 for frontend handling
        });
      }
    }

    // --- Parse WhatsApp message request ---
    // Support both 'to' and 'phoneNumber' fields for compatibility
    const to = requestData.to || requestData.phoneNumber;
    const message = requestData.message;
    const templateId = requestData.templateId;
    const templateValues = requestData.templateValues;

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

    // For upgraded Twilio accounts, either message or templateId is required
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
    
    // Check if we're using a template (prioritize this if available)
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
    
    // IMPORTANT: Always add both MessagingServiceSid AND From number when available
    // This helps ensure the "from" field is properly populated in the response
    if (useMessagingService) {
      formData.append("MessagingServiceSid", messagingServiceSid);
      // If we have a from number, add it as well to ensure "from" is not null
      if (twilioFromNumber) {
        formData.append("From", formattedFrom);
      }
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
    }
    
    // For all messages (including templates), provide a Body as fallback
    if (message) {
      formData.append("Body", message);
    }

    // Log the API request details (but not the full auth token)
    console.log("Twilio API request:", {
      url: twilioApiUrl(twilioAccountSid),
      to: formattedTo,
      messagingService: useMessagingService ? messagingServiceSid : undefined,
      from: useMessagingService && twilioFromNumber ? formattedFrom : (useMessagingService ? "using messaging service" : formattedFrom),
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
      from: twilioData.from || (useMessagingService ? 
        (twilioFromNumber ? `whatsapp:${twilioFromNumber}` : "via messaging service") : 
        formattedFrom),
      webhookUrl: webhookUrl,
      usingTemplate: usingTemplate,
      templateId: usingTemplate ? templateId : undefined,
      // Add API version explanation
      apiVersionInfo: "Twilio's API endpoint is versioned as '2010-04-01' but represents their current stable API",
      businessAccount: true, // Indicate this is a business account
      troubleshooting: {
        checkTwilioConsole: "Check your Twilio console for message delivery status",
        messageWindowInfo: "Standard messages may be restricted to 24-hour conversation window",
        businessReady: "Your account is configured for WhatsApp Business API"
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
          suggestion: "Use templates for more reliable delivery with your Twilio business account",
          twilioGuide: "https://www.twilio.com/docs/whatsapp/api"
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

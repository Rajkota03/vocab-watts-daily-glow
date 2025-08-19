// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request data
    const requestData = await req.json();
    
    console.log(`Using Meta WhatsApp Business API provider`);

    // Validate phone number early to avoid invalid numbers
    const phoneNumber = requestData.to || requestData.phoneNumber;
    if (phoneNumber && !isValidWhatsAppNumber(phoneNumber)) {
      console.log(`Skipping invalid phone number: ${phoneNumber}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Invalid WhatsApp number format: ${phoneNumber}`,
        details: {
          message: `The phone number ${phoneNumber} is not a valid WhatsApp number`,
          suggestion: "Please use a valid international phone number format"
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Route to Meta WhatsApp Business API handler
    return await handleMetaRequest(req, requestData);
  } catch (error) {
    console.error(`WhatsApp message error:`, error);
    
    // Return success: false but with 200 status so the frontend can read the error details
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
        status: 200, // Changed from 500 to 200 so frontend can read the response
      }
    );
  }
});

// Helper function to validate WhatsApp numbers
function isValidWhatsAppNumber(phoneNumber: string): boolean {
  // Skip obvious test numbers
  if (phoneNumber === '+1234567890' || phoneNumber === '+0000000000') {
    return false;
  }
  
  // Basic validation: starts with + and has reasonable length
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return false;
  }
  
  const digitsOnly = cleaned.replace(/[^\d]/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

// Handle Meta WhatsApp Business API requests
async function handleMetaRequest(req: Request, requestData: any) {
  try {
    // Extract Meta API credentials
    const metaAccessToken = Deno.env.get("META_ACCESS_TOKEN");
    const metaPhoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID");
    
    // Debug credential check
    console.log("Meta WhatsApp API credentials check:", {
      accessToken: metaAccessToken ? `${metaAccessToken.substring(0, 10)}...` : "missing",
      phoneNumberId: metaPhoneNumberId ? "configured" : "missing"
    });

    // Check if this is just a configuration verification request
    if (requestData.checkConfig === true) {
      const configStatus = {
        metaConfigured: !!(metaAccessToken && metaPhoneNumberId),
        accessToken: metaAccessToken ? "configured" : "missing",
        phoneNumberId: metaPhoneNumberId ? "configured" : "missing"
      };
      
      return new Response(JSON.stringify({ 
        success: configStatus.metaConfigured,
        configStatus
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Parse WhatsApp message request
    const to = requestData.to || requestData.phoneNumber;
    const message = requestData.message;
    const category = requestData.category;
    const sendImmediately = requestData.sendImmediately;

    // Debug logging
    console.log("Meta WhatsApp request received:", { 
      to, 
      messageLength: message ? message.length : 0,
      category,
      sendImmediately
    });

    // Validate input
    if (!to) {
      throw new Error("Recipient phone number is required");
    }

    if (!metaAccessToken || !metaPhoneNumberId) {
      throw new Error("Meta WhatsApp API credentials are not configured");
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
            count: 3
          })
        });

        if (wordsResponse.ok) {
          const wordsData = await wordsResponse.json();
          if (wordsData.words && Array.isArray(wordsData.words)) {
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
      }
    }

    if (!finalMessage) {
      throw new Error("Message content is required");
    }

    // Format phone number for Meta API (remove whatsapp: prefix if present)
    const formattedTo = to.replace('whatsapp:', '').replace(/[^\d+]/g, '');
    
    // Prepare Meta WhatsApp API payload
    const metaPayload = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "text",
      text: {
        body: finalMessage
      }
    };
    
    console.log("Meta API payload prepared for:", formattedTo);

    // Make the API request to Meta WhatsApp Business API
    const metaApiUrl = `https://graph.facebook.com/v17.0/${metaPhoneNumberId}/messages`;
    const metaResponse = await fetch(metaApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${metaAccessToken}`
      },
      body: JSON.stringify(metaPayload),
    });

    console.log("Meta API response status:", metaResponse.status);

    const metaData = await metaResponse.json();
    console.log("Meta response data:", JSON.stringify(metaData));

    // Check if the API call was successful
    if (!metaResponse.ok || metaData.error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Meta WhatsApp API error: ${metaData.error?.message || metaResponse.statusText}`,
        details: {
          message: `Meta WhatsApp API error: ${metaData.error?.message || metaResponse.statusText}`,
          suggestion: "Check your Meta WhatsApp Business API configuration",
          responseData: metaData
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("WhatsApp message sent successfully via Meta API:", metaData.messages?.[0]?.id);

    // Return success response
    const response = {
      success: true,
      messageId: metaData.messages?.[0]?.id || "unknown",
      status: "sent",
      details: metaData,
      to: formattedTo,
      provider: "meta",
      troubleshooting: {
        checkMetaDashboard: "Check your Meta Business Manager for message delivery status",
        messageWillAppear: "Messages appear in WhatsApp, not as SMS/text",
        businessReady: "Your account is configured for Meta WhatsApp Business API"
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Meta API handler error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: {
        message: error.message,
        suggestion: "Check your Meta WhatsApp Business API configuration",
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
}


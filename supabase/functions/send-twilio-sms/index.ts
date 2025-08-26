import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface TwilioSMSRequest {
  to: string;
  message: string;
  debugMode?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, message, debugMode = false }: TwilioSMSRequest = await req.json();

    if (!to || !message) {
      throw new Error("Phone number and message are required.");
    }

    // Get Twilio credentials from environment
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    console.log("Checking Twilio credentials:", {
      accountSid: accountSid ? `Present (${accountSid.substring(0, 6)}...)` : "Missing",
      authToken: authToken ? "Present" : "Missing",
      messagingServiceSid: messagingServiceSid ? `Present (${messagingServiceSid.substring(0, 6)}...)` : "Missing"
    });

    if (!accountSid || !authToken || !messagingServiceSid) {
      const error = `Twilio credentials not configured. Missing: ${[
        !accountSid && "TWILIO_ACCOUNT_SID",
        !authToken && "TWILIO_AUTH_TOKEN", 
        !messagingServiceSid && "TWILIO_MESSAGING_SERVICE_SID"
      ].filter(Boolean).join(", ")}`;
      console.error(error);
      throw new Error(error);
    }

    // Format phone number (ensure + prefix)
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    console.log(`Sending SMS via Twilio Messaging Service to: ${formattedTo}`);
    if (debugMode) {
      console.log(`Message: ${message}`);
    }

    // Create Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new FormData();
    formData.append('To', formattedTo);
    formData.append('MessagingServiceSid', messagingServiceSid);
    formData.append('Body', message);

    // Send SMS via Twilio
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      },
      body: formData
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Twilio API error:", responseData);
      throw new Error(`Twilio error: ${responseData.message || 'Failed to send SMS'}`);
    }

    console.log("SMS sent successfully:", responseData.sid);

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: "SMS sent successfully",
      messageId: responseData.sid,
      status: responseData.status,
      to: responseData.to,
      from: responseData.from,
      direction: responseData.direction,
      dateCreated: responseData.date_created,
      price: responseData.price,
      troubleshooting: debugMode ? {
        twilioResponse: responseData,
        credentials: {
          accountSid: accountSid ? "Set" : "Missing",
          authToken: authToken ? "Set" : "Missing", 
          messagingServiceSid: messagingServiceSid || "Missing"
        }
      } : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-twilio-sms function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
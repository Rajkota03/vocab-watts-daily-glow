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
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.");
    }

    // Format phone number (ensure + prefix)
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    console.log(`Sending SMS via Twilio to: ${formattedTo}`);
    if (debugMode) {
      console.log(`Message: ${message}`);
    }

    // Create Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new FormData();
    formData.append('To', formattedTo);
    formData.append('From', fromNumber);
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
          fromNumber: fromNumber || "Missing"
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
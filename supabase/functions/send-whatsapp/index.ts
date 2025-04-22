
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string;
  message: string;
  category?: string;
  isPro?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, category, isPro } = await req.json() as WhatsAppRequest;

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('Missing Twilio credentials');
    }

    // Format the WhatsApp number (ensure it starts with whatsapp:)
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const fromNumber = twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`;

    console.log(`Sending WhatsApp message to ${toNumber} from ${fromNumber}`);

    // Make request to Twilio API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: message,
        }).toString(),
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioData);
      throw new Error(twilioData.message || 'Failed to send WhatsApp message');
    }

    console.log('WhatsApp message sent successfully:', twilioData.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: twilioData.sid,
        status: twilioData.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

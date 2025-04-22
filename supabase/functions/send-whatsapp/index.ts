
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

// Function to format WhatsApp number properly
function formatWhatsAppNumber(number: string): string {
  // If it's already properly formatted, return it
  if (number.startsWith('whatsapp:+')) {
    return number;
  }
  
  // Remove whatsapp: prefix if present
  let cleaned = number.startsWith('whatsapp:') ? number.substring(9) : number;
  
  // Remove any non-digit characters
  cleaned = cleaned.replace(/\D/g, '');
  
  // Ensure it has a country code
  if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
    // For Indian numbers that are 10 digits long, add 91 prefix
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else {
      // Default to +1 (US) if no country code
      cleaned = '1' + cleaned;
    }
  }
  
  // Add + if missing
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  // Add whatsapp: prefix
  return `whatsapp:${cleaned}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Disable JWT verification for testing
  // This allows the function to be called without authentication
  // We'll implement proper authentication later if needed
  
  try {
    const { to, message, category, isPro } = await req.json() as WhatsAppRequest;

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || 'whatsapp:+14155238886'; // Use the sandbox number directly

    if (!accountSid || !authToken) {
      console.error('Missing Twilio credentials:', { 
        hasSid: !!accountSid, 
        hasToken: !!authToken, 
        hasNumber: !!twilioNumber 
      });
      throw new Error('Missing Twilio credentials');
    }

    // Format the recipient's WhatsApp number
    const toNumber = formatWhatsAppNumber(to);
    
    // Ensure Twilio number is properly formatted with whatsapp: prefix
    const fromNumber = twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`;

    console.log(`Sending WhatsApp message to ${toNumber} from ${fromNumber}`);
    console.log(`Message content: ${message.substring(0, 50)}...`);

    // Append instructions for first-time sandbox users
    let finalMessage = message;
    
    // If this is the first message and we're using the sandbox number
    if (fromNumber.includes('14155238886')) {
      finalMessage += "\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.";
    }

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
          From: fromNumber, // Always use the Twilio number as the sender
          Body: finalMessage,
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
        status: twilioData.status,
        details: twilioData,
        sandboxMode: fromNumber.includes('14155238886')
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

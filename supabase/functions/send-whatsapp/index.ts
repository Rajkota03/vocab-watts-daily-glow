
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  
  try {
    const { to, message, category, isPro } = await req.json() as WhatsAppRequest;

    // Retrieve Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    // Detailed logging of credentials availability (without exposing the actual values)
    console.log('Twilio credentials check:', { 
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 3)}` : 'missing',
      authToken: authToken ? 'present (hidden)' : 'missing'
    });

    // Always use the specific WhatsApp sandbox number for sending
    const fromNumber = 'whatsapp:+14155238886';

    // Validate Twilio credentials
    if (!accountSid || !authToken) {
      const errorMessage = 'Missing Twilio credentials';
      console.error(errorMessage, { 
        hasSid: !!accountSid, 
        hasToken: !!authToken 
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: { 
            message: "Please check that TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in Supabase environment variables."
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format the recipient's WhatsApp number
    const toNumber = formatWhatsAppNumber(to);
    
    console.log(`Sending WhatsApp message from ${fromNumber} to ${toNumber}`);
    console.log(`Message content: ${message.substring(0, 50)}...`);
    
    // Append instructions for first-time sandbox users
    let finalMessage = message;
    finalMessage += "\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.";

    // Make request to Twilio API using the same structure as the working example
    try {
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
            From: fromNumber,  // Always use the specific WhatsApp sandbox number
            Body: finalMessage,
          }).toString(),
        }
      );

      const twilioData = await twilioResponse.json();
      
      console.log('Twilio response status:', twilioResponse.status);
      console.log('Twilio response data:', JSON.stringify(twilioData).substring(0, 200) + '...');

      if (!twilioResponse.ok) {
        console.error('Twilio API error:', JSON.stringify(twilioData));
        
        // Handle specific Twilio error codes
        let errorMessage = twilioData.message || 'Failed to send WhatsApp message';
        let statusCode = twilioResponse.status || 500;
        
        // Handle authentication errors specifically
        if (twilioData.code === 20003 || statusCode === 401) {
          errorMessage = "Authentication failed. Please verify your Twilio credentials.";
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage,
            details: twilioData,
            status: statusCode,
            troubleshooting: "Verify that your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct in Supabase environment variables."
          }),
          {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('WhatsApp message sent successfully:', twilioData.sid);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: twilioData.sid,
          status: twilioData.status,
          details: twilioData,
          sandboxMode: true,  // Always true when using the WhatsApp sandbox
          to: toNumber,
          from: fromNumber
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (twilioError) {
      console.error('Error during Twilio API call:', twilioError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioError.message || 'Network error while calling Twilio API',
          details: {
            message: "There was an error communicating with the Twilio API.",
            originalError: String(twilioError)
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message',
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

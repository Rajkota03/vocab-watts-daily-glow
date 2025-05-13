
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    
    // Fetch environment variables
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    
    // Generate the webhook URL
    const webhookUrl = `${supabaseUrl.replace('https://', '')}/functions/v1/whatsapp-webhook`;
    const fullWebhookUrl = `https://${webhookUrl}`;
    
    // Generate a test URL with verification parameters
    const testVerificationUrl = `${fullWebhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=challenge_token`;
    
    // Construct response with helpful information
    const response = {
      success: true,
      webhook: {
        url: fullWebhookUrl,
        verificationUrl: testVerificationUrl,
        verifyTokenConfigured: !!verifyToken,
        twilio: {
          webhookUrl: fullWebhookUrl,
          instructions: "Set this as your Twilio WhatsApp webhook URL in the Twilio console"
        },
        meta: {
          webhookUrl: fullWebhookUrl,
          verifyToken: verifyToken || "<your_verify_token>",
          instructions: "Use this for Meta WhatsApp Business API integration"
        }
      },
      instructions: [
        "Make sure your WHATSAPP_VERIFY_TOKEN is set in Supabase Edge Function secrets",
        "For Twilio: Configure this URL as your WhatsApp status callback URL",
        "For Meta/Facebook: Use this URL and verify token when setting up your WhatsApp Business API"
      ]
    };
    
    if (action === "test") {
      // Make a test request to the webhook URL to check if it's working
      try {
        const testUrl = `${fullWebhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_challenge`;
        const testResponse = await fetch(testUrl);
        const testText = await testResponse.text();
        
        response.webhook.testResult = {
          status: testResponse.status,
          body: testText,
          success: testResponse.status === 200 && testText === "test_challenge"
        };
      } catch (error) {
        response.webhook.testResult = {
          error: error.message,
          success: false
        };
      }
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

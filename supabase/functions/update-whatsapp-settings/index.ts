
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    // Parse request body
    const { fromNumber, verifyToken } = await req.json();
    
    console.log("Updating WhatsApp settings", { 
      fromNumber: fromNumber ? fromNumber : "not provided",
      verifyToken: verifyToken ? "provided" : "not provided" 
    });
    
    // If no number is provided, use the default number
    const phoneNumber = fromNumber || '+918978354242';
    
    // Get current URL for hostname construction
    const requestUrl = new URL(req.url);
    const hostname = requestUrl.hostname;
    const protocol = hostname.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostname}`;
    
    // Calculate webhook URL
    const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
    
    console.log("Generated webhook URLs", { webhookUrl });
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    try {
      // Check if current environment variables are set
      const currentFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      const currentVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      console.log("Current configuration:", { 
        currentFromNumber: currentFromNumber || "not set", 
        hasVerifyToken: currentVerifyToken ? true : false,
        hasSid: twilioAccountSid ? true : false,
        hasAuthToken: twilioAuthToken ? true : false
      });
      
      // Success response with webhook URLs and explicit instructions
      return new Response(
        JSON.stringify({ 
          success: true, 
          webhookUrl,
          fromNumber: phoneNumber,
          currentFromNumber: currentFromNumber || null,
          usingMetaIntegration: true,
          twilioConfigured: !!(twilioAccountSid && twilioAuthToken),
          // Include instructions for manual steps with specific values
          instructions: [
            `1. Set the TWILIO_FROM_NUMBER in Supabase secrets to: ${phoneNumber} (without 'whatsapp:' prefix)`,
            `2. Configure this webhook URL in your WhatsApp Business account: ${webhookUrl}`,
            verifyToken ? 
              `3. Set WHATSAPP_VERIFY_TOKEN in Supabase secrets to: ${verifyToken}` : 
              "3. Create a WHATSAPP_VERIFY_TOKEN in Supabase secrets (any secure random string)"
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (storageError) {
      console.error("Failed to store WhatsApp settings", storageError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to store settings', 
          details: storageError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error updating WhatsApp settings", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

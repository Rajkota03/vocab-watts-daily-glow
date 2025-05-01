
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
    const { fromNumber, verifyToken, checkOnly } = await req.json();
    
    if (checkOnly) {
      // Just check current configuration without making changes
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const currentFromNumber = Deno.env.get('TWILIO_FROM_NUMBER');
      const currentVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      
      // Get current URL for hostname construction
      const requestUrl = new URL(req.url);
      const hostname = requestUrl.hostname;
      const protocol = hostname.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${hostname}`;
      
      // Calculate webhook URL
      const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
      
      return new Response(
        JSON.stringify({
          success: true,
          webhookUrl,
          fromNumber: currentFromNumber || '+918978354242',
          currentFromNumber: currentFromNumber || null,
          twilioConfigured: !!(twilioAccountSid && twilioAuthToken),
          verifyTokenConfigured: !!currentVerifyToken,
          configStatus: {
            accountSid: twilioAccountSid ? 'configured' : 'missing',
            authToken: twilioAuthToken ? 'configured' : 'missing',
            fromNumber: currentFromNumber ? 'configured' : 'missing',
            verifyToken: currentVerifyToken ? 'configured' : 'missing'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Updating WhatsApp settings", { 
      fromNumber: fromNumber ? fromNumber : "not provided",
      verifyToken: verifyToken ? "provided" : "not provided" 
    });
    
    // Format phone number correctly
    let phoneNumber = fromNumber;
    if (phoneNumber) {
      // Remove any "whatsapp:" prefix if present
      if (phoneNumber.startsWith('whatsapp:')) {
        phoneNumber = phoneNumber.substring(9);
      }
      
      // Ensure it has a plus sign
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber.replace(/^\+*/, '').replace(/\D/g, '');
      }
      
      console.log(`Formatted phone number to: ${phoneNumber}`);
    } else {
      // If no number is provided, use the default number
      phoneNumber = '+918978354242';
      console.log(`Using default phone number: ${phoneNumber}`);
    }
    
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


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
    
    console.log("Updating WhatsApp settings", { fromNumber: fromNumber ? "provided" : "not provided" });
    
    if (!fromNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'From number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get current URL for hostname construction
    const requestUrl = new URL(req.url);
    const hostname = requestUrl.hostname;
    const protocol = hostname.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${hostname}`;
    
    // Calculate webhook URLs
    const webhookUrl = `${baseUrl}/functions/v1/whatsapp-webhook`;
    
    console.log("Generated webhook URLs", { webhookUrl });
    
    // Store settings in database for future reference
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Update environment variables (this part is for reference, actual updates would be manual)
    // This just stores the values that should be set
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .upsert([
        {
          key: 'TWILIO_FROM_NUMBER',
          value: fromNumber,
          description: 'The WhatsApp number to send messages from (without whatsapp: prefix)'
        },
        {
          key: 'WHATSAPP_WEBHOOK_URL',
          value: webhookUrl,
          description: 'The URL for WhatsApp webhooks'
        }
      ], { onConflict: 'key' })
      .select();
      
    if (settingsError) {
      console.error("Failed to store WhatsApp settings", settingsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to store settings', 
          details: settingsError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If a verify token was provided, store it
    if (verifyToken) {
      // Note: In a real implementation, you'd update the environment variable using Supabase's API
      console.log("New verify token provided, this should be set in environment variables");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        webhookUrl,
        fromNumber,
        // Include instructions for manual steps
        instructions: [
          "1. Set the TWILIO_FROM_NUMBER in Supabase secrets to the number provided (without 'whatsapp:' prefix)",
          `2. Configure the webhook URL (${webhookUrl}) in your WhatsApp Business account`,
          "3. If you provided a verify token, set WHATSAPP_VERIFY_TOKEN in Supabase secrets"
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error updating WhatsApp settings", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

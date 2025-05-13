
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Main webhook validator function
async function validateWebhook(url: string, verifyToken: string): Promise<any> {
  try {
    // We're constructing the expected webhook URL
    const webhookUrl = url + "/functions/v1/whatsapp-webhook";
    
    // Try to make a GET request to the webhook with verification parameters
    const testToken = verifyToken || "test_token";
    const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${testToken}&hub.challenge=challenge123`;
    
    console.log(`Testing webhook at: ${testUrl}`);
    
    const response = await fetch(testUrl);
    const status = response.status;
    const body = await response.text();
    
    return {
      success: status === 200 && body === "challenge123",
      status,
      body: body.substring(0, 100), // Truncate long responses
      url: webhookUrl,
      verifyTokenConfigured: !!verifyToken
    };
  } catch (error) {
    console.error("Error testing webhook:", error);
    return {
      success: false,
      error: error.message,
      url: url + "/functions/v1/whatsapp-webhook",
      verifyTokenConfigured: !!verifyToken
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }
  
  try {
    // Parse request body
    const { action } = await req.json();
    
    // Get Supabase URL and verify token from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "";
    
    // Build the webhook information
    const webhookInfo = {
      url: supabaseUrl,
      verifyTokenConfigured: !!verifyToken
    };
    
    // If we're testing the webhook, add test results
    if (action === "test") {
      const testResult = await validateWebhook(supabaseUrl, verifyToken);
      webhookInfo['testResult'] = testResult;
    }
    
    // Return the webhook information
    return new Response(
      JSON.stringify({ 
        success: true,
        webhook: webhookInfo
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

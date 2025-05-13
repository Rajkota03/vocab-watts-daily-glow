
// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-webhook`;
    
    const requestData = await req.json();
    const action = requestData?.action || 'info';
    
    // Build the response object with webhook info
    const webhookInfo = {
      url: webhookUrl,
      verifyTokenConfigured: !!verifyToken,
      provider: 'twilio',
      updated_at: new Date().toISOString()
    };

    // If this is a test request, attempt to verify the webhook configuration
    if (action === 'test') {
      try {
        // Simulate a verification request to ensure the webhook is properly configured
        const verifyParams = new URLSearchParams({
          'hub.mode': 'subscribe',
          'hub.verify_token': verifyToken || '',
          'hub.challenge': 'test-challenge-string'
        });
        
        const testUrl = `${webhookUrl}?${verifyParams.toString()}`;
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const responseBody = await response.text();
        
        // Add test result to the webhook info
        webhookInfo.testResult = {
          success: response.ok && responseBody === 'test-challenge-string',
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        webhookInfo.testResult = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      webhook: webhookInfo 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
      
  } catch (error) {
    console.error('Error in webhook validation:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An error occurred during webhook validation'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});


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
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get verification token from env
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    
    // If request is a GET, it's likely the webhook verification from WhatsApp
    if (req.method === 'GET') {
      const url = new URL(req.url);
      
      // Get params needed for verification
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      console.log('WhatsApp webhook verification:', {
        mode, 
        receivedToken: token ? token.substring(0, 3) + '...' : null, 
        expectedToken: verifyToken ? verifyToken.substring(0, 3) + '...' : null,
        challenge: challenge ? challenge.substring(0, 5) + '...' : null
      });
      
      // Check verification conditions
      if (mode === 'subscribe' && token === verifyToken && challenge) {
        console.log('WhatsApp webhook verified successfully');
        
        // Return challenge to confirm verification
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        console.error('Failed to verify webhook:', {
          correctMode: mode === 'subscribe',
          tokenMatch: token === verifyToken,
          hasChallenge: !!challenge
        });
        
        // Return error if verification fails
        return new Response('Verification failed', {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // For POST requests (actual WhatsApp messages)
    if (req.method === 'POST') {
      // Parse request body
      let body;
      let messageData;
      
      try {
        body = await req.json();
        console.log('Received WhatsApp webhook payload:', JSON.stringify(body).substring(0, 200) + '...');
        
        // Handle direct Twilio format
        if (body.SmsMessageSid && body.Body) {
          messageData = {
            from: body.From,
            body: body.Body,
            mediaUrl: body.MediaUrl0,
            provider: 'twilio'
          };
        }
        // Handle Meta/WhatsApp format
        else if (body.entry && body.entry.length > 0) {
          const entry = body.entry[0];
          if (entry.changes && entry.changes.length > 0) {
            const change = entry.changes[0];
            if (change.value && change.value.messages && change.value.messages.length > 0) {
              const message = change.value.messages[0];
              messageData = {
                from: message.from,
                body: message.text?.body || '',
                mediaUrl: message.image?.id || null,
                provider: 'meta'
              };
            }
          }
        }
      } catch (parseError) {
        console.error('Error parsing webhook body:', parseError);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (messageData) {
        try {
          console.log('Processed message data:', messageData);
          
          // Store the message in Supabase
          const { error: insertError } = await supabaseAdmin
            .from('whatsapp_messages')
            .insert({
              from_number: messageData.from,
              message: messageData.body,
              media_url: messageData.mediaUrl,
              provider: messageData.provider
            });
            
          if (insertError) {
            console.error('Error storing WhatsApp message:', insertError);
          } else {
            console.log('Successfully stored WhatsApp message');
          }
        } catch (processError) {
          console.error('Error processing WhatsApp message:', processError);
        }
      } else {
        console.warn('Could not extract message data from payload');
      }
      
      // Always respond with 200 OK to WhatsApp to acknowledge receipt
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // For unsupported methods
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Unexpected error in WhatsApp webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

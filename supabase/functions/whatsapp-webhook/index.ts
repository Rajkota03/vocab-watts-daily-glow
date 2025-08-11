import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      // Webhook verification
      const hubMode = url.searchParams.get('hub.mode');
      const hubVerifyToken = url.searchParams.get('hub.verify_token');
      const hubChallenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification:', { hubMode, hubVerifyToken });

      const savedVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

      if (hubMode === 'subscribe' && hubVerifyToken === savedVerifyToken) {
        console.log('Webhook verification successful');
        return new Response(hubChallenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      } else {
        return new Response('Verification failed', {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }
    } else if (req.method === 'POST') {
      // Handle incoming messages
      const body = await req.json();
      console.log('Received webhook:', JSON.stringify(body, null, 2));

      return new Response(
        JSON.stringify({ ok: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});
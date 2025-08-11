import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const VERIFY_TOKEN = "p41fmgho19"; // Must match Meta form

serve(async (req) => {
  const url = new URL(req.url);

  // 1) Verification
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    
    console.log('Webhook verification:', { mode, token, challenge });
    
    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      console.log('Webhook verification successful');
      return new Response(challenge, { 
        status: 200, 
        headers: { "Content-Type": "text/plain" }
      });
    }
    console.log('Verification failed');
    return new Response("Forbidden", { status: 403 });
  }

  // 2) Receive webhooks
  if (req.method === "POST") {
    const body = await req.text();
    console.log("WA webhook:", body);
    return new Response("OK", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
});
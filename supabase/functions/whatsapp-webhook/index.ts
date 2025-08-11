import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const VERIFY_TOKEN = "p41fmgho19"; // Must match Meta exactly

serve(async (req) => {
  const url = new URL(req.url);

  // 1) Verification
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    
    console.log('Webhook verification attempt:', { 
      mode, 
      token, 
      challenge, 
      expectedToken: VERIFY_TOKEN,
      tokensMatch: token === VERIFY_TOKEN 
    });
    
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
    
    try {
      const data = JSON.parse(body);
      
      // Handle message status updates
      if (data.entry?.[0]?.changes?.[0]?.value?.statuses) {
        const statuses = data.entry[0].changes[0].value.statuses;
        for (const status of statuses) {
          console.log("Status update:", {
            id: status.id,
            status: status.status,
            recipient_id: status.recipient_id,
            timestamp: status.timestamp
          });
          
          // TODO: Update message status in database
          // You can implement this by calling a Supabase function or directly updating the DB
        }
      }
      
      // Handle inbound messages
      if (data.entry?.[0]?.changes?.[0]?.value?.messages) {
        const messages = data.entry[0].changes[0].value.messages;
        for (const message of messages) {
          console.log("Inbound message:", {
            from: message.from,
            text: message.text?.body,
            timestamp: message.timestamp
          });
          
          // Check for stop/unsubscribe
          const text = message.text?.body?.toLowerCase().trim();
          if (text === 'stop' || text === 'unsubscribe') {
            console.log("Opt-out request from:", message.from);
            // TODO: Mark number as opted out in database
          }
        }
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
    }
    
    return new Response("OK", { status: 200 });
  }

  return new Response("Method Not Allowed", { status: 405 });
});
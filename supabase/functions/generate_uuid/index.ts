
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  try {
    // Generate a UUID using the Crypto API
    const uuid = crypto.randomUUID();
    
    return new Response(
      JSON.stringify({ uuid }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

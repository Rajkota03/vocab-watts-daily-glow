
// /home/ubuntu/glintup_project/supabase/functions/send-otp/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to generate a random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }

    console.log(`Received OTP request for: ${phoneNumber}`);

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } }
    );

    // --- Generate OTP and Expiry ---
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    console.log(`Generated OTP: ${otp} for ${phoneNumber}, expires at ${expiresAt.toISOString()}`);

    // --- Store OTP in database (assuming an otp_codes table exists) ---
    // Table structure suggestion: id (uuid), phone_number (text), otp_code (text), expires_at (timestamptz), used (boolean)
    const { error: storeError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        phone_number: phoneNumber,
        otp_code: otp, // Consider hashing the OTP before storing for better security
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (storeError) {
      console.error("Error storing OTP:", storeError);
      throw new Error(`Database error storing OTP: ${storeError.message}`);
    }
    console.log("OTP stored successfully.");

    // --- Send OTP via WhatsApp (Invoke send-whatsapp function) ---
    // This assumes send-whatsapp can handle an OTP message type/template
    console.log(`Invoking send-whatsapp to send OTP ${otp} to ${phoneNumber}`);
    const { data: whatsappResult, error: whatsappError } = await supabaseAdmin.functions.invoke(
      "send-whatsapp",
      {
        body: {
          to: phoneNumber,
          messageType: "otp", // Add a flag to indicate OTP message type
          otpCode: otp,      // Pass the OTP code
          // Potentially include template name/variables if required by send-whatsapp
          // templateName: "your_otp_template_name",
          // templateVariables: { "1": otp, "2": "10" } // Example: Variable 1 is OTP, Variable 2 is expiry time in minutes
        },
      }
    );

    if (whatsappError) {
      console.error("Error invoking send-whatsapp for OTP:", whatsappError);
      // NOTE: Consider if you should delete the stored OTP if sending fails
      throw new Error(`Failed to send OTP via WhatsApp: ${whatsappError.message}`);
    }

    console.log("send-whatsapp invoked successfully for OTP:", whatsappResult);

    // --- Return Success Response ---
    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-otp function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

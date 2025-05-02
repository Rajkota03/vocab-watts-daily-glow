// /home/ubuntu/glintup_project/supabase/functions/verify-otp/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      throw new Error("Phone number and OTP are required.");
    }

    console.log(`Received OTP verification request for: ${phoneNumber}, OTP: ${otp}`);

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } }
    );

    // --- Find Valid OTP in Database ---
    const now = new Date();
    const { data: otpRecord, error: findError } = await supabaseAdmin
      .from("otp_codes")
      .select("id, otp_code") // Select the stored OTP code (potentially hashed)
      .eq("phone_number", phoneNumber)
      .eq("otp_code", otp) // Compare with the provided OTP (adjust if hashing)
      .eq("used", false)
      .gt("expires_at", now.toISOString()) // Check if not expired
      .order("created_at", { ascending: false }) // Get the latest valid OTP
      .maybeSingle();

    if (findError) {
      console.error("Error finding OTP:", findError);
      throw new Error(`Database error finding OTP: ${findError.message}`);
    }

    if (!otpRecord) {
      console.log("Invalid, expired, or already used OTP for:", phoneNumber);
      throw new Error("Invalid or expired OTP.");
    }

    console.log("Valid OTP found, ID:", otpRecord.id);

    // --- Mark OTP as used --- 
    const { error: updateError } = await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("Error marking OTP as used:", updateError);
      // Proceed with login attempt even if marking fails? Or throw error?
      // For now, log error and continue.
    } else {
      console.log("OTP marked as used successfully.");
    }

    // --- Verify with Supabase Auth (Phone OTP Sign-in) ---
    // This uses the built-in Supabase phone auth flow
    console.log(`Attempting Supabase Auth sign-in for ${phoneNumber}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: "sms", // or "whatsapp" if Supabase supports it directly in verifyOtp
    });

    if (authError) {
      console.error("Supabase Auth OTP verification error:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!authData || !authData.session) {
      console.error("Supabase Auth verification succeeded but no session returned.");
      // This might happen if the user doesn't exist yet and needs to be created
      // Or if the flow requires an additional step.
      // For now, treat as an error.
      throw new Error("Authentication succeeded but failed to establish a session.");
    }

    console.log("Supabase Auth sign-in successful, session obtained.");

    // --- Return Success Response with Session ---
    return new Response(JSON.stringify({ 
        success: true, 
        message: "OTP verified successfully.",
        session: authData.session // Return the session object
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in verify-otp function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


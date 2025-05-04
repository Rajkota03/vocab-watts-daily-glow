
// supabase/functions/verify-otp/index.ts
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

    // Format phone number if needed (ensure it has + prefix)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log(`Received OTP verification request for: ${formattedPhone}, OTP: ${otp}`);

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } 
      }
    );

    // --- Check if OTP is valid ---
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone_number", formattedPhone)
      .eq("otp_code", otp)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();  // Using maybeSingle instead of single to prevent errors

    if (otpError) {
      console.error("Error retrieving OTP:", otpError);
      throw new Error("Invalid or expired OTP code.");
    }

    if (!otpData) {
      throw new Error("Invalid or expired OTP code.");
    }

    console.log("Valid OTP found:", otpData);

    // --- Mark OTP as used ---
    const { error: updateError } = await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("Error updating OTP status:", updateError);
      throw new Error("Database error updating OTP status.");
    }

    console.log("OTP marked as used.");

    // --- Check for existing user subscription ---
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .eq("phone_number", formattedPhone)
      .limit(1)
      .maybeSingle();  // Using maybeSingle instead of single to prevent errors

    // --- Create session or return subscription data ---
    let responseData = { success: true };

    if (subError) {
      console.log("Error checking subscription:", subError);
      responseData.subscriptionExists = false;
    } else if (subscriptionData) {
      console.log("Existing subscription found:", subscriptionData);
      responseData.subscriptionExists = true;
      responseData.subscription = subscriptionData;
    } else {
      console.log("No existing subscription found.");
      responseData.subscriptionExists = false;
    }

    return new Response(JSON.stringify(responseData), {
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

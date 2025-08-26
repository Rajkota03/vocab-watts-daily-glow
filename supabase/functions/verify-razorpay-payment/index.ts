
// /home/ubuntu/glintup_project/supabase/functions/verify-razorpay-payment/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow requests from any origin (adjust in production)
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to verify Razorpay signature
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const generatedSignatureBuffer = await crypto.subtle.sign("HMAC", key, bodyData);

  // Convert ArrayBuffer to hex string
  const generatedSignature = Array.from(new Uint8Array(generatedSignatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  console.log("Generated Signature:", generatedSignature);
  console.log("Received Signature:", signature);

  return generatedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Get Environment Variables ---
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!razorpayKeySecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing environment variables: RAZORPAY_KEY_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Server configuration error.");
    }

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
       auth: { persistSession: false } // Important for server-side
    });

    // --- Parse Request Body ---
    const { 
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      firstName,
      lastName,
      whatsappNumber,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !whatsappNumber || !firstName) {
      throw new Error("Missing required payment or user details in request.");
    }

    // Format WhatsApp number to ensure it has a '+' prefix
    const formattedWhatsappNumber = whatsappNumber.startsWith('+') ? whatsappNumber : `+${whatsappNumber}`;
    console.log(`Processing payment with WhatsApp number: ${formattedWhatsappNumber}`);

    // --- Verify Razorpay Signature ---
    // Razorpay signature is created from order_id + "|" + payment_id
    const verificationBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isSignatureValid = await verifySignature(verificationBody, razorpay_signature, razorpayKeySecret);

    if (!isSignatureValid) {
      console.error("Invalid Razorpay signature.");
      throw new Error("Payment verification failed: Invalid signature.");
    }

    console.log("Razorpay signature verified successfully.");

    // --- Find Existing User Only ---
    let userId: string | undefined;

    // Check if user exists by email in profiles table
    const { data: existingUserData, error: getUserError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (getUserError && getUserError.code !== "PGRST116") { // PGRST116: Row not found
      console.error("Error checking for existing user:", getUserError);
      throw new Error("Database error checking user.");
    }

    if (existingUserData) {
      userId = existingUserData.id;
      console.log(`User found with email ${email}, ID: ${userId}`);
    } else {
      // User doesn't exist - payment should only be processed for existing authenticated users
      console.error(`Payment verification failed: No user found with email ${email}`);
      throw new Error("Payment verification failed: User must be registered and authenticated first.");
    }

    if (!userId) {
      throw new Error("Could not determine user ID after check/creation.");
    }

    // --- Update or Create Subscription ---
    const subscriptionEndDate = new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(); // Pro plan lasts 30 days

    const subscriptionData = {
      user_id: userId,
      phone_number: formattedWhatsappNumber,
      is_pro: true,
      subscription_ends_at: subscriptionEndDate,
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      delivery_time: '10:00', // Fixed 10 AM delivery time
      // Add category if needed
    };

    // Upsert: Update if exists (based on user_id), otherwise insert
    const { data: upsertedSubscription, error: upsertError } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(subscriptionData, { onConflict: "user_id" })
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting subscription:", upsertError);
      throw new Error(`Failed to update subscription: ${upsertError.message}`);
    }

    console.log("Subscription successfully updated/created for Pro plan:", upsertedSubscription);

    // --- Return Success Response ---
    return new Response(JSON.stringify({ success: true, userId: userId, subscriptionId: upsertedSubscription.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in verify-razorpay-payment function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400, // Use 400 for client-related errors, 500 for server errors
    });
  }
});


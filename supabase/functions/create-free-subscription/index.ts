
// supabase/functions/create-free-subscription/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Helper function for date manipulation using only native JavaScript
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Get Environment Variables ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Server configuration error.");
    }

    // --- Initialize Supabase Admin Client with Service Role ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }, 
      global: { 
        headers: { 
          Authorization: `Bearer ${supabaseServiceRoleKey}`
        }
      }
    });

    // --- Parse Request Body ---
    const { 
      phoneNumber,
      firstName,
      lastName,
      deliveryTime,
    } = await req.json();

    if (!phoneNumber || !firstName || !deliveryTime) {
      throw new Error("Missing required details: phoneNumber, firstName, or deliveryTime.");
    }

    console.log("Received free trial request:", { phoneNumber, firstName, deliveryTime });

    // --- Check if subscription already exists ---
    const { data: existingSub, error: checkError, count } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id", { count: "exact" })
      .eq("phone_number", phoneNumber);

    if (checkError) {
      console.error("Error checking for existing subscription:", checkError);
      throw new Error("Database error checking subscription.");
    }

    if (count && count > 0) {
      console.log("Subscription already exists for phone number:", phoneNumber);
      throw new Error("This phone number already has an active subscription.");
    }

    // --- Create Free Trial Subscription ---
    // Use native JavaScript Date handling
    const now = new Date();
    const trialEndsAt = addDays(now, 3).toISOString();

    const subscriptionData = {
      phone_number: phoneNumber,
      is_pro: false,
      trial_ends_at: trialEndsAt,
      delivery_time: deliveryTime,
      first_name: firstName,
      last_name: lastName || '',
      category: 'general' // Set default category
    };

    console.log("Inserting free trial subscription with service role client:", JSON.stringify(subscriptionData));

    const { data: newSubscription, error: insertError } = await supabaseAdmin
      .from("user_subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting free trial subscription:", insertError);
      throw new Error(`Failed to create subscription: ${insertError.message}`);
    }

    console.log("Free trial subscription created successfully:", newSubscription);

    // --- Trigger Welcome Message ---
    try {
      console.log("Invoking send-whatsapp function for welcome message...");
      const { data: whatsappResult, error: whatsappError } = await supabaseAdmin.functions.invoke(
        "send-whatsapp",
        {
          body: {
            to: phoneNumber,
            category: "general",
            isPro: false,
            sendImmediately: true,
            firstName: firstName,
            message: `Welcome to VocabSpark, ${firstName}! Your free trial has started. You'll receive daily vocabulary words at your preferred time. Enjoy learning!`
          },
        }
      );

      if (whatsappError) {
        console.error("Error invoking send-whatsapp function:", whatsappError);
      } else {
        console.log("send-whatsapp function invoked successfully:", whatsappResult);
      }
    } catch (invokeErr) {
      console.error("Failed to invoke send-whatsapp function:", invokeErr);
    }

    // --- Return Success Response ---
    return new Response(JSON.stringify({ success: true, subscriptionId: newSubscription.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-free-subscription function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

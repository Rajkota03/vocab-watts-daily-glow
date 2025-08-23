import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      phoneNumber, 
      email, 
      password, 
      razorpayOrderId, 
      razorpayPaymentId 
    } = await req.json();

    if (!phoneNumber || !email || !password || !razorpayOrderId || !razorpayPaymentId) {
      throw new Error("Missing required fields for upgrade completion.");
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log(`Processing upgrade completion for: ${formattedPhone}`);

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } 
      }
    );

    // --- Find existing trial user by phone number ---
    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*, profiles!inner(*)")
      .eq("phone_number", formattedPhone)
      .single();

    if (subError || !existingSubscription) {
      console.error("No existing subscription found:", subError);
      throw new Error("No trial subscription found for this phone number.");
    }

    const userId = existingSubscription.user_id;
    if (!userId) {
      throw new Error("No user ID associated with subscription.");
    }

    console.log("Found existing trial user:", userId);

    // --- Update User Auth Record with Email/Password ---
    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          ...existingSubscription.profiles.user_metadata,
          trial_user: false, // No longer a trial user
          upgraded_at: new Date().toISOString()
        }
      }
    );

    if (updateUserError) {
      console.error("Error updating user auth:", updateUserError);
      throw new Error(`Failed to update user credentials: ${updateUserError.message}`);
    }

    console.log("User auth record updated successfully");

    // --- Update Profile to mark as no longer trial user ---
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        trial_user: false,
        email: email
      })
      .eq("id", userId);

    if (profileUpdateError) {
      console.error("Error updating profile:", profileUpdateError);
      throw new Error("Failed to update user profile.");
    }

    // --- Update Subscription to Pro ---
    const now = new Date();
    const subscriptionEndsAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

    const { error: subscriptionUpdateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        is_pro: true,
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        trial_ends_at: null, // Clear trial end date
        email: email,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        category: 'business' // Default pro category
      })
      .eq("user_id", userId);

    if (subscriptionUpdateError) {
      console.error("Error updating subscription:", subscriptionUpdateError);
      throw new Error("Failed to upgrade subscription to Pro.");
    }

    console.log("Subscription upgraded to Pro successfully");

    // --- Send Welcome to Pro Message ---
    try {
      console.log("Scheduling Pro welcome message...");
      const { error: welcomeError } = await supabaseAdmin
        .from("outbox_messages")
        .insert({
          user_id: userId,
          phone: formattedPhone,
          template: 'glintup_vocab_fulfilment',
          variables: {
            firstName: existingSubscription.first_name,
            word: 'Premium',
            definition: 'Of exceptional quality or superior grade; first-class',
            example: 'Congratulations on upgrading to Premium! You now have access to advanced vocabulary categories.',
            pronunciation: '/ˈpriːmiəm/',
            memoryHook: 'PREMIUM sounds like "pre-me-um" - you\'re getting the best before everyone else.'
          },
          send_at: new Date().toISOString(), // Send immediately
          status: 'queued'
        });

      if (welcomeError) {
        console.error("Error scheduling Pro welcome message:", welcomeError);
      } else {
        console.log("Pro welcome message scheduled successfully");
      }
    } catch (welcomeError) {
      console.error("Failed to schedule Pro welcome message:", welcomeError);
      // Don't throw error - upgrade is successful
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Successfully upgraded to Pro",
      userId: userId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in complete-upgrade function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
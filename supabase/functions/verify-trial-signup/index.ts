import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp, firstName, lastName } = await req.json();

    if (!phoneNumber || !otp || !firstName) {
      throw new Error("Phone number, OTP, and first name are required.");
    }

    // Format phone number if needed (ensure it has + prefix)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log(`Processing trial signup for: ${formattedPhone}, OTP: ${otp}`);

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
      .maybeSingle();

    if (otpError) {
      console.error("Error retrieving OTP:", otpError);
      throw new Error("Invalid or expired OTP code.");
    }

    if (!otpData) {
      throw new Error("Invalid or expired OTP code.");
    }

    console.log("Valid OTP found, creating Supabase Auth user...");

    // --- Mark OTP as used ---
    const { error: updateError } = await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("Error updating OTP status:", updateError);
      throw new Error("Database error updating OTP status.");
    }

    // --- Generate a temporary password for the user ---
    const tempPassword = `temp${Math.random().toString(36).substring(2, 15)}`;
    
    // --- Create Supabase Auth User ---
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      phone: formattedPhone,
      email: `${formattedPhone.replace('+', '')}@temp.glintup.com`, // Temporary email
      password: tempPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName || '',
        whatsapp_number: formattedPhone,
        trial_user: true
      },
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      throw new Error(`Failed to create user account: ${createUserError.message}`);
    }

    console.log("Supabase Auth user created:", newUser.user?.id);

    // --- Create Trial Subscription ---
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now

    const subscriptionData = {
      user_id: newUser.user!.id,
      phone_number: formattedPhone,
      is_pro: false,
      trial_ends_at: trialEndsAt.toISOString(),
      delivery_time: '10:00',
      first_name: firstName,
      last_name: lastName || '',
      category: 'daily'
    };

    console.log("Creating trial subscription...");
    const { data: newSubscription, error: insertError } = await supabaseAdmin
      .from("user_subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      throw new Error(`Failed to create subscription: ${insertError.message}`);
    }

    console.log("Trial subscription created successfully");

    // --- Send Immediate Welcome Word ---
    try {
      console.log("Scheduling immediate welcome word...");
      const { data: outboxResult, error: outboxError } = await supabaseAdmin
        .from("outbox_messages")
        .insert({
          user_id: newUser.user!.id,
          phone: formattedPhone,
          template: 'glintup_vocab_fulfilment',
          variables: {
            firstName: firstName,
            word: 'Welcome',
            definition: 'A greeting expressing pleasure at someone\'s arrival',
            example: 'Welcome to Glintup! We\'re excited to help you expand your vocabulary.',
            pronunciation: '/ˈwelkəm/',
            memoryHook: 'Think of opening your arms wide to WELCOME someone into your home.'
          },
          send_at: new Date().toISOString(), // Send immediately
          status: 'queued'
        });

      if (outboxError) {
        console.error("Error scheduling welcome word:", outboxError);
      } else {
        console.log("Welcome word scheduled successfully");
      }
    } catch (welcomeError) {
      console.error("Failed to schedule welcome word:", welcomeError);
      // Don't throw error - subscription is created successfully
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userId: newUser.user!.id,
      subscriptionId: newSubscription.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in verify-trial-signup function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
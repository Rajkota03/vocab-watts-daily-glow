
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

    // Format phone number if needed (ensure it has + prefix)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log(`Received OTP verification request for: ${formattedPhone}, OTP: ${otp}`);

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
      .select("id, otp_code") 
      .eq("phone_number", formattedPhone)
      .eq("otp_code", otp) 
      .eq("used", false)
      .gt("expires_at", now.toISOString()) 
      .order("created_at", { ascending: false }) 
      .maybeSingle();

    if (findError) {
      console.error("Error finding OTP:", findError);
      throw new Error(`Database error finding OTP: ${findError.message}`);
    }

    if (!otpRecord) {
      console.log("Invalid, expired, or already used OTP for:", formattedPhone);
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
      // Log error but continue
    } else {
      console.log("OTP marked as used successfully.");
    }

    // --- Create or get user and session ---
    let userId: string | null = null;
    let session: any = null;
    
    // Check if a user with this phone number already exists
    const { data: existingUser, error: userLookupError } = await supabaseAdmin.auth
      .admin
      .listUsers({
        filter: {
          identities: {
            identity_data: {
              phone: formattedPhone
            }
          }
        }
      });
      
    if (userLookupError) {
      console.error("Error looking up user:", userLookupError);
      // Continue to try creating user
    }

    if (existingUser && existingUser.users && existingUser.users.length > 0) {
      // User exists, create a new session for them
      userId = existingUser.users[0].id;
      console.log("Found existing user with ID:", userId);
      
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        userId: userId,
        properties: {
          provider: "phone",
        }
      });
      
      if (sessionError) {
        console.error("Error creating session for existing user:", sessionError);
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }
      
      session = sessionData;
      console.log("Created new session for existing user");
      
    } else {
      // User doesn't exist, create a new user with this phone number
      console.log("No existing user found, creating new user with phone:", formattedPhone);
      
      const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        phone: formattedPhone,
        phone_confirm: true,
        user_metadata: {
          phone_verified: true,
          provider: "whatsapp"
        }
      });
      
      if (createUserError) {
        console.error("Error creating new user:", createUserError);
        throw new Error(`Failed to create user: ${createUserError.message}`);
      }
      
      userId = userData.user.id;
      
      // Create session for the new user
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        userId: userData.user.id,
        properties: {
          provider: "phone",
        }
      });
      
      if (sessionError) {
        console.error("Error creating session for new user:", sessionError);
        throw new Error(`Failed to create session for new user: ${sessionError.message}`);
      }
      
      session = sessionData;
      console.log("Created new user and session");
    }

    // --- Return Success Response with Session ---
    return new Response(JSON.stringify({ 
        success: true, 
        message: "OTP verified successfully.",
        session: session, // Return the session object
        userId: userId
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

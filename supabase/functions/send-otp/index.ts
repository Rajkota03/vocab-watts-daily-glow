
// supabase/functions/send-otp/index.ts
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
    const { phoneNumber, templateId } = await req.json();

    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }

    // Format phone number if needed (ensure it has + prefix)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.log(`Received OTP request for: ${formattedPhone}`);

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` } } 
      }
    );

    // --- Generate OTP and Expiry ---
    const otp = generateOtp();
    // Create expiry time 10 minutes from now using native JavaScript Date
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    console.log(`Generated OTP: ${otp} for ${formattedPhone}, expires at ${expiresAt.toISOString()}`);

    // --- Store OTP in database (assuming an otp_codes table exists) ---
    const { error: storeError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        phone_number: formattedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (storeError) {
      console.error("Error storing OTP:", storeError);
      throw new Error(`Database error storing OTP: ${storeError.message}`);
    }
    console.log("OTP stored successfully.");

    // --- Send OTP via WhatsApp (Invoke send-whatsapp function) ---
    // Format the OTP message with clear formatting for better visibility
    const otpMessage = `Your GlintUp verification code is: *${otp}*\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;
    
    // Get template ID from parameter, environment or default
    const whatsAppTemplateId = templateId || 
      Deno.env.get("WHATSAPP_TEMPLATE_SID") || 
      Deno.env.get("TWILIO_WHATSAPP_TEMPLATE_SID");
    
    console.log(`Invoking send-whatsapp to send OTP ${otp} to ${formattedPhone}`);
    console.log(`Using template: ${whatsAppTemplateId ? 'Yes' : 'No'}`);
    
    const requestBody: any = {
      to: formattedPhone,
      message: otpMessage, // Fallback message if template is not available or fails
      debugMode: true
    };
    
    // If a template ID is available, use it (this will bypass opt-in requirements)
    if (whatsAppTemplateId) {
      requestBody.templateId = whatsAppTemplateId;
      requestBody.templateValues = {
        otp: otp,
        expiryMinutes: "10",
        appName: "GlintUp"
      };
      console.log("Using template ID:", whatsAppTemplateId);
    }
    
    const { data: whatsappResult, error: whatsappError } = await supabaseAdmin.functions.invoke(
      "send-whatsapp",
      { body: requestBody }
    );

    if (whatsappError) {
      console.error("Error invoking send-whatsapp function:", whatsappError);
      throw new Error(`Failed to send OTP via WhatsApp: ${whatsappError.message}`);
    }

    console.log("send-whatsapp invoked successfully for OTP:", whatsappResult);

    // Format the response to include helpful information for debugging
    const responseData = {
      success: true,
      message: "OTP sent successfully.",
      messageId: whatsappResult?.messageId,
      status: whatsappResult?.status,
      webhookUrl: whatsappResult?.webhookUrl,
      usingTemplate: whatsappResult?.usingTemplate || !!whatsAppTemplateId,
      templateId: whatsappResult?.templateId || whatsAppTemplateId,
      messagingServiceSid: whatsappResult?.messagingServiceSid,
      troubleshooting: whatsappResult?.troubleshooting
    };

    // --- Return Success Response ---
    return new Response(JSON.stringify(responseData), {
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

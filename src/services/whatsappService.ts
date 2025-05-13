
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * WhatsApp Service
 * 
 * This service handles sending messages to users via WhatsApp using Twilio.
 */

export interface SendWhatsAppRequest {
  phoneNumber: string;
  message?: string; // Made optional since templates don't always need a fallback message
  userId?: string;
  templateId?: string;
  templateValues?: Record<string, string>;
}

/**
 * Send a WhatsApp message via Twilio using the send-whatsapp edge function.
 * 
 * @param request The request parameters
 * @returns 
 */
export const sendWhatsAppMessage = async (request: SendWhatsAppRequest): Promise<boolean> => {
  try {
    console.log("[WhatsApp] Sending message via WhatsApp", { 
      phoneNumber: request.phoneNumber,
      messageLength: request.message?.length || 0,
      userId: request.userId,
      useTemplate: !!request.templateId
    });
    
    // Validate phone number 
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[WhatsApp] Invalid phone number:", request.phoneNumber);
      throw new Error("Invalid phone number provided. Please include country code (e.g., +1 for US)");
    }
    
    // For upgraded Twilio accounts, messages can be sent without templates
    // but templates are preferred and don't require a message body
    if (!request.message && !request.templateId) {
      console.error("[WhatsApp] When not using templates, message content is required");
      throw new Error("Either message content or template ID is required.");
    }

    // Format phone number if needed
    let formattedPhone = request.phoneNumber.trim();
    // If number doesn't start with +, add it
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
      console.log(`[WhatsApp] Added + prefix to number: ${formattedPhone}`);
    }

    // Call our edge function to send the WhatsApp message
    console.log(`[WhatsApp] Invoking send-whatsapp function for ${formattedPhone}`);
    
    const requestPayload: any = {
      to: formattedPhone,
      userId: request.userId || null,
      sendImmediately: true,
      debugMode: true
    };
    
    // Add template information as priority if provided
    if (request.templateId) {
      requestPayload.templateId = request.templateId;
      if (request.templateValues) {
        requestPayload.templateValues = request.templateValues;
      }
      console.log("[WhatsApp] Using template mode with ID:", request.templateId);
    }
    
    // Add message if provided (as fallback or primary content)
    if (request.message) {
      requestPayload.message = request.message;
    }
    
    const { data: functionResult, error: functionError } = await supabase.functions.invoke("send-whatsapp", {
      body: requestPayload,
    });
    
    if (functionError) {
      console.error("[WhatsApp] Error invoking send-whatsapp function:", functionError);
      throw new Error(`Failed to send message: ${functionError.message}`);
    }
    
    // Check the success flag from the function's response
    if (!functionResult || !functionResult.success) {
      console.error("[WhatsApp] send-whatsapp function returned failure:", functionResult?.error);
      
      // Extract detailed error information if available
      let errorMessage = functionResult?.error || "Failed to send WhatsApp message.";
      
      // Add extra context for specific error codes with adjusted messaging for upgraded accounts
      if (functionResult?.details?.twilioError?.code === 63016) {
        errorMessage = "Error 63016: WhatsApp message could not be delivered. Please verify the recipient's phone number format and WhatsApp availability.";
      } else if (functionResult?.details?.tip) {
        errorMessage += ` Tip: ${functionResult.details.tip}`;
      }
      
      throw new Error(errorMessage);
    }

    console.log("[WhatsApp] Successfully sent message:", functionResult);
    
    // Additional information about the message status
    if (functionResult.status === 'queued') {
      console.log("[WhatsApp] Message is queued for delivery. Check Twilio console for final status.");
    }
    
    return true;

  } catch (error) {
    console.error("[WhatsApp] Failed to send WhatsApp message:", error);
    throw error; // Re-throw error so calling components can handle it
  }
};

/**
 * Verify if the WhatsApp integration is properly configured.
 * This function checks that all required Twilio credentials are set.
 */
export const verifyWhatsAppConfig = async (): Promise<{
  isConfigured: boolean;
  details?: any;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { checkConfig: true }
    });
    
    if (error) {
      console.error("[WhatsApp] Error verifying config:", error);
      return { isConfigured: false, details: { error: error.message } };
    }
    
    return { 
      isConfigured: data?.success === true,
      details: data
    };
  } catch (error) {
    console.error("[WhatsApp] Failed to verify WhatsApp config:", error);
    return { isConfigured: false, details: { error: String(error) } };
  }
};

/**
 * Send an OTP code via WhatsApp using a template
 * Templates are the preferred method for WhatsApp Business API
 */
export const sendOtpViaWhatsApp = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Use the default OTP template from environment or fall back to a known SID
    // You would need to set this in your Supabase secrets or .env file
    const templateId = import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE_SID || "YOUR_OTP_TEMPLATE_SID";
    
    return await sendWhatsAppMessage({
      phoneNumber,
      message: `Your verification code is: ${otp}`, // Fallback message if template fails
      templateId,
      templateValues: {
        otp: otp,
        expiryMinutes: "10", // Adjust as needed for your template
        appName: "GlintUp" // Your app name
      }
    });
  } catch (error) {
    console.error("[WhatsApp] Failed to send OTP via WhatsApp:", error);
    throw error;
  }
};

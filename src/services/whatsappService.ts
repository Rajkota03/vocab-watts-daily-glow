
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * WhatsApp Service
 * 
 * This service handles sending messages to users via WhatsApp using Twilio.
 */

export interface SendWhatsAppRequest {
  phoneNumber: string;
  message: string;
  userId?: string;
}

/**
 * Send a WhatsApp message via Twilio using the send-whatsapp edge function.
 */
export const sendWhatsAppMessage = async (request: SendWhatsAppRequest): Promise<boolean> => {
  try {
    console.log("[WhatsApp] Sending message via WhatsApp", { 
      phoneNumber: request.phoneNumber,
      messageLength: request.message?.length || 0,
      userId: request.userId
    });
    
    // Validate phone number 
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[WhatsApp] Invalid phone number:", request.phoneNumber);
      throw new Error("Invalid phone number provided. Please include country code (e.g., +1 for US)");
    }
    
    // Validate message
    if (!request.message) {
      console.error("[WhatsApp] Message content is required");
      throw new Error("Message content is required.");
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
    const { data: functionResult, error: functionError } = await supabase.functions.invoke("send-whatsapp", {
      body: {
        to: formattedPhone,
        message: request.message,
        userId: request.userId || null,
        sendImmediately: true,
        debugMode: true
      },
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
      if (functionResult?.details?.tip) {
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

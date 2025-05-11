
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
      throw new Error("Invalid phone number provided.");
    }
    
    // Validate message
    if (!request.message) {
      console.error("[WhatsApp] Message content is required");
      throw new Error("Message content is required.");
    }

    // Call our edge function to send the WhatsApp message
    console.log(`[WhatsApp] Invoking send-whatsapp function for ${request.phoneNumber}`);
    const { data: functionResult, error: functionError } = await supabase.functions.invoke("send-whatsapp", {
      body: {
        to: request.phoneNumber,
        message: request.message,
        userId: request.userId || null,
        sendImmediately: true,
        debugMode: true
      },
    });
    
    if (functionError) {
      console.error("[WhatsApp] Error invoking send-whatsapp function:", functionError);
      throw new Error(`Failed to send message via Edge Function: ${functionError.message}`);
    }
    
    // Check the success flag from the function's response
    if (!functionResult || !functionResult.success) {
       console.error("[WhatsApp] send-whatsapp function returned failure:", functionResult?.error);
       throw new Error(functionResult?.error || "send-whatsapp function failed without specific error.");
    }

    console.log("[WhatsApp] Successfully sent message:", functionResult);
    return true;

  } catch (error) {
    console.error("[WhatsApp] Failed to send WhatsApp message:", error);
    throw error; // Re-throw error so calling components can handle it
  }
};

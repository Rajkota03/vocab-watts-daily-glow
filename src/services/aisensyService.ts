
/**
 * AiSensy WhatsApp API Service
 * Documentation: https://aisensy.com/api-docs
 */

import { supabase } from "@/integrations/supabase/client";

export interface SendWhatsAppRequest {
  phoneNumber: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  userId?: string;
}

/**
 * Format phone number for AiSensy API
 * @param phoneNumber The phone number to format
 * @returns formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Clean the phone number - remove spaces, dashes, parentheses, etc.
  const cleaned = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Ensure it starts with '+' if it doesn't already
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Send a WhatsApp message via AiSensy API
 * 
 * @param request The request parameters
 * @returns Promise with success status
 */
export const sendWhatsAppMessage = async (request: SendWhatsAppRequest): Promise<boolean> => {
  try {
    console.log("[AiSensy] Sending WhatsApp message", { 
      phoneNumber: request.phoneNumber,
      messageLength: request.message?.length || 0,
      templateName: request.templateName,
      userId: request.userId
    });
    
    // Validate phone number 
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[AiSensy] Invalid phone number:", request.phoneNumber);
      throw new Error("Invalid phone number provided. Please include country code (e.g., +1 for US)");
    }
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(request.phoneNumber.trim());
    console.log(`[AiSensy] Formatted phone number: ${formattedPhone}`);
    
    const { data: functionResult, error: functionError } = await supabase.functions.invoke("send-whatsapp", {
      body: {
        provider: "aisensy",
        to: formattedPhone,
        userId: request.userId || null,
        message: request.message,
        templateName: request.templateName,
        templateParams: request.templateParams,
        sendImmediately: true,
        debugMode: true
      },
    });
    
    if (functionError) {
      console.error("[AiSensy] Error invoking send-whatsapp function:", functionError);
      throw new Error(`Failed to send message: ${functionError.message}`);
    }
    
    // Check the success flag from the function's response
    if (!functionResult || !functionResult.success) {
      console.error("[AiSensy] send-whatsapp function returned failure:", functionResult?.error);
      
      // Extract detailed error information if available
      let errorMessage = functionResult?.error || "Failed to send WhatsApp message.";
      
      if (functionResult?.details?.tip) {
        errorMessage += ` Tip: ${functionResult.details.tip}`;
      }
      
      throw new Error(errorMessage);
    }

    console.log("[AiSensy] Successfully sent message:", functionResult);
    
    return true;

  } catch (error) {
    console.error("[AiSensy] Failed to send WhatsApp message:", error);
    throw error; // Re-throw error so calling components can handle it
  }
};

/**
 * Verify if the AiSensy integration is properly configured.
 * This function checks that all required AiSensy credentials are set.
 */
export const verifyAiSensyConfig = async (): Promise<{
  isConfigured: boolean;
  details?: any;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { checkConfig: true, provider: "aisensy" }
    });
    
    if (error) {
      console.error("[AiSensy] Error verifying config:", error);
      return { isConfigured: false, details: { error: error.message } };
    }
    
    return { 
      isConfigured: data?.success === true,
      details: data
    };
  } catch (error) {
    console.error("[AiSensy] Failed to verify AiSensy config:", error);
    return { isConfigured: false, details: { error: String(error) } };
  }
};

/**
 * Get available templates from AiSensy
 */
export const getAvailableTemplates = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("aisensy-templates", {
      body: { action: "list" }
    });
    
    if (error) {
      console.error("[AiSensy] Error fetching templates:", error);
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
    
    if (!data?.templates) {
      return [];
    }
    
    return data.templates;
  } catch (error) {
    console.error("[AiSensy] Failed to get templates:", error);
    throw error;
  }
};

/**
 * Send OTP via WhatsApp
 */
export const sendOtpViaWhatsApp = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Use direct messaging for better delivery
    const message = `Your verification code is: ${otp}. It expires in 10 minutes.`;
    
    console.log("[AiSensy] Sending OTP to:", phoneNumber);
    
    return await sendWhatsAppMessage({
      phoneNumber,
      message
    });
  } catch (error) {
    console.error("[AiSensy] Failed to send OTP:", error);
    throw error;
  }
};


import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * WhatsApp Service
 * 
 * This service handles sending messages to users via WhatsApp using Twilio.
 */

// Default template ID for OTP messages
const DEFAULT_OTP_TEMPLATE_ID = "HXabe0b61588dacdb93c6f458288896582";

export interface SendWhatsAppRequest {
  phoneNumber: string;
  message?: string; // Made optional since templates don't always need a fallback message
  userId?: string;
  templateId?: string;
  templateValues?: Record<string, string>;
  forceDirectMessage?: boolean; // Add option to force direct message without template
}

/**
 * Check if a phone number is likely from the US
 * @param phoneNumber The phone number to check
 * @returns boolean indicating if it's a US number
 */
export const isUSPhoneNumber = (phoneNumber: string): boolean => {
  // Clean the phone number
  const cleanedNumber = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Check for US country code (+1)
  return cleanedNumber.startsWith('+1') || 
         cleanedNumber.startsWith('1') && cleanedNumber.length >= 10;
};

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
      useTemplate: !!request.templateId && !request.forceDirectMessage
    });
    
    // Validate phone number 
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[WhatsApp] Invalid phone number:", request.phoneNumber);
      throw new Error("Invalid phone number provided. Please include country code (e.g., +1 for US)");
    }
    
    // Format phone number if needed
    let formattedPhone = request.phoneNumber.trim();
    // If number doesn't start with +, add it
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
      console.log(`[WhatsApp] Added + prefix to number: ${formattedPhone}`);
    }
    
    // Check if it's a US number - these need special handling after April 1, 2025
    const isUSNumber = isUSPhoneNumber(formattedPhone);
    
    // For upgraded Twilio accounts, messages can be sent without templates
    // but templates are preferred and don't require a message body
    // However, US numbers have restrictions on template messages after April 1, 2025
    const shouldUseTemplate = request.templateId && !request.forceDirectMessage && !isUSNumber;
    
    if (!request.message && !shouldUseTemplate) {
      console.error("[WhatsApp] When not using templates, message content is required");
      throw new Error("Either message content or template ID is required.");
    }

    // Call our edge function to send the WhatsApp message
    console.log(`[WhatsApp] Invoking send-whatsapp function for ${formattedPhone}`, {
      useTemplate: shouldUseTemplate,
      isUSNumber,
      forceDirectMessage: request.forceDirectMessage
    });
    
    const requestPayload: any = {
      to: formattedPhone,
      userId: request.userId || null,
      sendImmediately: true,
      debugMode: true,
      isUSNumber
    };
    
    // Add template information as priority if we should use a template
    if (shouldUseTemplate) {
      requestPayload.templateId = request.templateId;
      if (request.templateValues) {
        requestPayload.templateValues = request.templateValues;
      }
      console.log("[WhatsApp] Using template mode with ID:", request.templateId);
    } else if (request.forceDirectMessage) {
      console.log("[WhatsApp] Forcing direct message without template (user request)");
    } else if (isUSNumber) {
      console.log("[WhatsApp] Using direct message for US number due to template restrictions");
    }
    
    // Add message if provided (as fallback or primary content)
    if (request.message) {
      requestPayload.message = request.message;
    } else if (!shouldUseTemplate) {
      // Provide a default message if no template or message is specified
      requestPayload.message = "Message from GlintUp";
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
      
      // Add extra context for specific error codes
      if (functionResult?.details?.twilioError?.code === 63016) {
        errorMessage = "Error 63016: WhatsApp message could not be delivered. Please verify the recipient's phone number format and WhatsApp availability.";
      } else if (functionResult?.details?.twilioError?.code === 63049) {
        errorMessage = "Error 63049: US recipients cannot receive template messages after April 1, 2025. Switching to direct messaging.";
        
        // If this was a template error for US number, retry with direct message
        if (isUSNumber && !request.forceDirectMessage) {
          console.log("[WhatsApp] Retrying US number with direct message instead of template");
          return await sendWhatsAppMessage({
            ...request,
            forceDirectMessage: true,
            templateId: undefined
          });
        }
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
 * Send an OTP code via WhatsApp using a template or direct message
 * For US numbers, direct messages will be used automatically
 */
export const sendOtpViaWhatsApp = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Determine if this is a US number
    const isUS = isUSPhoneNumber(phoneNumber);
    const message = `Your verification code is: ${otp}. It expires in 10 minutes.`;
    
    // For US numbers, we'll prioritize direct messaging
    if (isUS) {
      console.log("[WhatsApp] Using direct message for US number:", phoneNumber);
      return await sendWhatsAppMessage({
        phoneNumber,
        message,
        forceDirectMessage: true
      });
    }
    
    // For non-US numbers, use template with fallback
    return await sendWhatsAppMessage({
      phoneNumber,
      message, // Fallback message if template fails
      templateId: DEFAULT_OTP_TEMPLATE_ID,
      templateValues: {
        otp: otp,
        expiryMinutes: "10",
        name: "User"
      }
    });
  } catch (error) {
    console.error("[WhatsApp] Failed to send OTP via WhatsApp:", error);
    throw error;
  }
};

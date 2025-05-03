
// Removed unused imports: createSubscription, getVocabWordsByCategory
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { generateNewWordBatch } from "./wordService"; // Import the correct function for getting words

/**
 * WhatsApp Service
 * 
 * This service handles sending vocabulary words to users via WhatsApp.
 */

export interface SendWordsRequest {
  phoneNumber: string;
  category?: string;
  isPro?: boolean; // This might be redundant if we fetch status based on userId
  userId: string; // Make userId mandatory for fetching words and status
  sendImmediately?: boolean; // Flag for immediate delivery (e.g., welcome message)
  messageOverride?: string; // Optional: Use this specific message instead of generating words
}

// Define types based on our database schema
type VocabWord = Database["public"]["Tables"]["vocabulary_words"]["Row"];

// Format words for WhatsApp message
const formatWhatsAppMessage = (words: VocabWord[], isPro: boolean, firstName?: string): string => {
  const name = firstName || "there";
  const header = `🌟 *Hi ${name}! Here are Your VocabSpark Words* 🌟\n\n`;
  
  if (!words || words.length === 0) {
     return `Hi ${name}, we couldn't find any new words for your selected category right now. Please try again later or check your settings!`;
  }
  
  const formattedWords = words.map((word, index) => {
    return `*${index + 1}. ${word.word}*\n` +
           `Definition: ${word.definition}\n` +
           `Example: _"${word.example}"_\n\n`; // Add double newline for spacing
  }).join(""); // Join without extra newline
  
  const footer = isPro 
    ? `\n🚀 *Pro Subscription Active* - Thank you for supporting VocabSpark!`
    : `\n👉 Upgrade to Pro for custom word categories and more features!`;
  
  return header + formattedWords + footer;
};

/**
 * Send vocabulary words via WhatsApp using the send-whatsapp edge function.
 */
export const sendVocabWords = async (request: SendWordsRequest): Promise<boolean> => {
  try {
    console.log("[WhatsApp] Sending vocabulary words via WhatsApp", { 
      userId: request.userId, 
      phoneNumber: request.phoneNumber, 
      category: request.category, 
      sendImmediately: request.sendImmediately,
      hasMessageOverride: !!request.messageOverride
    });
    
    // Validate phone number and userId
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[WhatsApp] Invalid phone number:", request.phoneNumber);
      throw new Error("Invalid phone number provided.");
    }
    if (!request.userId) {
       console.error("[WhatsApp] Missing userId.");
       throw new Error("User ID is required to send words.");
    }
    
    let finalMessage: string;
    let isProUser = false; // Assume not Pro unless determined otherwise
    let userFirstName: string | undefined;

    // Try to get user profile info (including name and Pro status)
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, nick_name")
        .eq("id", request.userId)
        .single();
        
      if (profileError) {
         console.warn(`[WhatsApp] Could not fetch profile for user ${request.userId}:`, profileError.message);
      } else if (profile) {
         userFirstName = profile.first_name || profile.nick_name;
      }
      
      // Check Pro status using the function from subscriptionService
      const { checkUserProStatus } = await import("./subscriptionService"); 
      isProUser = await checkUserProStatus(request.userId);
      console.log(`[WhatsApp] User ${request.userId} Pro status: ${isProUser}`);

    } catch (err) {
      console.error("[WhatsApp] Error retrieving user profile or status:", err);
      // Proceed without name/status if necessary, or throw error if critical
    }

    // Determine the message content
    if (request.messageOverride) {
       finalMessage = request.messageOverride;
       console.log("[WhatsApp] Using message override.");
    } else {
       // Fetch words using the new service function
       const categoryToFetch = request.category || "general"; // Default to general if no category
       console.log(`[WhatsApp] Fetching words for category: ${categoryToFetch}`);
       const words = await generateNewWordBatch(request.userId, categoryToFetch);
       
       // Format the message using fetched words
       finalMessage = formatWhatsAppMessage(words || [], isProUser, userFirstName);
    }
    
    // Call our edge function to send the WhatsApp message
    console.log(`[WhatsApp] Invoking send-whatsapp function for ${request.phoneNumber}`);
    const { data: functionResult, error: functionError } = await supabase.functions.invoke("send-whatsapp", {
      body: {
        to: request.phoneNumber,
        message: finalMessage,
        // Pass necessary info, but the function itself might re-verify status/details
        userId: request.userId, 
        category: request.category, // Pass category for potential logging/context
        isPro: isProUser, // Pass the determined Pro status
        sendImmediately: request.sendImmediately || false // Ensure this flag is passed
      },
    });
    
    if (functionError) {
      console.error("[WhatsApp] Error invoking send-whatsapp function:", functionError);
      // Attempt to parse Supabase function error details if available
      let details = functionError.message;
      if (functionError.context && functionError.context.details) {
         details = functionError.context.details;
      }
      throw new Error(`Failed to send message via Edge Function: ${details}`);
    }
    
    // Check the success flag from the function's response
    if (!functionResult || !functionResult.success) {
       console.error("[WhatsApp] send-whatsapp function returned failure:", functionResult?.error);
       throw new Error(functionResult?.error || "send-whatsapp function failed without specific error.");
    }

    console.log("[WhatsApp] Successfully invoked send-whatsapp function:", functionResult);
    return true;

  } catch (error) {
    console.error("[WhatsApp] Failed to send WhatsApp message:", error);
    throw error; // Re-throw error so calling components can handle it
  }
};


import { createSubscription, getVocabWordsByCategory } from './subscriptionService';

/**
 * WhatsApp Service
 * 
 * This service handles sending vocabulary words to users via WhatsApp.
 * It now integrates with Supabase to store subscriptions.
 */

export interface SendWordsRequest {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
}

interface VocabWord {
  word: string;
  definition: string;
  example: string;
}

// Demo word lists by category
const wordsByCategory: Record<string, VocabWord[]> = {
  business: [
    { 
      word: "Leverage", 
      definition: "Use something to maximum advantage", 
      example: "We can leverage our existing customer base to launch the new product." 
    },
    { 
      word: "Synergy", 
      definition: "Interaction of multiple elements that produces an effect greater than the sum of individual effects", 
      example: "The merger created synergy between the marketing and product teams." 
    },
    { 
      word: "Scalable", 
      definition: "Able to be changed in size or scale", 
      example: "We need a more scalable solution to handle increasing user demand." 
    },
    { 
      word: "Robust", 
      definition: "Strong and effective in all or most situations", 
      example: "The company has built a robust infrastructure for its digital services." 
    },
    { 
      word: "Pivot", 
      definition: "A significant business strategy change", 
      example: "The startup decided to pivot from B2C to B2B sales model." 
    }
  ],
  academic: [
    { 
      word: "Cogent", 
      definition: "Clear, logical, and convincing", 
      example: "She made a cogent argument during the debate." 
    },
    { 
      word: "Empirical", 
      definition: "Based on observation or experience rather than theory", 
      example: "The study provides empirical evidence supporting the hypothesis." 
    },
    { 
      word: "Paradigm", 
      definition: "A typical example or pattern of something", 
      example: "This discovery represents a paradigm shift in our understanding." 
    },
    { 
      word: "Ubiquitous", 
      definition: "Present, appearing, or found everywhere", 
      example: "Smartphones have become ubiquitous in modern society." 
    },
    { 
      word: "Elucidate", 
      definition: "Make clear; explain", 
      example: "The professor elucidated the complex theory with simple examples." 
    }
  ],
  creative: [
    { 
      word: "Ephemeral", 
      definition: "Lasting for a very short time", 
      example: "The artist creates ephemeral installations that exist only for a day." 
    },
    { 
      word: "Serendipity", 
      definition: "The occurrence of events by chance in a beneficial way", 
      example: "Their meeting was pure serendipity; now they're business partners." 
    },
    { 
      word: "Mellifluous", 
      definition: "Sweet or musical; pleasant to hear", 
      example: "The singer's mellifluous voice captivated the audience." 
    },
    { 
      word: "Quintessential", 
      definition: "Representing the most perfect example of a quality", 
      example: "This cafe is the quintessential Paris experience." 
    },
    { 
      word: "Ethereal", 
      definition: "Extremely delicate and light in a way that seems not of this world", 
      example: "The painting had an ethereal quality, seeming to glow from within." 
    }
  ],
  general: [
    { 
      word: "Eloquent", 
      definition: "Fluent or persuasive in speaking or writing", 
      example: "Her eloquent speech moved the entire audience." 
    },
    { 
      word: "Resilient", 
      definition: "Able to withstand or recover quickly from difficult conditions", 
      example: "Children are remarkably resilient in the face of challenges." 
    },
    { 
      word: "Meticulous", 
      definition: "Showing great attention to detail; very careful and precise", 
      example: "He's known for his meticulous research and preparation." 
    },
    { 
      word: "Pragmatic", 
      definition: "Dealing with things sensibly and realistically", 
      example: "We need a pragmatic approach to solve this problem." 
    },
    { 
      word: "Benevolent", 
      definition: "Well meaning and kindly", 
      example: "The benevolent organization provides food and shelter to those in need." 
    }
  ]
};

// Default word list for non-Pro users
const defaultWords: VocabWord[] = [
  { 
    word: "Ameliorate", 
    definition: "Make something bad or unsatisfactory better", 
    example: "The measures taken should ameliorate the situation." 
  },
  { 
    word: "Brevity", 
    definition: "Concise and exact use of words in writing or speech", 
    example: "The speech was notable for its brevity and wit." 
  },
  { 
    word: "Cacophony", 
    definition: "A harsh, discordant mixture of sounds", 
    example: "The cacophony of the city streets made it hard to hear the conversation." 
  },
  { 
    word: "Diligent", 
    definition: "Having or showing care and conscientiousness in one's work or duties", 
    example: "The diligent student always completed assignments before the deadline." 
  },
  { 
    word: "Eloquent", 
    definition: "Fluent or persuasive in speaking or writing", 
    example: "Her eloquent speech moved the entire audience." 
  }
];

// Get sample words based on category
const getSampleWords = async (category?: string): Promise<VocabWord[]> => {
  // Try to get words from Supabase first
  const dbWords = await getVocabWordsByCategory(category);
  
  if (dbWords && dbWords.length > 0) {
    return dbWords.map(word => ({
      word: word.word,
      definition: word.definition,
      example: word.example
    }));
  }
  
  // Fall back to hardcoded words if database fetch fails
  if (!category) {
    return defaultWords;
  }
  
  return wordsByCategory[category] || defaultWords;
};

// Format words for WhatsApp message
const formatWhatsAppMessage = (words: VocabWord[], isPro: boolean): string => {
  const header = `🌟 *Today's VocabSpark Words* 🌟\n\n`;
  
  const formattedWords = words.map((word, index) => {
    return `*${index + 1}. ${word.word}*\n` +
           `Definition: ${word.definition}\n` +
           `Example: _"${word.example}"_` +
           (isPro ? '\n\n' : '\n');
  }).join('\n');
  
  const footer = isPro 
    ? '\n🚀 *Pro Subscription Active* - Thank you for supporting VocabSpark!'
    : '\n👉 Upgrade to Pro for custom word categories and more features!';
  
  return header + formattedWords + footer;
};

/**
 * Send vocabulary words via WhatsApp and store subscription in Supabase
 */
export const sendVocabWords = async (request: SendWordsRequest): Promise<boolean> => {
  try {
    console.log("[DEMO] Sending vocabulary words via WhatsApp", request);
    
    // Validate phone number (basic validation)
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("[DEMO] Invalid phone number:", request.phoneNumber);
      return false;
    }
    
    // Create subscription in Supabase
    const subscriptionCreated = await createSubscription({
      phoneNumber: request.phoneNumber,
      category: request.isPro ? request.category : undefined,
      isPro: request.isPro
    });
    
    if (!subscriptionCreated) {
      console.error("[DEMO] Failed to create subscription");
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get words based on category (or default words)
    const words = await getSampleWords(request.category);
    
    // Format message for WhatsApp
    const message = formatWhatsAppMessage(words, request.isPro);
    
    console.log("[DEMO] Would send the following message:", message);
    console.log("[DEMO] To phone number:", request.phoneNumber);
    
    // In a real implementation, this would call the WhatsApp Business API
    // Example: await whatsappBusinessApi.sendMessage(request.phoneNumber, message);
    
    console.log("[DEMO] Successfully simulated sending message");
    return true;
  } catch (error) {
    console.error("[DEMO] Failed to simulate WhatsApp message:", error);
    return false;
  }
};

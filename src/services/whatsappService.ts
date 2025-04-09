
import { toast } from "@/components/ui/use-toast";

export interface WordData {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  category?: string;
}

export interface SendWordsRequest {
  phoneNumber: string;
  category?: string;
  isPro: boolean;
}

// This would typically use a real WhatsApp Business API
// For now, we'll simulate the API call
export const sendVocabWords = async (request: SendWordsRequest): Promise<boolean> => {
  try {
    console.log("Sending vocabulary words via WhatsApp", request);
    
    // Validate phone number
    if (!request.phoneNumber || request.phoneNumber.trim().length < 10) {
      console.error("Invalid phone number:", request.phoneNumber);
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Sample words to send (in a real app, these would come from a database)
    const words = getSampleWords(request.category);
    
    // Format the message
    const message = formatWhatsAppMessage(words, request.isPro);
    
    // In a real implementation, you would use the WhatsApp Business API here
    // For example: await whatsappBusinessClient.sendMessage(request.phoneNumber, message);
    
    console.log("WhatsApp message content:", message);
    console.log("Message successfully sent to:", request.phoneNumber);
    
    // Simulate successful API call
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
};

const getSampleWords = (category?: string): WordData[] => {
  // In a real app, this would fetch from a database based on category
  const allWords: Record<string, WordData[]> = {
    business: [
      {
        word: "Arbitrage",
        pronunciation: "/ˈɑːbɪtrɑːʒ/",
        meaning: "The simultaneous buying and selling of assets to profit from price differences",
        example: "He made millions through currency arbitrage."
      },
      {
        word: "Synergy",
        pronunciation: "/ˈsɪnərdʒi/",
        meaning: "Interaction of elements that produces a combined effect greater than the sum of their separate effects",
        example: "The merger created synergy between the two companies."
      }
    ],
    academic: [
      {
        word: "Ephemeral",
        pronunciation: "/ɪˈfem(ə)rəl/",
        meaning: "Lasting for a very short time",
        example: "The ephemeral nature of fashion trends makes them difficult to follow."
      },
      {
        word: "Paradigm",
        pronunciation: "/ˈparədaɪm/",
        meaning: "A typical example or pattern of something",
        example: "The scientific paradigm shifted after Einstein's discoveries."
      }
    ],
    creative: [
      {
        word: "Juxtaposition",
        pronunciation: "/ˌdʒʌkstəpəˈzɪʃ(ə)n/",
        meaning: "The fact of two things being seen or placed close together with contrasting effect",
        example: "The juxtaposition of bright colors creates visual interest in her paintings."
      },
      {
        word: "Serendipity",
        pronunciation: "/ˌserənˈdɪpɪti/",
        meaning: "The occurrence of fortunate discoveries by accident",
        example: "Finding that rare book was pure serendipity."
      }
    ],
    general: [
      {
        word: "Ubiquitous",
        pronunciation: "/juːˈbɪkwɪtəs/",
        meaning: "Present, appearing, or found everywhere",
        example: "Mobile phones have become ubiquitous in modern society."
      },
      {
        word: "Eloquent",
        pronunciation: "/ˈɛləkwənt/",
        meaning: "Fluent or persuasive in speaking or writing",
        example: "She gave an eloquent speech that moved the audience."
      }
    ]
  };
  
  // If category is provided and exists, return those words
  if (category && allWords[category]) {
    return allWords[category];
  }
  
  // Otherwise return general words
  return allWords.general;
};

const formatWhatsAppMessage = (words: WordData[], isPro: boolean): string => {
  let message = "🌟 *Your VocabSpark Words for Today* 🌟\n\n";
  
  words.forEach((word, index) => {
    message += `*${index + 1}. ${word.word}* (${word.pronunciation})\n`;
    message += `📝 *Meaning:* ${word.meaning}\n`;
    message += `💬 *Example:* ${word.example}\n\n`;
  });
  
  if (isPro) {
    message += "✨ *PRO TIP:* Try using one of these words in conversation today!\n\n";
  } else {
    message += "⭐ *Upgrade to PRO for personalized words and extra features!*\n\n";
  }
  
  message += "Sent with 💙 from VocabSpark";
  
  return message;
};

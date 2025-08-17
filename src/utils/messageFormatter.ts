/**
 * Message Formatter Utility
 * 
 * This utility handles formatting vocabulary words into the desired message format.
 */

interface VocabularyWord {
  word: string;
  pronunciation?: string;
  definition: string;
  part_of_speech?: string;
  example: string;
  memory_hook?: string;
  category: string;
}

/**
 * Formats a vocabulary word into the enhanced message format
 * @param word The vocabulary word object
 * @returns Formatted message string
 */
export const formatVocabularyMessage = (word: VocabularyWord): string => {
  const {
    word: wordText,
    pronunciation = '',
    definition,
    part_of_speech = 'Unknown',
    example,
    memory_hook = '',
    category
  } = word;

  // Capitalize first letter of part of speech
  const formattedPartOfSpeech = part_of_speech.charAt(0).toUpperCase() + part_of_speech.slice(1);

  return `Word: ${wordText} 🟩 (${formattedPartOfSpeech})
Pronunciation: ${pronunciation}
Meaning: ${definition}
Example: ${example}
Memory Hook: ${memory_hook}`;
};

/**
 * Formats multiple vocabulary words into separate messages
 * @param words Array of vocabulary word objects
 * @returns Array of formatted message strings
 */
export const formatVocabularyMessages = (words: VocabularyWord[]): string[] => {
  return words.map(word => formatVocabularyMessage(word));
};

/**
 * Creates a preview of the formatted message for testing
 * @param word The vocabulary word object
 * @returns Formatted message with example data
 */
export const createMessagePreview = (): string => {
  const exampleWord: VocabularyWord = {
    word: "Eloquent",
    pronunciation: "EL-oh-kwent",
    definition: "Able to express yourself clearly and persuasively.",
    part_of_speech: "Adjective",
    example: "Her speech was so eloquent that the whole audience applauded.",
    memory_hook: "Think \"elo\" = elegant + fluent → \"elegantly fluent.\"",
    category: "daily-professional"
  };

  return formatVocabularyMessage(exampleWord);
};
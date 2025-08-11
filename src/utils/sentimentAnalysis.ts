/**
 * Simple sentiment analysis utility for vocabulary words
 * Returns 'positive', 'negative', or 'neutral' based on word characteristics
 */

const POSITIVE_WORDS = new Set([
  // Achievement & Success
  'achieve', 'success', 'triumph', 'victory', 'excel', 'outstanding', 'excellent', 'brilliant',
  'magnificent', 'wonderful', 'amazing', 'fantastic', 'superb', 'marvelous', 'spectacular',
  
  // Emotions & Feelings
  'joy', 'happiness', 'delight', 'elation', 'euphoria', 'bliss', 'contentment', 'cheerful',
  'optimistic', 'enthusiastic', 'passionate', 'inspired', 'motivated', 'confident', 'proud',
  
  // Relationships & Social
  'love', 'friendship', 'harmony', 'unity', 'cooperation', 'collaboration', 'support', 'caring',
  'compassionate', 'generous', 'kind', 'gentle', 'thoughtful', 'considerate', 'empathetic',
  
  // Growth & Development
  'growth', 'progress', 'improvement', 'development', 'advancement', 'innovation', 'creativity',
  'enlightenment', 'wisdom', 'knowledge', 'learning', 'discovery', 'breakthrough', 'insight',
  
  // Beauty & Aesthetics
  'beautiful', 'gorgeous', 'stunning', 'elegant', 'graceful', 'charming', 'attractive', 'lovely',
  'aesthetic', 'artistic', 'creative', 'inspiring', 'uplifting', 'refreshing', 'invigorating'
]);

const NEGATIVE_WORDS = new Set([
  // Emotions & Mental States
  'anger', 'rage', 'fury', 'hatred', 'resentment', 'bitterness', 'jealousy', 'envy', 'spite',
  'malice', 'hostility', 'animosity', 'contempt', 'disdain', 'disgust', 'revulsion', 'loathing',
  'despair', 'depression', 'melancholy', 'sorrow', 'grief', 'anguish', 'agony', 'misery',
  'suffering', 'pain', 'torment', 'anguish', 'distress', 'anxiety', 'fear', 'terror', 'dread',
  
  // Conflict & Destruction
  'war', 'violence', 'destruction', 'devastation', 'chaos', 'mayhem', 'catastrophe', 'disaster',
  'tragedy', 'calamity', 'crisis', 'conflict', 'battle', 'fight', 'attack', 'assault', 'abuse',
  'oppression', 'tyranny', 'persecution', 'discrimination', 'prejudice', 'injustice', 'cruelty',
  
  // Failure & Loss
  'failure', 'defeat', 'loss', 'bankruptcy', 'ruin', 'collapse', 'downfall', 'decline', 'decay',
  'deterioration', 'corruption', 'scandal', 'shame', 'humiliation', 'embarrassment', 'disgrace',
  
  // Moral & Ethical Negatives
  'evil', 'wicked', 'sinister', 'malevolent', 'malicious', 'vicious', 'cruel', 'brutal', 'savage',
  'ruthless', 'merciless', 'callous', 'heartless', 'selfish', 'greedy', 'corrupt', 'dishonest',
  'deceitful', 'treacherous', 'betrayal', 'toxic', 'poisonous', 'harmful', 'dangerous', 'threatening'
]);

// Common positive word patterns
const POSITIVE_PATTERNS = [
  /^pro/, // productive, progressive, etc.
  /^bene/, // beneficial, benevolent, etc.
  /ing$/, // Many -ing words are positive actions
];

// Common negative word patterns
const NEGATIVE_PATTERNS = [
  /^dis/, // discord, disease, etc.
  /^mis/, // mistake, misfortune, etc.
  /^un/, // unhappy, unfortunate, etc.
  /phobia$/, // claustrophobia, etc.
];

export type WordSentiment = 'positive' | 'negative' | 'neutral';

export function analyzeSentiment(word: string): WordSentiment {
  const lowerWord = word.toLowerCase();
  
  // Direct lookup in word sets
  if (POSITIVE_WORDS.has(lowerWord)) {
    return 'positive';
  }
  
  if (NEGATIVE_WORDS.has(lowerWord)) {
    return 'negative';
  }
  
  // Pattern matching
  for (const pattern of POSITIVE_PATTERNS) {
    if (pattern.test(lowerWord)) {
      return 'positive';
    }
  }
  
  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(lowerWord)) {
      return 'negative';
    }
  }
  
  // Default to neutral
  return 'neutral';
}

export function getSentimentSquare(sentiment: WordSentiment): string {
  switch (sentiment) {
    case 'positive':
      return '🟩'; // Green square
    case 'negative':
      return '🟥'; // Red square
    case 'neutral':
    default:
      return '🟧'; // Orange square
  }
}

export function getSentimentColor(sentiment: WordSentiment): string {
  switch (sentiment) {
    case 'positive':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'negative':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'neutral':
    default:
      return 'text-orange-600 bg-orange-50 border-orange-200';
  }
}
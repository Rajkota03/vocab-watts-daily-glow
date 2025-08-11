import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Volume2, BookOpen, Lightbulb, Users } from 'lucide-react';
import { EnrichedVocabularyWord } from '@/services/vocabularyEnrichmentService';
import { analyzeSentiment, getSentimentSquare, getSentimentColor } from '@/utils/sentimentAnalysis';

interface EnrichedVocabularyCardProps {
  word: EnrichedVocabularyWord;
  showCategory?: boolean;
}

const EnrichedVocabularyCard: React.FC<EnrichedVocabularyCardProps> = ({ 
  word, 
  showCategory = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Analyze sentiment if not provided
  const sentiment = word.sentiment || analyzeSentiment(word.word);
  const sentimentSquare = getSentimentSquare(sentiment);
  const sentimentCardColor = getSentimentColor(sentiment);

  const handlePronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${sentimentCardColor}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            {word.word}
            <span className="text-lg" title={`Sentiment: ${sentiment}`}>
              {sentimentSquare}
            </span>
          </CardTitle>
          {showCategory && (
            <Badge variant="outline" className="ml-2">
              {word.category}
            </Badge>
          )}
        </div>
        
        {word.pronunciation && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground font-mono">
              {word.pronunciation}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePronunciation}
              className="h-6 w-6 p-0"
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Definition */}
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Definition:</p>
            <p className="text-sm text-gray-600">{word.definition}</p>
          </div>
        </div>

        {/* Example */}
        <div className="text-sm">
          <p className="font-medium text-gray-700 mb-1">Example:</p>
          <p className="italic text-gray-600">"{word.example}"</p>
        </div>

        {/* Expandable enriched content */}
        {(word.mnemonic || word.synonyms) && (
          <div className="border-t pt-3 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-primary hover:text-primary/80"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Learning Aids
              </span>
              <span className="text-xs">
                {isExpanded ? 'Hide' : 'Show'}
              </span>
            </Button>
            
            {isExpanded && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                {/* Mnemonic */}
                {word.mnemonic && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Memory Device:</p>
                        <p className="text-sm text-yellow-700">{word.mnemonic}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Synonyms */}
                {word.synonyms && word.synonyms.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Synonyms:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {word.synonyms.map((synonym, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrichedVocabularyCard;
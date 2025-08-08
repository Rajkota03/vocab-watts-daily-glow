import React from 'react';
import { BookOpen, Lightbulb, Sparkles } from 'lucide-react';
import sampleWordCard from '@/assets/sample-word-card.svg';

const SampleWordDrop = () => {
  const sampleWords = [
    {
      word: "Ubiquitous",
      emoji: "📱",
      pronunciation: "/yoo-BIK-wi-tuhs/",
      definition: "Present, appearing, or found everywhere",
      example: "Smartphones have become ubiquitous in our daily lives, used for everything from communication to navigation.",
      mnemonic: "Think 'You-Be-Quick-With-Us' - something that's everywhere, you'll quickly encounter it with us!",
      synonyms: ["omnipresent", "pervasive", "widespread"]
    },
    {
      word: "Serendipity",
      emoji: "✨",
      pronunciation: "/ser-uhn-DIP-i-tee/",
      definition: "The occurrence of events by chance in a happy or beneficial way",
      example: "Finding my dream job through a random conversation at a coffee shop was pure serendipity.",
      mnemonic: "Serene + dip + tea = A peaceful dip while having tea led to an unexpected pleasant discovery!",
      synonyms: ["fortune", "luck", "chance discovery"]
    }
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-6 text-white shadow-soft">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Sample Word Drop
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            This is the exact format you'll receive on WhatsApp
          </p>
        </div>
        
        {/* Illustration showcase */}
        <div className="mb-12 flex justify-center">
          <div className="illustration-container max-w-2xl">
            <img 
              src={sampleWordCard} 
              alt="Sample vocabulary word card" 
              className="w-full h-auto hover-bounce"
            />
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto card-flat p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sampleWords.map((word, index) => (
              <div key={index} className="card-illustration p-6 hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl animate-bounce-gentle">{word.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {word.word}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">{word.pronunciation}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-xl border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wide">Definition</h4>
                    </div>
                    <p className="text-foreground">{word.definition}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-secondary/5 to-primary/5 p-4 rounded-xl border-l-4 border-secondary">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <h4 className="text-sm font-semibold text-secondary uppercase tracking-wide">Example</h4>
                    </div>
                    <p className="text-foreground italic">"{word.example}"</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-accent/5 to-secondary/5 p-4 rounded-xl border-l-4 border-accent">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-accent" />
                      <h4 className="text-sm font-semibold text-accent uppercase tracking-wide">Memory Trick</h4>
                    </div>
                    <p className="text-foreground">{word.mnemonic}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Synonyms</h4>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((synonym, idx) => (
                        <span key={idx} className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20 hover-bounce">
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleWordDrop;
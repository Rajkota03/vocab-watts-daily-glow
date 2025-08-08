import React from 'react';
import { BookOpen } from 'lucide-react';

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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sample Word Drop</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            This is the exact format you'll receive on WhatsApp
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sampleWords.map((word, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{word.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{word.word}</h3>
                    <p className="text-sm text-gray-500 italic">{word.pronunciation}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">Definition</h4>
                    <p className="text-gray-700">{word.definition}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">Example</h4>
                    <p className="text-gray-700 italic">"{word.example}"</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">Memory Trick</h4>
                    <p className="text-gray-700">{word.mnemonic}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">Synonyms</h4>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((synonym, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
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
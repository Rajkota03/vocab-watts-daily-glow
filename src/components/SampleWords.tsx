
import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SampleWords = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const words = [
    {
      word: 'Persnickety',
      meaning: 'Fussy or hard to please',
      example: 'The persnickety client sent back the design five times for minor adjustments.',
      wittyExample: "My cat is so persnickety, she won't eat unless I warm the food to exactly 37°C."
    },
    {
      word: 'Ubiquitous',
      meaning: 'Present, appearing, or found everywhere',
      example: 'Smartphones have become ubiquitous in modern society.',
      wittyExample: "Dad jokes are as ubiquitous at family gatherings as that one relative who asks why you're still single."
    },
    {
      word: 'Serendipity',
      meaning: 'The occurrence of events by chance in a happy or beneficial way',
      example: 'Finding my lost wallet was pure serendipity.',
      wittyExample: "It was serendipity that I discovered my favorite coffee shop—I was running from a rain shower and ducked into the first open door!"
    },
    {
      word: 'Ephemeral',
      meaning: 'Lasting for a very short time',
      example: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks.',
      wittyExample: "My motivation to exercise is ephemeral—it vanishes the moment I see the gym membership fee."
    },
    {
      word: 'Gregarious',
      meaning: 'Fond of company; sociable',
      example: 'Sarah is naturally gregarious and makes friends wherever she goes.',
      wittyExample: "I'm so gregarious that I talk to my houseplants. They're excellent listeners, though terrible conversationalists."
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === words.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? words.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="samples" className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block mb-3 p-3 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gray-800">Sample Word Drop</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover words that transform your language, delivered with wit and wisdom.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto relative">
          {/* Carousel navigation */}
          <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white shadow-md hover:bg-primary/10 text-primary"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous word</span>
            </Button>
          </div>
          
          <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-white shadow-md hover:bg-primary/10 text-primary"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next word</span>
            </Button>
          </div>
          
          {/* Carousel */}
          <div className="overflow-hidden rounded-2xl shadow-2xl border-2 border-white">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {words.map((wordItem, index) => (
                <div 
                  key={index} 
                  className="min-w-full bg-gradient-to-br from-white to-gray-50 p-8 md:p-10"
                >
                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{wordItem.word}</span>
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-6">{wordItem.meaning}</p>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                      <span className="text-sm font-bold uppercase text-primary tracking-wider">Example:</span>
                      <p className="text-gray-700 mt-1">{wordItem.example}</p>
                    </div>
                    <div className="bg-accent/5 p-4 rounded-lg border-l-4 border-accent">
                      <span className="text-sm font-bold uppercase text-accent tracking-wider">Witty Use:</span>
                      <p className="text-gray-700 mt-1 italic">{wordItem.wittyExample}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {words.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  activeIndex === index ? "bg-primary" : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                <span className="sr-only">Word {index + 1}</span>
              </button>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-10">
            {/* TODO: Update onClick to open AuthModal with initialPlan=\'trial\' */}
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => { /* Open AuthModal with initialPlan=\'trial\' */ }}
            >
              Get Your First Words Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleWords;

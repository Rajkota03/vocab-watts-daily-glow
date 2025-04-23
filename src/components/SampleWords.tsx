
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
    <section id="samples" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-block mb-3 p-3 bg-primary/10 rounded-full">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-3 text-dark">Sample Word Drop</h2>
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
              className="rounded-full bg-white shadow-md hover:bg-primary/10"
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
              className="rounded-full bg-white shadow-md hover:bg-primary/10"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next word</span>
            </Button>
          </div>
          
          {/* Carousel */}
          <div className="overflow-hidden rounded-xl shadow-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {words.map((wordItem, index) => (
                <div 
                  key={index} 
                  className="min-w-full bg-white p-6 md:p-8"
                >
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-primary">{wordItem.word}</span>
                  </div>
                  <p className="text-lg font-medium text-dark mb-4">{wordItem.meaning}</p>
                  <div className="space-y-4">
                    <div className="text-gray-600">
                      <span className="text-sm font-medium uppercase text-gray-400 tracking-wider">Example:</span><br />
                      {wordItem.example}
                    </div>
                    <div className="text-gray-600 italic border-l-3 border-primary pl-4">
                      <span className="text-sm font-medium uppercase text-gray-400 tracking-wider">Witty Use:</span><br />
                      {wordItem.wittyExample}
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
                className={`w-2.5 h-2.5 rounded-full ${
                  activeIndex === index ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span className="sr-only">Word {index + 1}</span>
              </button>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-10">
            <Button 
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
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

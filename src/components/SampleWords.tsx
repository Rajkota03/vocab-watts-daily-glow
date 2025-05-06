import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion'; // Import motion

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

  // Animation variants for fade-in effect
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      id="samples" 
      className="py-16 md:py-24 bg-background"
      initial="hidden" // Start hidden
      whileInView="visible" // Animate when in view
      viewport={{ once: true, amount: 0.2 }} // Trigger once, when 20% is visible
      variants={fadeIn} // Apply fade-in variants
    >
      <div className="container mx-auto px-4">
        {/* Section Title and Description */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4 p-3 bg-primary/10 rounded-full">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4 text-foreground">Sample Word Drop</h2>
          <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
            Discover words that transform your language, delivered with wit and wisdom.
          </p>
        </div>
        
        {/* Carousel */}
        <div className="max-w-2xl mx-auto relative">
          {/* Carousel navigation (Mobile friendly positioning) */}
          <div className="absolute top-1/2 -left-3 md:-left-10 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-card shadow-md hover:bg-muted/50 border-border/50 text-foreground"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous word</span>
            </Button>
          </div>
          
          <div className="absolute top-1/2 -right-3 md:-right-10 transform -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-card shadow-md hover:bg-muted/50 border-border/50 text-foreground"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next word</span>
            </Button>
          </div>
          
          {/* Carousel Content */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {words.map((wordItem, index) => (
                <div 
                  key={index} 
                  className="min-w-full flex-shrink-0 px-1" // Added padding for spacing between potential cards
                >
                  <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      <div className="mb-4">
                        <span className="text-2xl md:text-3xl font-semibold font-poppins text-primary">{wordItem.word}</span>
                      </div>
                      <p className="text-base md:text-lg font-medium text-foreground mb-5">{wordItem.meaning}</p>
                      <div className="space-y-4">
                        <div className="text-secondary-foreground text-sm md:text-base">
                          <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider block mb-1">Example:</span>
                          {wordItem.example}
                        </div>
                        <div className="text-secondary-foreground text-sm md:text-base italic border-l-3 border-accent pl-3">
                          <span className="text-xs font-medium uppercase text-muted-foreground tracking-wider block mb-1 not-italic">Witty Use:</span>
                          {wordItem.wittyExample}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === index ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              >
                <span className="sr-only">Word {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SampleWords;


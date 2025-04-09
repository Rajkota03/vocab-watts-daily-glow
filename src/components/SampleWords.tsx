
import React from 'react';
import { BookOpen } from 'lucide-react';

const SampleWords = () => {
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

  return (
    <section id="samples" className="py-20 bg-gradient-to-r from-vocab-teal/5 to-vocab-purple/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 p-3 bg-vocab-teal/10 rounded-full">
            <BookOpen className="w-8 h-8 text-vocab-teal" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Sample Word Drop</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover words that transform your language, delivered with wit and wisdom.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            {/* WhatsApp-style header */}
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M19.3547 4.55156C17.3906 2.58281 14.7547 1.5 11.9953 1.5C6.25781 1.5 1.58906 6.16875 1.58906 11.9062C1.58906 13.8094 2.10469 15.6656 3.07031 17.2875L1.5 22.5L6.84375 20.9578C8.40937 21.8391 10.1812 22.3078 11.9906 22.3078H11.9953C17.7281 22.3078 22.5 17.6391 22.5 11.9016C22.5 9.14219 21.3188 6.52031 19.3547 4.55156Z"/>
              </svg>
            </div>
            
            {/* Chat Header */}
            <div className="flex items-center border-b border-gray-100 pb-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-vocab-teal/20 flex items-center justify-center">
                <span className="text-vocab-teal font-bold text-lg">VS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-lg">VocabSpark</h4>
                <p className="text-sm text-gray-500">Your Daily Vocabulary Boost</p>
              </div>
            </div>
            
            {/* Words Container */}
            <div className="space-y-6">
              {words.map((wordItem, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-5 rounded-xl transform transition-all hover:translate-y-[-2px] hover:shadow-md"
                >
                  <div className="mb-3">
                    <span className="text-xl font-bold text-vocab-teal">{wordItem.word}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-3">{wordItem.meaning}</p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="text-xs font-medium uppercase text-gray-400 tracking-wider">Example:</span><br />
                      {wordItem.example}
                    </div>
                    <div className="text-sm text-gray-600 italic border-l-2 border-vocab-purple/40 pl-3">
                      <span className="text-xs font-medium uppercase text-gray-400 tracking-wider">Witty Use:</span><br />
                      {wordItem.wittyExample}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-6 text-gray-500">
                <p>+ 2 more words daily</p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-10">
            <a 
              href="#signup" 
              className="inline-flex items-center px-8 py-4 bg-vocab-teal text-white font-medium rounded-full transition-all hover:bg-vocab-teal/90 hover:shadow-lg"
            >
              Get Your First Words Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleWords;

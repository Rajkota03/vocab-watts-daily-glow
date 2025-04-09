
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
    },
    {
      word: 'Pragmatic',
      meaning: 'Dealing with things sensibly and realistically',
      example: 'We need a pragmatic approach to solve this problem.',
      wittyExample: "My pragmatic roommate's solution to our ant problem was simple: clean up my cookie crumbs instead of naming each ant."
    },
    {
      word: 'Ephemeral',
      meaning: 'Lasting for a very short time',
      example: 'The beauty of cherry blossoms is ephemeral.',
      wittyExample: "My motivation to exercise is as ephemeral as my New Year's resolutions—usually gone by January 3rd."
    }
  ];

  // Display only first 3 words for the sample section
  const displayWords = words.slice(0, 3);

  return (
    <section id="samples" className="py-20 bg-gradient-to-r from-vocab-teal/5 to-vocab-purple/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 p-2 bg-vocab-teal/10 rounded-full">
            <BookOpen className="w-6 h-6 text-vocab-teal" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sample Word Drop</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's a taste of what you'll receive daily. Words that impress, with examples that stick.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 relative">
            {/* WhatsApp Header */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M19.3547 4.55156C17.3906 2.58281 14.7547 1.5 11.9953 1.5C6.25781 1.5 1.58906 6.16875 1.58906 11.9062C1.58906 13.8094 2.10469 15.6656 3.07031 17.2875L1.5 22.5L6.84375 20.9578C8.40937 21.8391 10.1812 22.3078 11.9906 22.3078H11.9953C17.7281 22.3078 22.5 17.6391 22.5 11.9016C22.5 9.14219 21.3188 6.52031 19.3547 4.55156ZM11.9953 20.5406C10.3781 20.5406 8.79375 20.0906 7.40625 19.2516L7.07812 19.0547L3.95625 19.9547L4.86562 16.8844L4.64531 16.5422C3.72187 15.1078 3.23438 13.4344 3.23438 11.9062C3.23438 7.08281 7.17187 3.14531 12 3.14531C14.3109 3.14531 16.4906 4.0547 18.1125 5.68125C19.7344 7.30781 20.8594 9.48281 20.8547 11.9016C20.8547 16.7297 16.8187 20.5406 11.9953 20.5406ZM16.7906 14.0672C16.5094 13.9266 15.1594 13.2609 14.8969 13.1672C14.6344 13.0734 14.4422 13.0266 14.25 13.3078C14.0578 13.5891 13.5328 14.2078 13.3641 14.4C13.1953 14.5922 13.0266 14.6156 12.7453 14.475C12.4641 14.3344 11.5734 14.0344 10.5188 13.0875C9.69375 12.3469 9.14531 11.4422 8.97656 11.1609C8.80781 10.8797 8.95781 10.7203 9.10312 10.5703C9.23437 10.4344 9.39375 10.2141 9.53906 10.0453C9.68437 9.87656 9.73125 9.75938 9.825 9.56719C9.91875 9.375 9.87187 9.20625 9.80156 9.06563C9.73125 8.925 9.18281 7.57031 8.94375 7.00781C8.7 6.44531 8.45625 6.5203 8.27344 6.5203C8.10469 6.5203 7.9125 6.49688 7.72031 6.49688C7.52812 6.49688 7.21875 6.56719 6.95625 6.84844C6.69375 7.12969 5.98125 7.79531 5.98125 9.15C5.98125 10.5047 6.975 11.8125 7.12031 12.0047C7.26562 12.1969 9.14062 15.0891 12.0141 16.2797C12.8297 16.6266 13.4625 16.8328 13.9547 16.9875C14.775 17.2406 15.5203 17.2031 16.1062 17.1328C16.7625 17.0531 17.8641 16.4672 18.1031 15.8109C18.3422 15.1547 18.3422 14.5922 18.2719 14.4703C18.2016 14.3484 18.0094 14.2781 17.7281 14.1375L16.7906 14.0672Z"/>
              </svg>
            </div>
            
            {/* Chat Header */}
            <div className="flex items-center border-b border-gray-100 pb-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-vocab-teal/20 flex items-center justify-center">
                <span className="text-vocab-teal font-bold text-lg">VS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-lg">VocabSpark</h4>
                <p className="text-sm text-gray-500">Daily vocabulary boost</p>
              </div>
            </div>
            
            {/* Today's Date */}
            <div className="flex justify-center mb-6">
              <div className="px-4 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                Today
              </div>
            </div>
            
            {/* Word Cards */}
            <div className="space-y-6">
              {displayWords.map((wordItem, index) => (
                <div 
                  key={index} 
                  className="whatsapp-message max-w-md transform transition-all hover:translate-y-[-2px]"
                >
                  <div className="mb-2">
                    <span className="text-lg font-bold text-vocab-teal">{wordItem.word}</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{wordItem.meaning}</p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="text-xs font-medium uppercase text-gray-400 tracking-wider">Example:</span><br />
                      {wordItem.example}
                    </div>
                    <div className="text-sm text-gray-700 italic border-l-2 border-vocab-purple/40 pl-3">
                      <span className="text-xs font-medium uppercase text-gray-400 tracking-wider">Witty Use:</span><br />
                      {wordItem.wittyExample}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-8 text-gray-500">
                <p>+ 2 more words daily</p>
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-10">
            <a 
              href="#signup" 
              className="inline-flex items-center px-6 py-3 bg-vocab-teal text-white font-medium rounded-full transition-all hover:bg-vocab-teal/90 hover:shadow-lg"
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

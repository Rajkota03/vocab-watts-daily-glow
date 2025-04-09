
import React from 'react';

const WhatsAppPreview = ({ isPro = false }: { isPro?: boolean }) => {
  return (
    <div className="relative max-w-xs mx-auto">
      {/* Phone frame */}
      <div className="border-8 border-gray-800 rounded-3xl overflow-hidden shadow-xl bg-gray-800">
        {/* Status bar */}
        <div className="bg-gray-800 text-white flex justify-between items-center px-4 py-2 text-xs">
          <div>9:41</div>
          <div className="flex space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
        </div>
        
        {/* WhatsApp header */}
        <div className="bg-[#128C7E] px-4 py-2 flex items-center">
          <svg viewBox="0 0 32 32" className="h-6 w-6 text-white mr-2 rotate-90">
            <path 
              fill="currentColor" 
              d="M20.8 18.4L16 13.6l-4.8 4.8-1.6-1.6 6.4-6.4 6.4 6.4z" 
            />
          </svg>
          <div className="flex-1">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                <span className="text-sm font-bold">VS</span>
              </div>
              <span className="text-white font-medium">VocabSpark</span>
            </div>
          </div>
          <div className="flex space-x-3 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </div>
        
        {/* Chat background */}
        <div className="bg-[#E5DDD5] h-96 overflow-y-auto p-3 space-y-2">
          {/* Date bubble */}
          <div className="flex justify-center">
            <div className="bg-white text-gray-500 text-xs px-2 py-1 rounded-lg">
              TODAY
            </div>
          </div>
          
          {/* Message bubble */}
          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] text-gray-800 rounded-lg px-3 py-2 max-w-[80%] shadow-sm">
              <p className="text-xs font-medium">I'd like to improve my vocabulary</p>
            </div>
          </div>
          
          {/* VocabSpark response */}
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
              <p className="text-xs font-bold">🌟 Your VocabSpark Words for Today 🌟</p>
              
              <div className="my-2">
                <p className="text-xs font-bold">1. {isPro ? "Arbitrage" : "Ubiquitous"} ({isPro ? "/ˈɑːbɪtrɑːʒ/" : "/juːˈbɪkwɪtəs/"})</p>
                <p className="text-xs">📝 Meaning: {isPro 
                  ? "The simultaneous buying and selling of assets to profit from price differences" 
                  : "Present, appearing, or found everywhere"}</p>
                <p className="text-xs">💬 Example: {isPro 
                  ? "He made millions through currency arbitrage." 
                  : "Mobile phones have become ubiquitous in modern society."}</p>
              </div>
              
              <div className="my-2">
                <p className="text-xs font-bold">2. {isPro ? "Synergy" : "Eloquent"} ({isPro ? "/ˈsɪnərdʒi/" : "/ˈɛləkwənt/"})</p>
                <p className="text-xs">📝 Meaning: {isPro 
                  ? "Interaction of elements that produces a combined effect greater than the sum of their separate effects" 
                  : "Fluent or persuasive in speaking or writing"}</p>
                <p className="text-xs">💬 Example: {isPro 
                  ? "The merger created synergy between the two companies." 
                  : "She gave an eloquent speech that moved the audience."}</p>
              </div>
              
              <p className="text-xs mt-2">{isPro 
                ? "✨ PRO TIP: Try using one of these words in conversation today!" 
                : "⭐ Upgrade to PRO for personalized words and extra features!"}</p>
              
              <p className="text-xs mt-2">Sent with 💙 from VocabSpark</p>
            </div>
          </div>
          
          {isPro && (
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] text-gray-800 rounded-lg px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-xs font-medium">These are perfect for my business meetings. Thanks!</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Phone home button */}
      <div className="w-16 h-1 bg-gray-800 mx-auto mt-2 rounded-full"></div>
      
      {/* Label */}
      <div className="absolute -top-4 -right-4 bg-vocab-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
        {isPro ? "PRO" : "FREE"}
      </div>
    </div>
  );
};

export default WhatsAppPreview;

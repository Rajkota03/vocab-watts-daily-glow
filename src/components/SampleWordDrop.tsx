import React from 'react';
import { BookOpen } from 'lucide-react';
const SampleWordDrop = () => {
  const sampleWords = [{
    word: "Ubiquitous",
    emoji: "📱",
    pronunciation: "/yoo-BIK-wi-tuhs/",
    definition: "Present, appearing, or found everywhere",
    example: "Smartphones have become ubiquitous in our daily lives, used for everything from communication to navigation.",
    mnemonic: "Think 'You-Be-Quick-With-Us' - something that's everywhere, you'll quickly encounter it with us!",
    synonyms: ["omnipresent", "pervasive", "widespread"]
  }, {
    word: "Serendipity",
    emoji: "✨",
    pronunciation: "/ser-uhn-DIP-i-tee/",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    example: "Finding my dream job through a random conversation at a coffee shop was pure serendipity.",
    mnemonic: "Serene + dip + tea = A peaceful dip while having tea led to an unexpected pleasant discovery!",
    synonyms: ["fortune", "luck", "chance discovery"]
  }];
  return <section className="bg-gray-50 py-[18px]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it arrives on WhatsApp</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Clear. Useful. Easy to remember.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 py-[10px]">
            <div className="flex items-center mb-4 bg-[#128C7E] text-white p-2 rounded-t-lg">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">G</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">Glintup</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#DCF8C6]/50 p-3 rounded-lg rounded-tl-none">
                <p className="text-sm mb-2">Hi Raj,<br />Here is your requested content:</p>
                <p className="font-bold mb-1">Word: contribute 🟩 (verb)</p>
                <p className="text-sm mb-1"><strong>Pronunciation:</strong> kuhn-TRIB-yoot</p>
                <p className="text-sm mb-1"><strong>Meaning:</strong> to give or add something, such as time, money, or effort, to a common supply or cause.</p>
                <p className="text-sm mb-1"><strong>Example:</strong> Everyone is encouraged to contribute their ideas during the team meeting.</p>
                <p className="text-sm mb-2"><strong>Memory Hook:</strong> Think of 'contribute' as con-TRIB-ute where you 'tribe' together to help each other.</p>
                <p className="text-sm font-medium">— Glintup</p>
              </div>
              
              <div className="text-right text-xs text-gray-500">
                8:00 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default SampleWordDrop;
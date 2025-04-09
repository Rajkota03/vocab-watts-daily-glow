
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-vocab-teal" />
          <span className="font-bold text-xl text-gray-800">VocabSpark</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block">
            How It Works
          </a>
          <a href="#samples" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block">
            Sample Words
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block">
            Pricing
          </a>
          <Button className="vocab-btn">Try it Free</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

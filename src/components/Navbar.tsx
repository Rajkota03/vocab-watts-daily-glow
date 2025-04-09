
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-vocab-teal" />
          <span className="font-bold text-xl text-gray-800 font-poppins">VocabSpark</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block font-inter">
            How It Works
          </a>
          <a href="#samples" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block font-inter">
            Sample Words
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-vocab-teal transition-colors hidden md:block font-inter">
            Pricing
          </a>
          <div className="flex gap-2">
            <Button className="vocab-btn-secondary hidden sm:flex">Start Free</Button>
            <Button className="vocab-btn">Go Pro</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

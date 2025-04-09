
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white/80 backdrop-blur-sm py-5'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-vocab-teal" />
          <span className="font-heading font-bold text-2xl text-gray-800">VocabSpark</span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden z-50 text-gray-700 hover:text-vocab-teal focus:outline-none" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium">
            How It Works
          </a>
          <a href="#samples" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium">
            Sample Words
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium">
            Pricing
          </a>
          <Button className="vocab-btn font-medium">Try it Free</Button>
        </div>
        
        {/* Mobile navigation */}
        <div className={`fixed inset-0 bg-white flex flex-col justify-center items-center space-y-8 md:hidden transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <a 
            href="#how-it-works" 
            className="text-2xl font-heading font-medium text-gray-800 hover:text-vocab-teal"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </a>
          <a 
            href="#samples" 
            className="text-2xl font-heading font-medium text-gray-800 hover:text-vocab-teal"
            onClick={() => setMenuOpen(false)}
          >
            Sample Words
          </a>
          <a 
            href="#pricing" 
            className="text-2xl font-heading font-medium text-gray-800 hover:text-vocab-teal"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </a>
          <Button 
            className="vocab-btn text-lg mt-6 px-10 py-6 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Try it Free
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const scrollToSignup = () => {
    const signupSection = document.querySelector('section:nth-of-type(5)');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white bg-opacity-95 backdrop-blur-lg z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-vocab-teal" />
          <span className="font-bold text-xl text-gray-800 font-poppins tracking-tight">VocabSpark</span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-vocab-teal focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium font-inter text-sm">
            How It Works
          </a>
          <a href="#samples" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium font-inter text-sm">
            Sample Words
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-vocab-teal transition-colors font-medium font-inter text-sm">
            Pricing
          </a>
          <div className="flex gap-3">
            <Button className="vocab-btn-secondary" onClick={scrollToSignup}>
              Start Free Trial
            </Button>
            <Button className="vocab-btn" onClick={() => {
              scrollToSignup();
              // Set Pro mode in signup form by triggering a click on the "Switch to Pro" button after a delay
              setTimeout(() => {
                const switchToProButton = document.querySelector('button.text-xs.text-vocab-teal.underline');
                if (switchToProButton) {
                  (switchToProButton as HTMLButtonElement).click();
                }
              }, 100);
            }}>
              Go Pro
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 md:hidden animate-fade-in">
            <div className="flex flex-col p-4 space-y-3">
              <a href="#how-it-works" className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium font-inter" onClick={toggleMenu}>
                How It Works
              </a>
              <a href="#samples" className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium font-inter" onClick={toggleMenu}>
                Sample Words
              </a>
              <a href="#pricing" className="py-2 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium font-inter" onClick={toggleMenu}>
                Pricing
              </a>
              <div className="pt-2 space-y-2">
                <Button className="vocab-btn-secondary w-full justify-center" onClick={scrollToSignup}>
                  Start Free Trial
                </Button>
                <Button className="vocab-btn w-full justify-center" onClick={() => {
                  scrollToSignup();
                  // Set Pro mode in signup form by triggering a click on the "Switch to Pro" button after a delay
                  setTimeout(() => {
                    const switchToProButton = document.querySelector('button.text-xs.text-vocab-teal.underline');
                    if (switchToProButton) {
                      (switchToProButton as HTMLButtonElement).click();
                    }
                  }, 100);
                }}>
                  Go Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

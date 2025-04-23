
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xl">GLINTUP</span>
            </div>
            <p className="text-gray-400">
              Expanding your vocabulary effortlessly.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
            <a href="#how-it-works" className="text-gray-300 hover:text-accent transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-accent transition-colors">Pricing</a>
            <a href="#" className="text-gray-300 hover:text-accent transition-colors">Terms</a>
            <a href="#" className="text-gray-300 hover:text-accent transition-colors">Privacy</a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 GLINTUP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

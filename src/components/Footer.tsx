import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="text-white bg-[#edfff1]/[0.31] py-[8px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <img src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" alt="Glintup" className="h-8" />
            </div>
            <p className="text-gray-400 text-lg font-medium">
              Glintup — Words that stay with you.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Social Icons */}
            
            
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
              <a href="#how-it-works" className="text-gray-300 hover:text-accent transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-accent transition-colors">Pricing</a>
              <Link to="/terms" className="text-gray-300 hover:text-accent transition-colors">Terms</Link>
              <Link to="/privacy" className="text-gray-300 hover:text-accent transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p className="text-zinc-950">© 2025 <span className="text-black">Glintup</span> — a product of Square Blue Media</p>
        </div>
      </div>
    </footer>;
};
export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <img src="/src/assets/logo.svg" alt="Glintup" className="h-8" />
            </div>
            <p className="text-gray-400">
              Expanding your vocabulary effortlessly.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
            <a href="#how-it-works" className="text-gray-300 hover:text-accent transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-300 hover:text-accent transition-colors">Pricing</a>
            <Link to="/terms" className="text-gray-300 hover:text-accent transition-colors">Terms</Link>
            <Link to="/privacy" className="text-gray-300 hover:text-accent transition-colors">Privacy</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Glintup. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

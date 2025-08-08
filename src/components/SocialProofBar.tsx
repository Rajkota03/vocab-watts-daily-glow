
import React from 'react';
import { Users } from 'lucide-react';

const SocialProofBar = () => {
  return (
    <section className="py-8 bg-dark text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex items-center justify-center">
            <Users className="h-6 w-6 mr-3 text-accent" />
            <p className="text-xl font-semibold">10,000+ active learners</p>
          </div>
          
          <div className="h-8 w-0.5 bg-white/20 hidden md:block"></div>
          
          <div className="flex items-center space-x-6">
            <p className="text-md font-medium">Trusted by learners from</p>
            <div className="flex items-center space-x-6">
              <span className="font-bold text-blue-400">Google</span>
              <span className="font-bold text-blue-500">Microsoft</span>
              <span className="font-bold text-amber-500">Amazon</span>
            </div>
          </div>
          
          <div className="h-8 w-0.5 bg-white/20 hidden md:block"></div>
          
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Secure WhatsApp Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;

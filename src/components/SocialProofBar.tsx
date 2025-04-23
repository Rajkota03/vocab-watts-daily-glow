
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
              <span className="font-bold text-accent">Google</span>
              <span className="font-bold text-accent">Microsoft</span>
              <span className="font-bold text-accent">Amazon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;

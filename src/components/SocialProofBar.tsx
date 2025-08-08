
import React from 'react';
import { Users } from 'lucide-react';

const SocialProofBar = () => {
  return (
    <section className="py-6 bg-gray-100 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-600">
          <div className="flex items-center justify-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">Join 10,000+ learners</span>
          </div>
          
          <div className="h-6 w-0.5 bg-gray-300 hidden md:block"></div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium">Trusted by teams at</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-blue-600 opacity-60">Google</span>
              <span className="font-semibold text-blue-700 opacity-60">Microsoft</span>
              <span className="font-semibold text-orange-600 opacity-60">Amazon</span>
            </div>
          </div>
          
          <div className="h-6 w-0.5 bg-gray-300 hidden md:block"></div>
          
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Secure WhatsApp delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;

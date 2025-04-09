
import React from 'react';
import WhatsAppPreview from './WhatsAppPreview';
import { ArrowRight } from 'lucide-react';

const WhatsAppComparison = () => {
  return (
    <div className="py-8">
      <h3 className="text-2xl font-bold text-center mb-8">How VocabSpark Appears on Your WhatsApp</h3>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
        <div className="text-center">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-vocab-teal/10 text-vocab-teal text-sm font-medium rounded-full">
              Free Trial
            </span>
          </div>
          <WhatsAppPreview isPro={false} />
          <p className="mt-4 text-sm text-gray-600 max-w-xs">
            General vocabulary words suitable for everyday use
          </p>
        </div>
        
        <div className="hidden md:flex items-center justify-center">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow opacity-20">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-vocab-purple"></div>
            </div>
          </div>
        </div>
        
        <div className="md:hidden flex justify-center my-6">
          <ArrowRight className="h-6 w-6 text-gray-400 transform rotate-90" />
        </div>
        
        <div className="text-center">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-vocab-purple/10 text-vocab-purple text-sm font-medium rounded-full">
              Pro Subscription
            </span>
          </div>
          <WhatsAppPreview isPro={true} />
          <p className="mt-4 text-sm text-gray-600 max-w-xs">
            Customized vocabulary words based on your selected category
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppComparison;


import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-16 bg-vocab-teal text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start sounding smarter today.
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          5 new words daily, straight to your WhatsApp. No effort, maximum impact.
        </p>
        <Button className="bg-white hover:bg-gray-100 text-vocab-teal text-lg group px-8 py-6 rounded-full transition-all hover:scale-105">
          Get Daily Words on WhatsApp
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="mt-4 opacity-80 text-sm">
          No credit card required to start. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default CTASection;

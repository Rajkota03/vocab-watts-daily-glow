
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-vocab-teal to-vocab-teal/90 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block mb-5 p-3 bg-white/10 rounded-full">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
          Start sounding smarter <span className="relative inline-block">today
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-vocab-yellow/60 rounded-full"></span>
          </span>
        </h2>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
          5 new words daily, straight to your WhatsApp. No effort, maximum impact.
        </p>
        <Button className="bg-white hover:bg-gray-100 text-vocab-teal text-lg group px-10 py-6 rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl">
          Get Daily Words on WhatsApp
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="mt-6 opacity-80 text-sm">
          No credit card required to start. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default CTASection;

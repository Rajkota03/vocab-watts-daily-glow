
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles, Smartphone, CheckCircle } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-vuilder-indigo to-vuilder-indigo/80 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white"></div>
      </div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full mix-blend-overlay animate-float"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: 'white',
                opacity: Math.random() * 0.5,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5 mr-2 text-vuilder-yellow" />
            <span className="text-sm font-medium">Elevate your vocabulary with zero effort</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-poppins leading-tight">
            Start building a smarter vocabulary <span className="block">without studying</span>
          </h2>
          
          <p className="text-lg md:text-xl mb-8 opacity-90 font-inter leading-relaxed">
            5 new words daily, straight to your WhatsApp. No app downloads. No boring lists. Just words that actually stick.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Button className="bg-white hover:bg-gray-50 text-vuilder-indigo text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Start 3-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button className="bg-vuilder-coral hover:bg-vuilder-coral/90 text-white text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Go Pro – ₹149/month
              <Smartphone className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>No credit card required for trial</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>3-day free then ₹149/month</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

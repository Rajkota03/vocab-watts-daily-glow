
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Smartphone } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-vocab-teal to-vocab-teal/90 text-white relative overflow-hidden">
      {/* Background pattern elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-block mb-5 p-3 bg-white/10 rounded-full">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
          Start sounding smarter <span className="relative inline-block">today
            <span className="absolute -bottom-2 left-0 w-full h-2 bg-vocab-yellow/80 rounded-full"></span>
          </span>
        </h2>
        <p className="font-light text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-95 leading-relaxed">
          5 new words daily, straight to your WhatsApp. No effort, maximum impact.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex-1 max-w-xs">
            <div className="phone-mockup scale-75 bg-white">
              <div className="phone-mockup-notch"></div>
              <div className="p-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-vocab-teal flex items-center justify-center text-white font-bold text-xs">VS</div>
                  <div className="ml-2">
                    <span className="text-xs font-bold">VocabSpark</span>
                  </div>
                </div>
                <div className="whatsapp-message text-xs mt-2 p-3">
                  <div className="font-bold mb-1">Word of the day: Ubiquitous</div>
                  <div className="text-[10px]">Present everywhere, widespread</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <Button className="bg-white hover:bg-gray-100 text-vocab-teal text-lg group px-10 py-6 rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl font-medium">
              Get Daily Words on WhatsApp
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="mt-4 opacity-80 text-sm font-light">
              No credit card required to start. Cancel anytime.
            </p>
          </div>
          
          <div className="flex-1 max-w-xs hidden lg:block">
            <div className="phone-mockup scale-75 bg-white">
              <div className="phone-mockup-notch"></div>
              <div className="p-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-vocab-teal flex items-center justify-center text-white font-bold text-xs">VS</div>
                  <div className="ml-2">
                    <span className="text-xs font-bold">VocabSpark</span>
                  </div>
                </div>
                <div className="whatsapp-message text-xs mt-2 p-3">
                  <div className="font-bold mb-1">Word of the day: Eloquent</div>
                  <div className="text-[10px]">Fluent and persuasive in speech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Easy to Use
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 21v-2"/><path d="M17 21v-2"/><path d="M12 21v-3"/><path d="M7 4V3"/><path d="M17 4V3"/><path d="M12 4V3"/><path d="M16 8a4 4 0 0 0-8 0"/></svg>
            Learn effortlessly
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 13V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M16.5 9.4 7.55 4.24"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/></svg>
            Premium Content
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 15a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z"/><path d="M10 8V6a2 2 0 1 1 4 0v2m-8 8v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>
            Personal Growth
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c-1-5-4-8-8-8"/><path d="M20 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
            Join 12,000+ Users
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

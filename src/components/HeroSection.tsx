
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-center md:text-left animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-vocab-teal/10 rounded-full text-vocab-teal mb-6 text-sm font-medium">
              <Smartphone className="w-4 h-4 mr-2" />
              <span className="font-medium">No App, Just WhatsApp</span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
              <span className="text-gray-900">5 Words a Day.</span> <br className="hidden sm:block" />
              <span className="text-vocab-teal relative inline-block">
                Smarter You
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-vocab-yellow/60 rounded-full"></span>
              </span> <span className="text-gray-900">in a Week.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl md:max-w-2xl leading-relaxed font-light">
              Delivered straight to your WhatsApp. No effort. No app. No fluff.
              <span className="typing-animation ml-1">Effortlessly expand your vocabulary.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button className="vocab-btn text-lg group px-8 py-7 font-medium">
                Try It Free – Get Today's Words
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" className="vocab-btn-secondary text-lg px-8 py-7">
                See Sample Words
              </Button>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-vocab-teal mr-2" />
                <span className="text-gray-600">5 Curated Words Daily</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-vocab-teal mr-2" />
                <span className="text-gray-600">12,000+ Users</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-vocab-teal mr-2" />
                <span className="text-gray-600">Cancel Anytime</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md animate-float">
            <div className="phone-mockup max-w-sm mx-auto bg-white overflow-hidden">
              <div className="phone-mockup-notch"></div>
              <div className="p-3">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <button className="p-2 rounded-full bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-vocab-teal flex items-center justify-center text-white font-bold">VS</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">VocabSpark</span>
                      <span className="text-xs text-gray-500">online</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 h-[420px] overflow-y-auto">
                  <div className="bg-gray-100 p-3 rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl ml-auto max-w-[70%] text-xs">
                    Good morning! Ready for today's vocabulary boost?
                  </div>
                  
                  <div className="whatsapp-message p-4 rounded-tr-md rounded-tl-2xl rounded-bl-2xl rounded-br-2xl mr-auto max-w-[85%]">
                    <div className="mb-1 font-bold text-sm">Today's Word: Serendipity</div>
                    <div className="text-xs mb-2">The occurrence of events by chance in a happy or beneficial way</div>
                    <div className="text-xs italic border-l-2 border-vocab-teal pl-2 mt-2">
                      "Meeting my business partner at a random coffee shop was pure serendipity."
                    </div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">10:30 AM</div>
                  </div>
                  
                  <div className="whatsapp-message p-4 rounded-tr-md rounded-tl-2xl rounded-bl-2xl rounded-br-2xl mr-auto max-w-[85%]">
                    <div className="mb-1 font-bold text-sm">Word #2: Eloquent</div>
                    <div className="text-xs mb-2">Fluent or persuasive in speaking or writing</div>
                    <div className="text-xs italic border-l-2 border-vocab-teal pl-2 mt-2">
                      "Her eloquent presentation convinced the investors to fund the project."
                    </div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">10:31 AM</div>
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded-tl-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl ml-auto max-w-[70%] text-xs">
                    These are great! I love the examples.
                  </div>

                  <div className="whatsapp-message p-4 rounded-tr-md rounded-tl-2xl rounded-bl-2xl rounded-br-2xl mr-auto max-w-[85%]">
                    <div className="text-xs">
                      Thanks! 3 more words coming up...
                    </div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">10:33 AM</div>
                  </div>
                  
                  <div className="flex">
                    <div className="mx-auto text-xs text-gray-400 my-1">
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse mr-1"></span>
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse mr-1" style={{animationDelay: '0.2s'}}></span>
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 mt-3 pt-3 flex items-center gap-2">
                  <div className="bg-gray-100 rounded-full flex-1 h-10 flex items-center px-4 text-sm text-gray-400">
                    Type a message
                  </div>
                  <button className="w-10 h-10 rounded-full bg-vocab-teal flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

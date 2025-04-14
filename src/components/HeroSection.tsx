
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, CheckCircle2, Smartphone, Dumbbell } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-br from-white to-vuilder-bg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center mb-6 bg-vuilder-mint/10 py-1.5 px-4 rounded-full text-vuilder-mint text-sm font-medium shadow-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>5 minutes a day to a better vocabulary</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 font-poppins text-vuilder-indigo">
              5 Words a Day. <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-vuilder-mint to-vuilder-indigo bg-clip-text text-transparent">Smarter You</span>
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-vuilder-yellow rounded-full"></span>
              </span> 
              in a Week.
              <Dumbbell className="w-8 h-8 text-vuilder-indigo inline ml-2 animate-pulse-light" />
            </h1>
            
            <p className="text-lg text-vuilder-text mb-8 max-w-xl mx-auto lg:mx-0 font-inter leading-relaxed">
              Your daily vocabulary boost, delivered straight to WhatsApp. 
              No effort. No app. No fluff. Just five carefully selected words 
              that will transform how you communicate.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-vuilder-mint hover:bg-vuilder-mint/90 text-white text-base group px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:translate-y-[-2px]">
                Try It Free – Get Today's Words
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" className="bg-white border-2 border-vuilder-indigo text-vuilder-indigo hover:bg-vuilder-indigo/5 text-base px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:shadow">
                See Sample Words
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-vuilder-mint mr-2" />
                <span>No download required</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-vuilder-yellow mr-2" />
                <span>Free 3-day trial</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-vuilder-mint mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md animate-float relative">
            <div className="absolute -top-8 -left-8 w-20 h-20 bg-vuilder-mint/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-vuilder-indigo/10 rounded-full blur-xl"></div>
            
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-7 mx-auto max-w-sm transform rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-vuilder-indigo flex items-center justify-center shadow-lg relative">
                <span className="text-white font-bold">V</span>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5">
                  <Dumbbell className="h-2 w-2 text-white transform rotate-90" />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5">
                  <Dumbbell className="h-2 w-2 text-white transform rotate-90" />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-vuilder-indigo flex items-center justify-center relative">
                  <span className="text-white font-bold">V</span>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                    <Dumbbell className="h-2 w-2 text-white transform rotate-90" />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                    <Dumbbell className="h-2 w-2 text-white transform rotate-90" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-vuilder-indigo">VUILDER</h4>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-whatsapp-light/50 to-whatsapp-light/30 p-3 rounded-lg rounded-tl-none shadow-sm transition-all hover:shadow-md">
                <div className="absolute top-2 right-3 text-xs text-gray-500">9:41 AM</div>
                <p className="font-bold mb-1 text-vuilder-indigo">Today's Word: Serendipity</p>
                <p className="text-sm mb-1.5 text-gray-700">The occurrence of events by chance in a happy or beneficial way</p>
                <p className="text-sm italic text-gray-600 border-l-2 border-vuilder-mint pl-2">It was pure serendipity that I met my business partner at a random coffee shop.</p>
              </div>
              
              <div className="mt-4 text-center flex items-center justify-between">
                <p className="text-xs text-gray-500 italic">✨ Pro users get witty examples and more!</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vuilder-yellow shadow-sm"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vuilder-mint shadow-sm"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vuilder-coral shadow-sm"></div>
                </div>
              </div>
              
              <div className="text-center text-sm font-medium text-gray-600 mt-4 pt-4 border-t border-gray-100">
                <p className="flex items-center justify-center">
                  <Smartphone className="h-4 w-4 mr-1.5 text-vuilder-mint" />
                  + 4 more words daily
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

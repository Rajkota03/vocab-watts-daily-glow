
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 text-center md:text-left animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-vocab-teal/10 rounded-full text-vocab-teal mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              No App, No Studying, Just Results
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              5 Words a Day. <br className="hidden sm:block" />
              <span className="text-vocab-teal relative inline-block">
                Smarter You
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-vocab-yellow/60 rounded-full"></span>
              </span> in a Week.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl md:max-w-2xl leading-relaxed">
              Delivered straight to your WhatsApp. No effort. No app. No fluff.
              Effortlessly expand your vocabulary, one ping at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button className="vocab-btn text-lg group px-8 py-7">
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
            <div className="relative bg-white rounded-3xl shadow-xl p-4 md:p-6 mx-auto max-w-sm border border-gray-100">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19.3547 4.55156C17.3906 2.58281 14.7547 1.5 11.9953 1.5C6.25781 1.5 1.58906 6.16875 1.58906 11.9062C1.58906 13.8094 2.10469 15.6656 3.07031 17.2875L1.5 22.5L6.84375 20.9578C8.40937 21.8391 10.1812 22.3078 11.9906 22.3078H11.9953C17.7281 22.3078 22.5 17.6391 22.5 11.9016C22.5 9.14219 21.3188 6.52031 19.3547 4.55156Z"/>
                </svg>
              </div>
              <div className="flex items-center mb-4 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-vocab-teal/20 flex items-center justify-center">
                  <span className="text-vocab-teal font-bold">VS</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold">VocabSpark</h4>
                  <p className="text-xs text-gray-600">Expanding your vocabulary daily</p>
                </div>
              </div>
              <div className="bg-whatsapp-light p-4 rounded-2xl relative mb-4">
                <div className="absolute top-4 right-4 text-xs text-gray-500">10:30 AM</div>
                <p className="font-bold mb-2 pr-16">Today's Word: Serendipity</p>
                <p className="text-sm mb-2">The occurrence of events by chance in a happy or beneficial way</p>
                <p className="text-sm italic border-l-2 border-vocab-teal/30 pl-3 mt-3">It was pure serendipity that I met my business partner at a random coffee shop.</p>
              </div>
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>+ 4 more words daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

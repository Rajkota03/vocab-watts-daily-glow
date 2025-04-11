
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Clock, CheckCircle2, Smartphone } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center mb-6 bg-gradient-to-r from-vocab-teal/10 to-vocab-purple/10 py-1.5 px-4 rounded-full text-vocab-teal text-sm font-medium shadow-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>5 minutes a day to a better vocabulary</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 font-poppins">
              5 Words a Day. <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-vocab-teal to-vocab-purple bg-clip-text text-transparent">Smarter You</span>
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-vocab-yellow to-vocab-yellow/70 rounded-full"></span>
              </span> 
              in a Week.
              <Sparkles className="w-8 h-8 text-vocab-yellow inline ml-2 animate-pulse-light" />
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 font-inter leading-relaxed">
              Your daily vocabulary boost, delivered straight to WhatsApp. 
              No effort. No app. No fluff. Just five carefully selected words 
              that will transform how you communicate.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-gradient-to-r from-vocab-purple to-purple-500 hover:shadow-lg text-base group px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:translate-y-[-2px]">
                Try It Free – Get Today's Words
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" className="bg-white border-2 border-vocab-teal text-vocab-teal hover:bg-vocab-teal/5 text-base px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:shadow">
                See Sample Words
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span>No download required</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span>Free 3-day trial</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md animate-float relative">
            <div className="absolute -top-8 -left-8 w-20 h-20 bg-vocab-purple/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-vocab-teal/10 rounded-full blur-xl"></div>
            
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-7 mx-auto max-w-sm transform rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-r from-whatsapp-green to-green-400 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19.3547 4.55156C17.3906 2.58281 14.7547 1.5 11.9953 1.5C6.25781 1.5 1.58906 6.16875 1.58906 11.9062C1.58906 13.8094 2.10469 15.6656 3.07031 17.2875L1.5 22.5L6.84375 20.9578C8.40937 21.8391 10.1812 22.3078 11.9906 22.3078H11.9953C17.7281 22.3078 22.5 17.6391 22.5 11.9016C22.5 9.14219 21.3188 6.52031 19.3547 4.55156ZM11.9953 20.5406C10.3781 20.5406 8.79375 20.0906 7.40625 19.2516L7.07812 19.0547L3.95625 19.9547L4.86562 16.8844L4.64531 16.5422C3.72187 15.1078 3.23438 13.4344 3.23438 11.9062C3.23438 7.08281 7.17187 3.14531 12 3.14531C14.3109 3.14531 16.4906 4.0547 18.1125 5.68125C19.7344 7.30781 20.8594 9.48281 20.8547 11.9016C20.8547 16.7297 16.8187 20.5406 11.9953 20.5406ZM16.7906 14.0672C16.5094 13.9266 15.1594 13.2609 14.8969 13.1672C14.6344 13.0734 14.4422 13.0266 14.25 13.3078C14.0578 13.5891 13.5328 14.2078 13.3641 14.4C13.1953 14.5922 13.0266 14.6156 12.7453 14.475C12.4641 14.3344 11.5734 14.0344 10.5188 13.0875C9.69375 12.3469 9.14531 11.4422 8.97656 11.1609C8.80781 10.8797 8.95781 10.7203 9.10312 10.5703C9.23437 10.4344 9.39375 10.2141 9.53906 10.0453C9.68437 9.87656 9.73125 9.75938 9.825 9.56719C9.91875 9.375 9.87187 9.20625 9.80156 9.06563C9.73125 8.925 9.18281 7.57031 8.94375 7.00781C8.7 6.44531 8.45625 6.5203 8.27344 6.5203C8.10469 6.5203 7.9125 6.49688 7.72031 6.49688C7.52812 6.49688 7.21875 6.56719 6.95625 6.84844C6.69375 7.12969 5.98125 7.79531 5.98125 9.15C5.98125 10.5047 6.975 11.8125 7.12031 12.0047C7.26562 12.1969 9.14062 15.0891 12.0141 16.2797C12.8297 16.6266 13.4625 16.8328 13.9547 16.9875C14.775 17.2406 15.5203 17.2031 16.1062 17.1328C16.7625 17.0531 17.8641 16.4672 18.1031 15.8109C18.3422 15.1547 18.3422 14.5922 18.2719 14.4703C18.2016 14.3484 18.0094 14.2781 17.7281 14.1375L16.7906 14.0672Z"/>
                </svg>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-vocab-teal/30 to-vocab-purple/30 flex items-center justify-center">
                  <span className="text-vocab-teal font-bold">VS</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold">VocabSpark</h4>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-whatsapp-light/50 to-whatsapp-light/30 p-3 rounded-lg rounded-tl-none shadow-sm transition-all hover:shadow-md">
                <div className="absolute top-2 right-3 text-xs text-gray-500">9:41 AM</div>
                <p className="font-bold mb-1 text-gray-800">Today's Word: Serendipity</p>
                <p className="text-sm mb-1.5 text-gray-700">The occurrence of events by chance in a happy or beneficial way</p>
                <p className="text-sm italic text-gray-600 border-l-2 border-vocab-purple pl-2">It was pure serendipity that I met my business partner at a random coffee shop.</p>
              </div>
              
              <div className="mt-4 text-center flex items-center justify-between">
                <p className="text-xs text-gray-500 italic">✨ Pro users get witty examples and more!</p>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vocab-yellow shadow-sm"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vocab-purple shadow-sm"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-vocab-red shadow-sm"></div>
                </div>
              </div>
              
              <div className="text-center text-sm font-medium text-gray-600 mt-4 pt-4 border-t border-gray-100">
                <p className="flex items-center justify-center">
                  <Smartphone className="h-4 w-4 mr-1.5 text-vocab-teal" />
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

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };
  const testimonials = [{
    quote: "It's the only habit I stick to.",
    author: "Priya M.",
    role: "Marketing Manager"
  }, {
    quote: "I open WhatsApp and learn — no extra effort.",
    author: "Rahul S.",
    role: "Software Engineer"
  }, {
    quote: "Memory hook makes the word stick instantly.",
    author: "Ananya K.",
    role: "IELTS Student"
  }, {
    quote: "Perfect when I'm having my morning tea.",
    author: "Raj T.",
    role: "Business Owner"
  }];
  return <section className="md:py-16 bg-gray-50 py-[11px]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Learners Love It</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            (More real testimonials coming soon)
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Mobile/tablet navigation arrows */}
          <div className="flex items-center justify-end gap-2 mb-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={scrollLeft} className="rounded-full bg-white shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={scrollRight} className="rounded-full bg-white shadow-sm">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:block absolute -left-16 top-1/2 -translate-y-1/2 z-10">
            <Button variant="ghost" size="icon" onClick={scrollLeft} className="rounded-full bg-white shadow-md">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="hidden md:block absolute -right-16 top-1/2 -translate-y-1/2 z-10">
            <Button variant="ghost" size="icon" onClick={scrollRight} className="rounded-full bg-white shadow-md">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Testimonials slider */}
          <div ref={scrollRef} className="flex overflow-x-auto space-x-4 scrollbar-hide pb-4 snap-x snap-mandatory" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
            {testimonials.map((testimonial, index) => <div key={index} className="bg-white min-w-[280px] md:min-w-[350px] flex-shrink-0 p-6 rounded-2xl shadow-lg border border-gray-100 snap-start relative">
                {/* Speech bubble tail */}
                <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                
                <div className="mb-4">
                  <p className="text-gray-700 text-lg leading-relaxed">"{testimonial.quote}"</p>
                </div>
                
                <div className="flex items-center pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden shadow-md">
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default Testimonials;
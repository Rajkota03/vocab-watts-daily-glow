
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const testimonials = [
    {
      quote: "Best thing on my WhatsApp every morning. I've actually started using the words in meetings!",
      author: "Priya M.",
      role: "Marketing Manager",
      avatar: "/src/assets/avatar-1.jpg" // These would need to be added to assets
    },
    {
      quote: "The witty examples help me remember the words. Finally, vocab that's not boring!",
      author: "Rahul S.",
      role: "Software Engineer",
      avatar: "/src/assets/avatar-2.jpg"
    },
    {
      quote: "Actually retained words thanks to the regular delivery. Worth every rupee!",
      author: "Ananya K.",
      role: "IELTS Student",
      avatar: "/src/assets/avatar-3.jpg"
    },
    {
      quote: "My clients are impressed by my improved vocabulary. GLINTUP is a game-changer!",
      author: "Vikram J.",
      role: "Freelance Copywriter",
      avatar: "/src/assets/avatar-4.jpg"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands who are already sounding smarter with GLINTUP.
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
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white min-w-[280px] md:min-w-[350px] flex-shrink-0 p-6 rounded-xl shadow-md snap-start"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {/* If you have actual avatars, use them here */}
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

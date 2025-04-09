
import React from 'react';
import { Star, MessageCircle, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Best thing on my WhatsApp every morning. I've actually started using the words in meetings!",
      author: "Priya M.",
      role: "Marketing Manager",
      stars: 5
    },
    {
      quote: "It's vocab, but not boring for once. The witty examples help me remember the words.",
      author: "Rahul S.",
      role: "Software Engineer",
      stars: 5
    },
    {
      quote: "Actually retained words thanks to the regular delivery and clever examples.",
      author: "Ananya K.",
      role: "IELTS Student",
      stars: 5
    },
    {
      quote: "My clients are impressed by my improved vocabulary. Worth every rupee!",
      author: "Vikram J.",
      role: "Freelance Copywriter",
      stars: 5
    },
    {
      quote: "As someone preparing for GRE, this app has been a lifesaver for vocab prep.",
      author: "Neha T.",
      role: "Graduate Student",
      stars: 4
    },
    {
      quote: "The Elite plan personalized words have been perfect for my job interviews.",
      author: "Arjun P.",
      role: "Job Seeker",
      stars: 5
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-5 p-3 bg-vocab-purple/10 rounded-full">
            <MessageCircle className="w-8 h-8 text-vocab-purple" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-800 tracking-tight">Our Users Love It</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands who are already sounding smarter with VocabSpark.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-vocab-teal/20 hover:translate-y-[-4px]"
            >
              <div className="flex mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.stars ? 'text-vocab-yellow fill-vocab-yellow' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <div className="mb-6">
                <Quote className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-gray-700 mb-4 text-lg leading-relaxed">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-vocab-teal/10 flex items-center justify-center text-vocab-teal font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

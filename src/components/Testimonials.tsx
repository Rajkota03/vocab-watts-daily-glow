
import React from 'react';
import { Star } from 'lucide-react';

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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands who are already sounding smarter with VocabSpark.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.stars ? 'text-vocab-yellow fill-vocab-yellow' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="italic text-gray-700 mb-4">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

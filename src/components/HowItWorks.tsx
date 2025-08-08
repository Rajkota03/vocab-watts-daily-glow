
import React from 'react';
import { CheckCircle, Smartphone, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: CheckCircle,
      title: "Pick your category",
      description: "Choose from business, academic, creative writing, or general vocabulary improvement.",
      microcopy: "Find words that fit your world"
    },
    {
      icon: Smartphone,
      title: "Get curated words daily",
      description: "5 handpicked words with meanings and examples delivered directly to your WhatsApp.",
      microcopy: "No app downloads, no email clutter"
    },
    {
      icon: Sparkles,
      title: "Quiz & make them stick",
      description: "Practice with quick quizzes and start using your new vocabulary confidently.",
      microcopy: "Turn knowledge into habit"
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How Glintup Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Building your vocabulary has never been this simple and effective
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="group bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                <step.icon className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="text-center mb-2">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
              <p className="text-sm text-accent font-medium mb-3 text-center italic">{step.microcopy}</p>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <div className="flex items-center mb-4 bg-[#128C7E] text-white p-2 rounded-t-lg">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">G</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">Glintup</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#DCF8C6]/50 p-3 rounded-lg rounded-tl-none">
                <p className="font-bold mb-1">Today's Word: Ubiquitous</p>
                <p className="text-sm mb-1.5">Present, appearing, or found everywhere</p>
                <p className="text-sm italic border-l-2 border-[#25D366] pl-2">Smartphones have become ubiquitous in our daily lives, used for everything from communication to navigation.</p>
              </div>
              
              <div className="text-right text-xs text-gray-500">
                7:30 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import React from 'react';
import { CheckCircle, Smartphone, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: CheckCircle,
      title: "1. Pick your category",
      description: "Choose from business, academic, creative writing, or general vocabulary improvement."
    },
    {
      icon: Smartphone,
      title: "2. Receive on WhatsApp",
      description: "Get 5 curated words daily with meanings and examples directly on your phone."
    },
    {
      icon: Sparkles,
      title: "3. Quiz & use words",
      description: "Practice with quick quizzes and start using your new vocabulary right away."
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How GLINTUP Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Building your vocabulary has never been this simple and effective
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4 text-white">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
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
                <p className="font-medium">GLINTUP</p>
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

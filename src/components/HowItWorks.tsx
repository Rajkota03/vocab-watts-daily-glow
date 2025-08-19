import React from 'react';
import { CheckCircle, Smartphone, Sparkles } from 'lucide-react';
const HowItWorks = () => {
  const steps = [{
    icon: CheckCircle,
    title: "Choose how many words/day you want",
    description: "1 to 5 words daily",
    microcopy: "Perfect dose for your schedule"
  }, {
    icon: Smartphone,
    title: "Pick your preferred delivery times",
    description: "Like 8AM, 12PM, 3PM...",
    microcopy: "Spaced throughout your day"
  }, {
    icon: Sparkles,
    title: "Receive one word at a time via WhatsApp",
    description: "Tap to learn. Done in 2 minutes.",
    microcopy: "No screen overload or study pressure"
  }];
  return <section id="how-it-works" className="section-padding bg-white">
      <div className="container-wide">
        <div className="text-center mb-8">
          <h2 className="heading-lg mb-2">How It Works</h2>
          <p className="body-text text-gray-600 max-w-2xl mx-auto">
            Perfect for improving vocabulary without screen overload or study pressure
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => <div key={index} className="group bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-3 text-white group-hover:scale-105 transition-transform duration-300">
                <step.icon className="h-7 w-7 stroke-[1.5]" />
              </div>
              <div className="text-center mb-2">
                <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{index + 1}</span>
              </div>
              <h3 className="heading-md mb-1.5 text-center">{step.title}</h3>
              <p className="text-sm text-accent font-medium mb-2 text-center italic">{step.microcopy}</p>
              <p className="body-text-sm text-gray-600 text-center">{step.description}</p>
            </div>)}
        </div>
        
        <div className="mt-10 max-w-md mx-auto">
          
        </div>
      </div>
    </section>;
};
export default HowItWorks;
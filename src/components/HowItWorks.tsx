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
  return <section id="how-it-works" className="section-padding-compact bg-white">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="heading-lg mb-2">How It Works</h2>
          <p className="body-text text-gray-600 max-w-xl mx-auto">
            Perfect for improving vocabulary without screen overload or study pressure
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => <div key={index} className="group bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4 text-white group-hover:scale-105 transition-transform duration-300 mx-auto">
                <step.icon className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="mb-3">
                <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">{index + 1}</span>
              </div>
              <h3 className="heading-sm mb-2">{step.title}</h3>
              <p className="text-sm text-accent font-medium mb-3 italic">{step.microcopy}</p>
              <p className="body-text-sm text-gray-600">{step.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;
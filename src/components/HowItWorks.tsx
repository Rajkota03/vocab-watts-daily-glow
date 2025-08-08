
import React from 'react';
import { CheckCircle, Smartphone, Sparkles } from 'lucide-react';
import howItWorksIcons from '@/assets/how-it-works-icons.svg';

const HowItWorks = () => {
  const steps = [
    {
      icon: CheckCircle,
      title: "Pick your category",
      description: "Business, exams, everyday fluency.",
      microcopy: "Find words that fit your world"
    },
    {
      icon: Smartphone,
      title: "Get words on WhatsApp",
      description: "5 curated words daily.",
      microcopy: "No app downloads, no email clutter"
    },
    {
      icon: Sparkles,
      title: "Make them stick",
      description: "Weekly recap & Sunday quiz (Pro).",
      microcopy: "Turn knowledge into habit"
    }
  ];

  return (
    <section id="how-it-works" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            How Glintup Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building your vocabulary has never been this simple and effective
          </p>
        </div>
        
        {/* Illustration banner */}
        <div className="mb-16 flex justify-center">
          <div className="illustration-container max-w-4xl">
            <img 
              src={howItWorksIcons} 
              alt="How Glintup works process" 
              className="w-full h-auto animate-fade-in-up"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="group card-flat hover-lift text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <step.icon className="h-8 w-8 stroke-[1.5]" />
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                  Step {index + 1}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-accent font-medium mb-3 italic">{step.microcopy}</p>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* WhatsApp preview mockup */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="card-flat overflow-hidden">
            <div className="flex items-center mb-4 bg-whatsapp-green text-white p-4 rounded-t-2xl">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-sm">G</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">Glintup</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="bg-whatsapp-light/50 p-4 rounded-lg rounded-tl-none speech-bubble">
                <p className="font-bold mb-1 text-primary">Today's Word: Ubiquitous</p>
                <p className="text-sm mb-2 text-muted-foreground">Present, appearing, or found everywhere</p>
                <p className="text-sm italic border-l-2 border-primary pl-2 text-foreground">
                  "Smartphones have become ubiquitous in our daily lives, used for everything from communication to navigation."
                </p>
              </div>
              
              <div className="text-right text-xs text-muted-foreground">
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

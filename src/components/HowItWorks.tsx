import React from 'react';
import { CheckCircle, Smartphone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion

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

  // Animation variants for fade-in effect
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      id="how-it-works" 
      className="py-16 md:py-24 bg-background"
      initial="hidden" // Start hidden
      whileInView="visible" // Animate when in view
      viewport={{ once: true, amount: 0.2 }} // Trigger once, when 20% is visible
      variants={fadeIn} // Apply fade-in variants
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4 text-foreground">How GLINTUP Works</h2>
          <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
            Building your vocabulary has never been this simple and effective
          </p>
        </div>
        
        {/* Steps Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16 md:mb-20">
          {steps.map((step, index) => (
            // Optional: Add staggered animation to cards if desired later
            <div 
              key={index} 
              className="bg-card p-6 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5 text-primary">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold font-poppins mb-3 text-foreground">{step.title}</h3>
              <p className="text-secondary-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* WhatsApp Example */}
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl shadow-lg p-4 border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center mb-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-2 rounded-t-lg -m-4 mb-4">
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-lg">G</span>
              </div>
              <div className="ml-3">
                <p className="font-semibold">GLINTUP</p>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            
            {/* Message Bubble */}
            <div className="space-y-3">
              <div className="bg-primary-light/40 p-3 rounded-lg rounded-tl-none max-w-[90%] mr-auto">
                <p className="font-semibold text-primary-foreground mb-1">Today's Word: Ubiquitous</p>
                <p className="text-sm text-primary-foreground/90 mb-1.5">Present, appearing, or found everywhere</p>
                <p className="text-sm text-primary-foreground/90 italic border-l-2 border-primary pl-2">Smartphones have become ubiquitous in our daily lives, used for everything from communication to navigation.</p>
              </div>
              
              <div className="text-right text-xs text-muted-foreground">
                7:30 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;


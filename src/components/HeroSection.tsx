import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Temporarily commented out
// import SignupForm from './SignupForm'; // Temporarily commented out

const HeroSection = () => {
  // const [isDialogOpen, setIsDialogOpen] = React.useState(false); // Temporarily commented out

  return (
    <section 
      id="hero" 
      className="min-h-screen py-20 md:py-28 flex items-center bg-gradient-to-br from-primary-light/30 via-white to-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center mb-5 py-1 px-3 rounded-full bg-accent-light text-accent-foreground text-sm font-medium shadow-sm">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-4 h-4 mr-1.5" />
              Learn directly on WhatsApp
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins leading-tight tracking-tight mb-5 text-foreground">
              5 fresh words <span className="text-primary">every day</span>—<br />straight to WhatsApp.
            </h1>
            
            <p className="text-lg text-secondary-foreground mb-8 leading-relaxed">
              No apps. No boring word lists. Just vocabulary that sticks.
            </p>
            
            {/* Call to Action Buttons - Simplified */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              {/* Temporarily replace Dialog with a simple button */}
              <Button 
                size="lg" 
                className="group bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 w-full sm:w-auto transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                Start 3-Day Free Trial (Test)
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Feature Highlights */}
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3">
              <div className="flex items-center text-sm text-secondary-foreground">
                <CheckCircle className="h-4 w-4 text-accent mr-1.5 flex-shrink-0" />
                Verified WhatsApp number
              </div>
              <div className="flex items-center text-sm text-secondary-foreground">
                <CheckCircle className="h-4 w-4 text-accent mr-1.5 flex-shrink-0" />
                Free 3-day trial
              </div>
              <div className="flex items-center text-sm text-secondary-foreground">
                <CheckCircle className="h-4 w-4 text-accent mr-1.5 flex-shrink-0" />
                Cancel anytime
              </div>
            </div>
          </div>
          
          {/* Signup Form Card (Temporarily commented out) */}
          {/* 
          <div className="flex-1 max-w-md w-full hidden lg:block">
            <div className="relative">
              <div className="relative bg-card rounded-xl shadow-lg p-6 border border-border/50">
                <SignupForm />
              </div>
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


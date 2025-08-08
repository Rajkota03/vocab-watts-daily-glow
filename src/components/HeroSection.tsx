import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EmailSignupForm from './auth/EmailSignupForm';
import { useNavigate } from 'react-router-dom';
import heroPersonPhone from '@/assets/hero-person-phone.svg';
import heroBackgroundShapes from '@/assets/hero-background-shapes.svg';

const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <section className="min-h-screen py-20 md:py-0 flex items-center relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      {/* Background abstract shapes */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img 
          src={heroBackgroundShapes} 
          alt="" 
          className="w-full h-full object-cover animate-float"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="flex-1 lg:order-1 order-2">
            <div className="relative illustration-container max-w-md mx-auto lg:mx-0">
              <img 
                src={heroPersonPhone} 
                alt="Person using Glintup on WhatsApp" 
                className="w-full h-auto animate-float hover-bounce"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-accent to-accent-light rounded-full opacity-20 animate-bounce-gentle"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full opacity-20 animate-float"></div>
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="flex-1 lg:order-2 order-1 text-center lg:text-left">
            <div className="inline-flex items-center mb-6 py-2 px-4 rounded-full text-primary-dark text-sm font-medium bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              <span className="font-bold">Learn directly on WhatsApp</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Glintup Your Vocabulary Effortlessly
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              5 smart words a day. Clear meanings, examples, and synonyms — delivered straight to WhatsApp.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-accent group w-full sm:w-auto">
                    Start 3-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Start your free trial</h3>
                    <p className="text-muted-foreground">(30 seconds)</p>
                  </div>
                  <EmailSignupForm /> 
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => navigate('/login')} className="btn-outline w-full sm:w-auto">
                Log in / Go Pro
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 rounded-full px-4 py-2 shadow-soft">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Verified WhatsApp delivery</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 rounded-full px-4 py-2 shadow-soft">
                <CheckCircle className="h-4 w-4 text-accent mr-2" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 rounded-full px-4 py-2 shadow-soft">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
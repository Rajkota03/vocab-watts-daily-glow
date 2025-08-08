import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EmailSignupForm from './auth/EmailSignupForm';
import { useNavigate } from 'react-router-dom';
import heroLifestyle from '@/assets/hero-lifestyle.jpg';
const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  return <section className="min-h-screen py-24 md:py-0 flex items-center bg-gradient-to-br from-white to-primary/10 overflow-hidden relative">
      {/* Background lifestyle image */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-transparent to-white z-0">
        <img 
          src={heroLifestyle} 
          alt="Person learning vocabulary on WhatsApp" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left px-[49px]">
            <div className="inline-flex items-center mb-6 py-1.5 rounded-full text-dark text-sm font-medium shadow-sm bg-green-500 px-[13px]">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              <span className="font-bold">Learn directly on Whatsapp</span>
            </div>
            
            <h1 className="sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 text-2xl px-0 mx-0">5 fresh words every day. Straight to WhatsApp.</h1>
            
            <p className="text-lg text-dark/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Learn 5 powerful new words every day, with meanings, synonyms, and usage — all delivered effortlessly to your WhatsApp.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {/* TODO: Update onClick to open AuthModal with initialTab='signup', initialPlan='trial' */}
                  <Button className="group bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-7 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-lg font-semibold shadow-lg">
                    Start 3-Day Free Trial
                    <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <EmailSignupForm /> 
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => navigate('/login')} variant="ghost" className="text-primary hover:bg-primary/10 text-base px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300">
                Log In / Go Pro
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Verified WhatsApp number</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-5 w-5 text-accent mr-2" />
                <span>Free 3-day trial</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-dark/10 rounded-full blur-xl"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100 px-[24px]">
                <EmailSignupForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;
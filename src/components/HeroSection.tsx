import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EmailSignupForm from './auth/EmailSignupForm';
import { useNavigate } from 'react-router-dom';
const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  return <section className="min-h-screen py-24 md:py-0 flex items-center bg-gradient-to-br from-white to-primary/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left px-[49px]">
            <div className="inline-flex items-center mb-6 py-1.5 rounded-full text-dark text-sm font-medium shadow-sm bg-green-500 px-[13px]">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              <span className="font-bold">Learn directly on Whatsapp</span>
            </div>
            
            <h1 className="sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 text-2xl px-0 mx-0">
              5 fresh words every day—<br />straight to WhatsApp.
            </h1>
            
            <p className="text-lg text-dark/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              No apps. No boring word lists. Just vocabulary that sticks.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {/* TODO: Update onClick to open AuthModal with initialTab='signup', initialPlan='trial' */}
                  <Button className="group bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95">
                    Start 3-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <EmailSignupForm /> 
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => navigate('/login')} variant="outline" className="border-primary text-primary hover:bg-primary/10 text-base px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95">
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
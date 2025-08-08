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
        <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
          <div className="flex-1 text-center lg:text-right px-[49px]">
            <div className="inline-flex items-center mb-6 py-1.5 rounded-full text-dark text-sm font-medium shadow-sm bg-green-500 px-[13px]">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              <span className="font-bold">Learn directly on Whatsapp</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">Glintup Your Vocabulary Effortlessly</h1>
            
            <p className="text-xl lg:text-2xl text-dark/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              5 smart words a day. Clear meanings, examples, and synonyms — delivered straight to WhatsApp.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="group bg-accent hover:bg-accent/90 text-white px-8 py-4 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-lg font-semibold shadow-lg rounded-full">
                    Start 3-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Start your free trial</h3>
                    <p className="text-gray-600">(30 seconds)</p>
                  </div>
                  <EmailSignupForm /> 
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => navigate('/login')} variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto w-full sm:w-auto transition-all duration-300 rounded-full">
                Log in / Go Pro
              </Button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>Verified WhatsApp delivery</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-accent mr-2" />
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
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
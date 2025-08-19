import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EmailSignupForm from './auth/EmailSignupForm';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '@/assets/hero-learning-illustration.jpg';
const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  return <section className="min-h-screen py-12 md:py-0 flex items-center bg-gradient-to-br from-white to-primary/5 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Illustration - Left side on desktop, top on mobile */}
          <div className="flex-1 order-1 lg:order-1">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/10 rounded-full blur-xl"></div>
              
              <img 
                src={heroIllustration} 
                alt="Person learning vocabulary on WhatsApp - cartoon illustration" 
                className="w-full h-auto object-contain relative z-10 rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* Content - Right side on desktop, bottom on mobile */}
          <div className="flex-1 order-2 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center mb-6 py-1.5 rounded-full text-white text-sm font-medium shadow-sm bg-green-500 px-4">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              <span className="font-bold">Learn directly on WhatsApp</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 text-dark">
              Master 5 New Words a Day. Delivered to You.
            </h1>
            
            <p className="text-xl lg:text-2xl text-dark/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Understand pronunciation, meaning, usage, and a memory hook — all under 2 minutes. Delivered daily on WhatsApp at your preferred time.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                   <Button className="group bg-accent hover:bg-accent/90 text-white px-8 py-4 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-lg font-semibold shadow-lg rounded-full">
                    Try a Free Word Now
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
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>No app download required</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-accent mr-2" />
                <span>Built for busy learners</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span>One word at a time, spaced through your day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;
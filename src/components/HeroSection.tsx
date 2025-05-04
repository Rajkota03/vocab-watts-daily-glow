
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';

const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();
  
  // WhatsApp direct link with pre-filled message
  const whatsappLink = "https://wa.me/918978354242?text=JOIN%20GlintUp";
  
  return <section className="min-h-screen py-24 md:py-0 flex items-center bg-gradient-to-br from-white to-primary/5 overflow-hidden">
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
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto"
              >
                <Button 
                  className="group px-6 py-6 h-auto w-full transition-all duration-300 hover:translate-y-[-2px] flex items-center justify-center"
                >
                  <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
                  Join on WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="border-2 border-dark text-dark hover:bg-dark/5 text-base px-6 py-6 h-auto w-full sm:w-auto transition-all duration-300">
                    See Sample Words
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Sample Words on WhatsApp</h3>
                    <div className="bg-[#DCF8C6]/50 p-4 rounded-lg mb-4 border-l-4 border-[#25D366]">
                      <p className="font-bold mb-2 text-dark">Today's Word: Serendipity</p>
                      <p className="text-sm mb-1.5 text-gray-700">The occurrence of events by chance in a happy or beneficial way</p>
                      <p className="text-sm italic text-gray-600 border-l-2 border-primary pl-2">It was pure serendipity that I met my business partner at a random coffee shop.</p>
                    </div>
                    <div className="text-center">
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Button onClick={() => setIsDialogOpen(false)}>
                          Join on WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center text-sm text-gray-500 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>No download required</span>
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
                <img 
                  src="/lovable-uploads/abe19db1-a4de-45f3-8a79-3e5ae08951d8.png" 
                  alt="WhatsApp Flow" 
                  className="rounded-lg shadow-md w-full"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold mb-2">WhatsApp-First Flow</h3>
                  <p className="text-gray-600 mb-4">Join and get your first words in seconds!</p>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full flex items-center justify-center">
                      <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
                      Join on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroSection;

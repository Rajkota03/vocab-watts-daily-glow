
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SignupForm from './SignupForm';

const CTASection = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <section className="py-20 bg-gradient-to-br from-duolingo-purple to-duolingo-purple/90 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5 mr-2 text-duolingo-yellow" />
            <span className="text-sm font-medium">Elevate your vocabulary with zero effort</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-poppins leading-tight">
            Start building a smarter vocabulary <span className="block">without studying</span>
          </h2>
          
          <p className="text-lg md:text-xl mb-8 opacity-90 font-inter leading-relaxed">
            5 new words daily, straight to your WhatsApp. No app downloads. No boring lists. Just words that actually stick.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-duolingo-green hover:bg-duolingo-green/90 text-white text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Start 3-Day Free Trial
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <SignupForm />
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-duolingo-red hover:bg-duolingo-red/90 text-white text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Go Pro – ₹149/month
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>No credit card required for trial</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

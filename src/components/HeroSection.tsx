import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EmailSignupForm from './auth/EmailSignupForm';
import { useNavigate } from 'react-router-dom';
import { usePricing } from '@/hooks/usePricing';
const HeroSection = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const { getEffectivePrice, getPriceDisplay, getOriginalPriceDisplay, hasActiveDiscount, isLoading } = usePricing();

  const handleSubscribe = () => {
    navigate('/payment', {
      state: {
        plan: {
          isPro: true,
          price: getEffectivePrice()
        }
      }
    });
  };

  const renderPriceDisplay = () => {
    if (isLoading) {
      return "Loading...";
    }

    if (hasActiveDiscount()) {
      return (
        <span className="flex items-center gap-2">
          Subscribe for {getPriceDisplay()}/month
          <span className="text-sm text-white/70 line-through">
            {getOriginalPriceDisplay()}
          </span>
        </span>
      );
    }

    return `Subscribe for ${getPriceDisplay()}/month`;
  };
  return <section className="min-h-screen section-padding-lg flex items-center bg-gradient-to-br from-white to-primary/5 overflow-hidden relative">
      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Illustration - Left side on desktop, top on mobile */}
          <div className="flex-1 order-1 lg:order-1">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/10 rounded-full blur-xl"></div>
              
              <img 
                src="/lovable-uploads/real-names-illustration.png" 
                alt="Person with smartphone showing real contact names like Sarah Johnson, Michael Chen - modern illustration" 
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
            
            <h1 className="heading-xl text-dark mb-4">
              Master 5 New Words a Day. Delivered to You.
            </h1>
            
            <p className="body-text text-dark/80 mb-6 max-w-xl mx-auto lg:mx-0">
              Learn pronunciation, sentiment, meaning, usage, and memory tips — in seconds.
            </p>
            
            <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="group bg-accent hover:bg-accent/90 text-white px-8 py-4 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-lg font-semibold shadow-lg rounded-full" onClick={() => navigate('/onboarding')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button onClick={handleSubscribe} className="group bg-primary hover:bg-primary/90 text-white px-8 py-4 h-auto w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-lg font-semibold shadow-lg rounded-full" disabled={isLoading}>
                {renderPriceDisplay()}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="mt-4 text-center lg:text-left">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-primary hover:text-primary/80 font-medium underline"
                >
                  Log in here
                </button>
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="flex items-center body-text-sm text-gray-600 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>No app download required</span>
              </div>
              <div className="flex items-center body-text-sm text-gray-600 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                <span>Built for busy learners</span>
              </div>
              <div className="flex items-center body-text-sm text-gray-600 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>One word at a time, spaced through your day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;
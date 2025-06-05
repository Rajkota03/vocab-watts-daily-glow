
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingPlanCardProps {
  isPro?: boolean;
  onSubscribe: () => void;
  isProcessing: boolean;
}

export const PricingPlanCard = ({ isPro, onSubscribe, isProcessing }: PricingPlanCardProps) => {
  const navigate = useNavigate();
  const features = [
    "5 vocabulary words daily",
    "WhatsApp delivery",
    "Daily practice quizzes",
    "Example sentences"
  ];

  const proFeatures = [
    "Choose your category",
    "Custom delivery time",
    "Personalized difficulty",
    "Progress tracking",
    "10 vocabulary words daily"
  ];

  const handleSubscribe = () => {
    navigate('/payment', {
      state: {
        plan: {
          isPro,
          price: isPro ? 149 : 0
        }
      }
    });
  };

  return (
    <Card className={`border-2 ${isPro ? 'border-primary shadow-md relative' : 'border-gray-200 shadow-sm hover:shadow-md'} transition-all`}>
      {isPro && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold py-1 px-3 rounded-bl">
          MOST POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{isPro ? 'Pro Plan' : 'Free Trial'}</CardTitle>
        <CardDescription>{isPro ? 'All features unlocked' : 'Try Glintup for 3 days'}</CardDescription>
        <div className="mt-4">
          <div className="text-3xl font-bold">
            {isPro ? (
              <>₹149 <span className="text-sm font-normal text-gray-500">/month</span></>
            ) : '₹0'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {[...features, ...(isPro ? proFeatures : [])].map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${index >= features.length ? 'text-primary' : isPro ? 'text-gray-400' : 'text-primary'}`} />
              <span className={index >= features.length ? 'font-medium' : ''}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubscribe}
          variant={isPro ? "default" : "outline"}
          className="w-full group" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isPro ? (
            <>
              Subscribe Now
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            "Start Free Trial"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

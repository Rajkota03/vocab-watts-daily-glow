import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import EmailSignupForm from './auth/EmailSignupForm';

const PricingSection = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const plans = [
    {
      name: "Free Trial",
      price: "₹0",
      period: "",
      description: "3 days",
      features: [
        "5 words/day",
        "WhatsApp delivery", 
        "Examples & synonyms"
      ],
      buttonText: "Start Free Trial",
      isPrimary: false
    },
    {
      name: "Pro",
      price: "₹149",
      period: "/month",
      description: "Full access",
      features: [
        "5 words/day",
        "WhatsApp delivery",
        "Examples & synonyms",
        "Weekly recap PDF",
        "Sunday quiz & streaks",
        "Category packs (IELTS, Business, Interviews)"
      ],
      buttonText: "Subscribe",
      isPrimary: true,
      badge: "Most Popular"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Unlock your vocabulary potential
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your learning style and start expanding your vocabulary today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-2 transition-all hover:shadow-lg ${plan.isPrimary ? 'border-primary shadow-xl bg-gradient-to-br from-white to-primary/5' : 'border-gray-200 hover:border-primary/30'}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}
              
              {plan.isPrimary && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg -z-10 blur-sm"></div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.isPrimary ? (
                  <Button 
                    onClick={() => navigate('/payment', { state: { plan: { isPro: true, price: 149 } } })}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full"
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-3 rounded-full"
                      >
                        {plan.buttonText}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
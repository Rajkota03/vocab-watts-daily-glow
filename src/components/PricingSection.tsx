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
  const plans = [{
    name: "Monthly Plan",
    price: "₹249",
    period: "/month",
    description: "Simple, no-nonsense pricing",
    features: ["Access to 1000+ curated words", "Personalized delivery schedule", "WhatsApp delivery", "Cancel anytime"],
    buttonText: "Subscribe for ₹249/month",
    isPrimary: true,
    badge: "Includes WhatsApp delivery"
  }];
  return <section className="section-padding bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="heading-lg mb-3">
            Pricing Plans
          </h2>
          <p className="body-text text-gray-600 max-w-2xl mx-auto">
            (Coming soon: ₹1999/year plan — Save 33%)
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {plans.map((plan, index) => <Card key={index} className="relative border-2 transition-all hover:shadow-lg border-primary shadow-xl bg-gradient-to-br from-white to-primary/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium z-10 whitespace-nowrap">
                {plan.badge}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg -z-10 blur-sm"></div>
              
              <CardHeader className="text-center pb-4 pt-10">
                <CardTitle className="heading-md">{plan.name}</CardTitle>
                <CardDescription className="body-text text-gray-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-dark">{plan.price}</span>
                  <span className="body-text text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="body-text text-gray-700">{feature}</span>
                    </li>)}
                </ul>
                
                <Button onClick={() => navigate('/payment', {
              state: {
                plan: {
                  isPro: true,
                  price: 249
                }
              }
            })} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full">
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default PricingSection;
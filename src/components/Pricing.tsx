
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Calendar, Zap, MessageSquare, Tag, BookOpen } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free Trial',
      price: '₹0',
      headline: 'Test drive your daily dose of smartness — no app, no pressure.',
      description: 'Try VUILDER without any commitment',
      features: [
        { text: '5 daily words', icon: BookOpen },
        { text: 'WhatsApp delivery', icon: MessageSquare },
        { text: 'Simple definitions & examples', icon: Tag },
        { text: '3-day access period', icon: Clock },
        { text: 'No credit card required', icon: Zap },
      ],
      notIncluded: [
        { text: 'Category selection', icon: X },
        { text: 'Fun & witty examples', icon: X },
        { text: 'Daily mini-quizzes', icon: X },
        { text: 'Unlimited access', icon: X },
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline',
      color: 'border-vuilder-yellow',
      badgeColor: 'bg-vuilder-yellow'
    },
    {
      name: 'Pro',
      price: '₹149',
      period: 'per month',
      priceYearly: '₹999',
      periodYearly: 'per year',
      headline: 'Personalized word drops, fun usage, and a smarter you. Daily.',
      description: 'The complete vocabulary-building experience',
      features: [
        { text: '5 daily words', icon: BookOpen },
        { text: 'WhatsApp delivery', icon: MessageSquare },
        { text: 'Pick your category/theme', icon: Tag },
        { text: 'Fun & witty usage examples', icon: Zap },
        { text: 'Optional daily mini-quizzes', icon: BookOpen },
        { text: 'Unlimited access while subscribed', icon: Calendar },
        { text: 'Priority support', icon: MessageSquare },
      ],
      notIncluded: [],
      buttonText: 'Go Pro – ₹149/month',
      buttonVariant: 'default',
      popular: true,
      color: 'border-vuilder-mint',
      badgeColor: 'bg-vuilder-mint'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-poppins text-gray-800">Plans & Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-inter">
            No boring word lists. 5 words a day that actually stick. Choose the plan that works for you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card relative bg-white p-8 rounded-xl shadow-md border ${plan.popular ? "border-primary" : "border-gray-200"}`}>
              {plan.popular && (
                <div className={`absolute -top-4 inset-x-0 mx-auto w-max px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium`}>
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 font-poppins text-gray-800">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold font-poppins text-gray-800">{plan.price}</span>
                {plan.period && <span className="text-gray-500">/{plan.period}</span>}
                {plan.priceYearly && (
                  <div className="mt-1 text-sm text-gray-500">
                    or {plan.priceYearly} {plan.periodYearly} (save 44%)
                  </div>
                )}
              </div>
              <p className="text-gray-700 font-medium mb-2 italic">{plan.headline}</p>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <feature.icon className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
                
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-start text-gray-400">
                    <feature.icon className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500">{feature.text}</span>
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Pro only</span>
                  </div>
                ))}
              </div>
              
              {/* TODO: Update onClick to open AuthModal with correct initialPlan */}
              <Button 
                className={`${plan.buttonVariant === "default" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-white border border-primary text-primary hover:bg-primary/10"} w-full`}
                onClick={() => { /* Open AuthModal with plan.name */ }}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

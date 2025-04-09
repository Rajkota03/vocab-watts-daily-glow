
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Get started with basic vocabulary building',
      features: [
        '5 daily words',
        'Basic definitions',
        'Simple examples',
        'WhatsApp delivery',
        'No credit card required'
      ],
      notIncluded: [
        'Themed vocabulary',
        'Witty examples',
        'Quiz links',
        'AI personalization',
        'Progress reports'
      ],
      buttonText: 'Start Free',
      buttonVariant: 'outline'
    },
    {
      name: 'Pro',
      price: '₹149',
      period: 'per month',
      description: 'Perfect for serious vocabulary builders',
      features: [
        '5 daily words',
        'Themed vocabulary sets',
        'Witty & memorable examples',
        'Weekly mini-quizzes',
        'Multiple categories',
        'Priority support'
      ],
      notIncluded: [
        'AI personalization',
        'Progress reports'
      ],
      buttonText: 'Get Pro Access',
      buttonVariant: 'default',
      popular: true
    },
    {
      name: 'Elite',
      price: '₹299',
      period: 'per month',
      description: 'The ultimate vocabulary experience',
      features: [
        'Everything in Pro',
        'AI-personalized word selection',
        'Weekly progress reports',
        'Custom learning paths',
        'Goal-based word selection',
        'Premium support'
      ],
      notIncluded: [],
      buttonText: 'Get Elite Access',
      buttonVariant: 'outline'
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works for you. No hidden fees, cancel anytime.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card relative ${plan.popular ? 'border-vocab-teal' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 mx-auto w-max px-4 py-1 rounded-full bg-vocab-teal text-white text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-whatsapp-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
                
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-start text-gray-400">
                    <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={plan.buttonVariant === 'default' ? 'vocab-btn w-full' : 'vocab-btn-secondary w-full'}
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

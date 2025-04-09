
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from 'lucide-react';

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
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-5 p-3 bg-vocab-teal/10 rounded-full">
            <Sparkles className="w-8 h-8 text-vocab-teal" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-800 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works for you. No hidden fees, cancel anytime.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card relative rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-2 border-vocab-teal transform md:-translate-y-4' : 'border border-gray-100'}`}>
              {plan.popular && (
                <div className="absolute -top-5 inset-x-0 mx-auto w-max px-4 py-2 rounded-full bg-vocab-teal text-white text-sm font-bold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-whatsapp-green mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-start text-gray-400">
                    <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={plan.buttonVariant === 'default' ? 'vocab-btn w-full py-6 text-lg' : 'vocab-btn-secondary w-full py-6 text-lg'}
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

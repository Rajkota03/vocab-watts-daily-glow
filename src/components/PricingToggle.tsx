
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, CheckCircle } from 'lucide-react';

const PricingToggle = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    "5 daily words",
    "WhatsApp delivery",
    "Pick your category/theme",
    "Fun & witty usage examples",
    "Optional daily mini-quizzes",
    "Unlimited access while subscribed",
    "Priority support",
  ];
  
  const freeFeatures = [
    "5 daily words",
    "WhatsApp delivery",
    "Simple definitions & examples",
    "3-day access period",
    "No credit card required",
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No boring word lists. 5 words a day that actually stick.
          </p>
          
          {/* Pricing toggle */}
          <div className="flex items-center justify-center mt-8">
            <button
              className={`px-4 py-2 rounded-l-lg ${
                billingPeriod === 'monthly' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg ${
                billingPeriod === 'yearly' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly <span className="text-xs ml-1">(save 44%)</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border-2 border-gray-100">
            <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">₹0</span>
            </div>
            <p className="text-gray-600 mb-6">Test drive your daily dose of smartness — no app, no pressure.</p>
            
            <div className="space-y-3 mb-8">
              {freeFeatures.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Free Trial
            </Button>
          </div>
          
          {/* Pro plan */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border-2 border-primary relative">
            <div className="absolute -top-4 inset-x-0 mx-auto w-max px-4 py-1 rounded-full bg-primary text-white text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="mb-4">
              {billingPeriod === 'monthly' ? (
                <>
                  <span className="text-3xl font-bold">₹149</span>
                  <span className="text-gray-500">/month</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">₹999</span>
                  <span className="text-gray-500">/year</span>
                </>
              )}
            </div>
            <p className="text-gray-600 mb-6">Personalized word drops, fun usage, and a smarter you. Daily.</p>
            
            <div className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full"
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {billingPeriod === 'monthly' ? 'Go Pro – ₹149/month' : 'Go Pro – ₹999/year'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingToggle;

import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PricingPlans from './PricingPlans';

const PricingToggle = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Unlock Your Vocabulary Potential
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your learning style and start expanding your
            vocabulary today.
          </p>
        </div>

        {/* Toggle Switch */}
        {/* <div className="flex items-center justify-center mb-8">
          <span className="mr-2 text-gray-600">Monthly</span>
          <Switch id="yearly" checked={isYearly} onCheckedChange={setIsYearly} />
          <span className="ml-2 text-gray-600">Yearly (Save 20%)</span>
        </div> */}

        <PricingPlans />
      </div>
    </section>
  );
};

export default PricingToggle;

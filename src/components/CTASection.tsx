
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  // WhatsApp direct link with pre-filled message
  const whatsappLink = "https://wa.me/918978354242?text=JOIN%20GlintUp";

  return (
    <section className="bg-primary/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Start expanding your vocabulary today</h2>
          <p className="text-lg text-gray-700 mb-8">
            Join thousands of learners who have improved their vocabulary with daily words directly on WhatsApp.
          </p>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
              Join on WhatsApp
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <p className="mt-4 text-sm text-gray-600">
            Free 3-day trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

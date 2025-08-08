import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Do I need to download an app?",
      answer: "No — WhatsApp only. We deliver your daily words directly to your existing WhatsApp, so there's no additional app to download or manage."
    },
    {
      question: "What time will I receive my daily words?",
      answer: "Daily at 10:00 AM IST. You'll get your 5 curated words at the same time every day to build a consistent learning habit."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, anytime with one click. There are no long-term commitments, and you can cancel your subscription whenever you want from your account settings."
    },
    {
      question: "Are the same words sent to everyone?",
      answer: "No, personalized by category & history. We tailor your word selection based on your chosen categories and track your learning progress to avoid repetition."
    },
    {
      question: "Is the free trial really free?",
      answer: "Yes, 3 days with no credit card required. Experience the full Glintup service for 3 days completely free, and only provide payment details if you choose to continue."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Glintup
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
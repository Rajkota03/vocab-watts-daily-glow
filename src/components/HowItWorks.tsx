
import React from 'react';
import { CheckCircle2, Smartphone, BookOpen, BrainCircuit } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How VocabSpark Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're prepping for interviews, writing cooler emails, or just want to sound sharp – we've got a word for that.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="feature-icon">
              <BookOpen />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Choose Your Category</h3>
            <p className="text-gray-600">
              Select from professional language, academic vocabulary, creative writing, or general improvement.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Business & Professional</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Academic & Exam Prep</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Creative & Fun</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="feature-icon">
              <Smartphone />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Get Words On WhatsApp</h3>
            <p className="text-gray-600">
              Receive 5 carefully selected words daily to your WhatsApp. No apps to download, no logins to remember.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Daily delivery at your preferred time</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Clean, easy-to-read format</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Zero effort required</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="feature-icon">
              <BrainCircuit />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Get Smarter Every Day</h3>
            <p className="text-gray-600">
              Learn effortlessly through repeated exposure and clever examples that help words stick in your memory.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Build vocabulary without studying</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Witty examples make words memorable</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-2" />
                <span className="text-sm">Track your progress (Pro & Elite)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

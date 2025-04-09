
import React from 'react';
import { CheckCircle2, Smartphone, BookOpen, BrainCircuit, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-5 p-3 bg-vocab-yellow/20 rounded-full">
            <Sparkles className="w-8 h-8 text-vocab-yellow" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-800 tracking-tight">How VocabSpark Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're prepping for interviews, writing cooler emails, or just want to sound sharp – we've got a word for that.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-vocab-teal/10 mb-6">
              <BookOpen className="w-8 h-8 text-vocab-teal" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">1. Choose Your Category</h3>
            <p className="text-gray-600 mb-8">
              Select from professional language, academic vocabulary, creative writing, or general improvement.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Business & Professional</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Academic & Exam Prep</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Creative & Fun</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative">
            <div className="absolute -top-4 -right-4 bg-vocab-teal text-white text-sm font-bold px-4 py-1 rounded-full">
              Zero Effort
            </div>
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-vocab-purple/10 mb-6">
              <Smartphone className="w-8 h-8 text-vocab-purple" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">2. Get Words On WhatsApp</h3>
            <p className="text-gray-600 mb-8">
              Receive 5 carefully selected words daily to your WhatsApp. No apps to download, no logins to remember.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Daily delivery at your preferred time</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Clean, easy-to-read format</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Zero effort required</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-vocab-yellow/20 mb-6">
              <BrainCircuit className="w-8 h-8 text-vocab-yellow" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">3. Get Smarter Every Day</h3>
            <p className="text-gray-600 mb-8">
              Learn effortlessly through repeated exposure and clever examples that help words stick in your memory.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Build vocabulary without studying</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Witty examples make words memorable</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-whatsapp-green mr-3" />
                <span className="text-gray-700">Track your progress (Pro & Elite)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

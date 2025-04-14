
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Volume2 } from 'lucide-react';

const GamePreview = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn Like Playing a Game</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          VocabSpark makes learning new words as engaging as playing your favorite game
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <Card className="border-2 border-[#58CC02] shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-[#58CC02] text-white p-4 text-center">
                <h3 className="text-xl font-bold">Choose the correct meaning</h3>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-4 h-4 rounded-full bg-white mx-1 opacity-100"></div>
                  <div className="w-4 h-4 rounded-full bg-white mx-1 opacity-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white mx-1 opacity-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white mx-1 opacity-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white mx-1 opacity-50"></div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-2xl font-bold">Ephemeral</h4>
                  <Button variant="ghost" size="icon" className="text-[#58CC02]">
                    <Volume2 size={24} />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="border-2 border-[#58CC02] rounded-lg p-4 bg-[#E5F8D4] flex justify-between items-center">
                    <span>Lasting for a very short time</span>
                    <CheckCircle className="text-[#58CC02] h-6 w-6" />
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <span>Extremely large or great</span>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <span>Full of energy and enthusiasm</span>
                  </div>
                  
                  <div className="border-2 border-[#FF4B4B] rounded-lg p-4 bg-[#FFF1F1] flex justify-between items-center">
                    <span>Related to spiritual matters</span>
                    <XCircle className="text-[#FF4B4B] h-6 w-6" />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button className="w-full bg-[#58CC02] hover:bg-[#46a302] text-white">Continue</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <h3 className="text-2xl font-bold mb-4">Fun & Effective Learning</h3>
          <p className="text-gray-600 mb-6">
            With VocabSpark, you'll learn new words through daily WhatsApp messages that feel like playing a quick game.
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-bold mr-3 mt-1">
                1
              </div>
              <p>Words are presented with clear definitions and example sentences</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-bold mr-3 mt-1">
                2
              </div>
              <p>Simple quizzes reinforce your learning without feeling like work</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-bold mr-3 mt-1">
                3
              </div>
              <p>Regular repetition helps words stick in your long-term memory</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#58CC02] flex items-center justify-center text-white font-bold mr-3 mt-1">
                4
              </div>
              <p>Track your progress and watch your vocabulary grow over time</p>
            </li>
          </ul>
          
          <div className="mt-8">
            <Button className="bg-[#7D41E1] hover:bg-[#6b35c7] text-white">
              Start Learning Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePreview;

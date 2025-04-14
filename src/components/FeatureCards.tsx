
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Calendar, Brain, BarChart, MessageSquare, Sparkles, Zap, Flame } from 'lucide-react';

const FeatureCards = () => {
  const features = [
    {
      title: "Daily WhatsApp Messages",
      description: "Receive 5 new vocabulary words daily through simple WhatsApp messages.",
      icon: <Smartphone className="h-12 w-12 text-[#58CC02]" />,
      color: "from-[#E5F8D4] to-[#F8FFF2]",
      animation: "hover:-translate-y-1"
    },
    {
      title: "Effortless Learning",
      description: "No apps to download, no complex interfaces. Just open your messages and learn.",
      icon: <MessageSquare className="h-12 w-12 text-[#FF9600]" />,
      color: "from-[#FFF8E5] to-[#FFFBF2]",
      animation: "hover:-translate-y-1"
    },
    {
      title: "Spaced Repetition",
      description: "Our system ensures you see words at optimal intervals for maximum retention.",
      icon: <Calendar className="h-12 w-12 text-[#FF4B4B]" />,
      color: "from-[#FFE5E5] to-[#FFF5F5]",
      animation: "hover:-translate-y-1"
    },
    {
      title: "Memory Techniques",
      description: "Each word comes with tricks to help it stick in your long-term memory.",
      icon: <Brain className="h-12 w-12 text-[#A560FF]" />,
      color: "from-[#F6E5FF] to-[#FAF5FF]",
      animation: "hover:-translate-y-1"
    },
    {
      title: "Progress Tracking",
      description: "See how your vocabulary grows over time with simple progress visualization.",
      icon: <BarChart className="h-12 w-12 text-[#26C4EC]" />,
      color: "from-[#E5F8FF] to-[#F5FCFF]",
      animation: "hover:-translate-y-1"
    },
    {
      title: "Pro Customization",
      description: "Pro subscribers can choose specialized vocabulary categories tailored to their needs.",
      icon: <Sparkles className="h-12 w-12 text-[#FFC800]" />,
      color: "from-[#FFF8E0] to-[#FFFDF5]",
      animation: "hover:-translate-y-1"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card 
          key={index} 
          className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-none ${feature.animation}`}
        >
          <CardContent className={`p-8 bg-gradient-to-br ${feature.color} relative group`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full -mt-8 -mr-8 transform group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 font-poppins">{feature.title}</h3>
            <p className="text-gray-600 font-inter">{feature.description}</p>
            
            {index === 2 && (
              <div className="absolute bottom-3 right-3">
                <Flame className="h-5 w-5 text-[#FF4B4B]/70 animate-pulse" />
              </div>
            )}
            
            {index === 5 && (
              <div className="absolute bottom-3 right-3">
                <Zap className="h-5 w-5 text-[#FFC800] animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;

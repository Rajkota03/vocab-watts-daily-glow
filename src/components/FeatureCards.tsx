
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Calendar, Brain, BarChart, MessageSquare, Sparkles } from 'lucide-react';

const FeatureCards = () => {
  const features = [
    {
      title: "Daily WhatsApp Messages",
      description: "Receive 5 new vocabulary words daily through simple WhatsApp messages.",
      icon: <Smartphone className="h-12 w-12 text-[#58CC02]" />,
      color: "from-[#E5F8D4] to-[#F8FFF2]"
    },
    {
      title: "Effortless Learning",
      description: "No apps to download, no complex interfaces. Just open your messages and learn.",
      icon: <MessageSquare className="h-12 w-12 text-[#FF9600]" />,
      color: "from-[#FFF8E5] to-[#FFFBF2]"
    },
    {
      title: "Spaced Repetition",
      description: "Our system ensures you see words at optimal intervals for maximum retention.",
      icon: <Calendar className="h-12 w-12 text-[#FF4B4B]" />,
      color: "from-[#FFE5E5] to-[#FFF5F5]"
    },
    {
      title: "Memory Techniques",
      description: "Each word comes with tricks to help it stick in your long-term memory.",
      icon: <Brain className="h-12 w-12 text-[#A560FF]" />,
      color: "from-[#F6E5FF] to-[#FAF5FF]"
    },
    {
      title: "Progress Tracking",
      description: "See how your vocabulary grows over time with simple progress visualization.",
      icon: <BarChart className="h-12 w-12 text-[#26C4EC]" />,
      color: "from-[#E5F8FF] to-[#F5FCFF]"
    },
    {
      title: "Pro Customization",
      description: "Pro subscribers can choose specialized vocabulary categories tailored to their needs.",
      icon: <Sparkles className="h-12 w-12 text-[#FFC800]" />,
      color: "from-[#FFF8E0] to-[#FFFDF5]"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow border-none">
          <CardContent className={`p-8 bg-gradient-to-br ${feature.color}`}>
            <div className="mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;

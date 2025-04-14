
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smartphone, 
  Calendar, 
  Brain, 
  BarChart, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Flame, 
  Dumbbell, 
  BookOpen, 
  CheckCircle
} from 'lucide-react';

const FeatureCards = () => {
  const features = [
    {
      title: "Daily WhatsApp Messages",
      description: "Receive 5 new vocabulary words daily through simple WhatsApp messages.",
      icon: <Smartphone className="h-12 w-12 text-vuilder-mint" />,
      color: "from-vuilder-mint/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "📱"
    },
    {
      title: "Effortless Learning",
      description: "No apps to download, no complex interfaces. Just open your messages and learn.",
      icon: <MessageSquare className="h-12 w-12 text-vuilder-yellow" />,
      color: "from-vuilder-yellow/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "💬"
    },
    {
      title: "Spaced Repetition",
      description: "Our system ensures you see words at optimal intervals for maximum retention.",
      icon: <Calendar className="h-12 w-12 text-vuilder-coral" />,
      color: "from-vuilder-coral/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "🗓️"
    },
    {
      title: "Memory Techniques",
      description: "Each word comes with tricks to help it stick in your long-term memory.",
      icon: <Brain className="h-12 w-12 text-vuilder-indigo" />,
      color: "from-vuilder-indigo/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "🧠"
    },
    {
      title: "Progress Tracking",
      description: "See how your vocabulary grows over time with simple progress visualization.",
      icon: <BarChart className="h-12 w-12 text-vuilder-mint" />,
      color: "from-vuilder-mint/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "📊"
    },
    {
      title: "Build Vocabulary Muscle",
      description: "Strengthen your communication skills with our specially designed word training.",
      icon: <Dumbbell className="h-12 w-12 text-vuilder-indigo" />,
      color: "from-vuilder-indigo/10 to-vuilder-bg",
      animation: "hover:-translate-y-1",
      emoji: "💪"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card 
          key={index} 
          className={`overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 ${feature.animation} rounded-xl`}
        >
          <CardContent className={`p-8 bg-gradient-to-br ${feature.color} relative group h-full`}>
            {/* Emoji decorative element */}
            <div className="absolute top-3 right-3 text-2xl opacity-20">{feature.emoji}</div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/30 rounded-full -mt-8 -mr-8 transform group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
              {feature.icon}
            </div>
            
            <h3 className="text-xl font-bold mb-3 font-poppins text-vuilder-text">{feature.title}</h3>
            <p className="text-gray-600 font-inter">{feature.description}</p>
            
            {index === 2 && (
              <div className="absolute bottom-3 right-3">
                <Flame className="h-5 w-5 text-vuilder-coral/70 animate-pulse" />
              </div>
            )}
            
            {index === 5 && (
              <div className="absolute bottom-3 right-3">
                <Zap className="h-5 w-5 text-vuilder-indigo/70 animate-pulse" />
              </div>
            )}
            
            {/* Pro feature indicator for some cards */}
            {(index === 3 || index === 4) && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-vuilder-mint/20 text-vuilder-mint">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pro
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;

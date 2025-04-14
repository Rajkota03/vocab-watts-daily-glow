
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import SampleWords from '@/components/SampleWords';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import SignupForm from '@/components/SignupForm';
import WhatsAppComparison from '@/components/WhatsAppComparison';
import GamePreview from '@/components/GamePreview';
import FeatureCards from '@/components/FeatureCards';
import LearningProgress from '@/components/LearningProgress';
import { Sparkles, BarChart, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-vuilder-bg font-inter">
      <Navbar />
      
      {/* Main content */}
      <main>
        <HeroSection />
        
        {/* Game-like Preview Section */}
        <section className="py-16 md:py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-vuilder-mint/5 to-vuilder-indigo/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-vuilder-mint/10 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-vuilder-indigo/10 rounded-full transform translate-y-1/2"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center mb-12 text-center">
              <div className="inline-flex items-center mb-4 bg-gradient-to-r from-vuilder-mint/10 to-vuilder-indigo/10 py-2 px-4 rounded-full">
                <span className="text-sm font-medium bg-gradient-to-r from-vuilder-mint to-vuilder-indigo bg-clip-text text-transparent">
                  Try our interactive learning format
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Learn Like You're Playing</h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                VUILDER makes vocabulary building feel like a game, not a chore
              </p>
            </div>
            
            <GamePreview />
          </div>
        </section>
        
        {/* How It Works with enhanced styling */}
        <HowItWorks />
        
        {/* Feature Cards Section */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-vuilder-indigo/5 to-vuilder-mint/5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-vuilder-mint to-vuilder-indigo mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Designed for Your Success</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-inter">
                Thoughtfully crafted features to make vocabulary learning effortless and engaging
              </p>
            </div>
            <FeatureCards />
          </div>
        </section>
        
        {/* Sample Words */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-vuilder-indigo/5 to-vuilder-mint/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-vuilder-yellow/20 rounded-full transform -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-vuilder-mint/10 rounded-full transform translate-y-1/3"></div>
          <div className="container mx-auto px-4 relative z-10">
            <SampleWords />
          </div>
        </section>
        
        {/* Learning Progress Visualization */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-vuilder-mint/5 rounded-full transform -translate-y-1/2"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-vuilder-mint to-vuilder-indigo mb-4">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Watch Your Vocabulary Grow</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-inter">
                Track your learning journey with beautiful visualizations
              </p>
            </div>
            <LearningProgress />
          </div>
        </section>
        
        {/* WhatsApp Preview Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-whatsapp-green/5 to-vuilder-mint/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-whatsapp-green to-vuilder-mint/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <WhatsAppComparison />
          </div>
        </section>
        
        {/* Pricing */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-vuilder-indigo/5 rounded-full transform translate-y-1/3"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Pricing />
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-vuilder-mint/5 to-vuilder-indigo/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vuilder-mint to-vuilder-indigo/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Testimonials />
          </div>
        </section>
        
        {/* Signup Form Section */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-vuilder-mint/5 to-vuilder-indigo/5 rounded-3xl"></div>
            <div className="absolute top-10 left-10 w-20 h-20 bg-vuilder-yellow/10 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-vuilder-mint/10 rounded-full"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border border-gray-100">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-vuilder-mint to-vuilder-indigo mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins">Join VUILDER Today</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto font-inter">
                  Start expanding your vocabulary effortlessly. Get your first words immediately.
                </p>
              </div>
              <SignupForm />
            </div>
          </div>
        </section>
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

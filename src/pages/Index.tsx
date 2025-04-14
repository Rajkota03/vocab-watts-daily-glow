
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

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      {/* Main content */}
      <main>
        <HeroSection />
        
        {/* Game-like Preview Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <GamePreview />
          </div>
        </section>
        
        <HowItWorks />
        
        {/* Feature Cards */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">VocabSpark Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Designed to make vocabulary learning effortless and engaging
              </p>
            </div>
            <FeatureCards />
          </div>
        </section>
        
        <SampleWords />
        
        {/* Learning Progress Visualization */}
        <section className="py-16 bg-gradient-to-r from-vocab-purple/5 to-vocab-teal/5">
          <div className="container mx-auto px-4">
            <LearningProgress />
          </div>
        </section>
        
        {/* WhatsApp Preview Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <WhatsAppComparison />
          </div>
        </section>
        
        <Pricing />
        <Testimonials />
        
        {/* Signup Form Section */}
        <section className="py-16 bg-gradient-to-r from-[#58CC02]/10 to-[#7D41E1]/10 rounded-lg mx-4 md:mx-8 lg:mx-16 my-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join VocabSpark Today</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start expanding your vocabulary effortlessly. Get your first words immediately.
              </p>
            </div>
            <SignupForm />
          </div>
        </section>
        
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

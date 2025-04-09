
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

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Main content */}
      <main>
        <HeroSection />
        <HowItWorks />
        <SampleWords />
        <Pricing />
        <Testimonials />
        
        {/* Signup Form Section */}
        <section className="py-16 bg-gradient-to-r from-vocab-teal/10 to-vocab-purple/10">
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

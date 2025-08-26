
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import SampleWordDrop from '@/components/SampleWordDrop';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { toast } from "@/hooks/use-toast";
import SocialProofBar from '@/components/SocialProofBar';
import PricingSection from '@/components/PricingSection';
import { supabase } from '@/integrations/supabase/client';
import CTASection from '@/components/CTASection';
import FAQ from '@/components/FAQ';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useEmailAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      
      <main>
        <HeroSection />
        
        <SocialProofBar />
        <HowItWorks />
        <SampleWordDrop />
        <PricingSection />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

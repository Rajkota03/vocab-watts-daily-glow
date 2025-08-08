
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import SampleWordDrop from '@/components/SampleWordDrop';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import SocialProofBar from '@/components/SocialProofBar';
import PricingSection from '@/components/PricingSection';
import { supabase } from '@/integrations/supabase/client';
import CTASection from '@/components/CTASection';
import FAQ from '@/components/FAQ';

const Index = () => {
  const navigate = useNavigate();

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


import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import SampleWords from '@/components/SampleWords';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Shield } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import SocialProofBar from '@/components/SocialProofBar';
import PricingToggle from '@/components/PricingToggle';
import { supabase } from '@/integrations/supabase/client';
import CTASection from '@/components/CTASection';

const Index = () => {
  const navigate = useNavigate();
  const assignAdminRole = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to assign admin role",
        variant: "destructive"
      });
      return;
    }

    // Check if the user has the allowed email
    if (session.user.email !== 'rajkota.sql@gmail.com') {
      toast({
        title: "Error",
        description: "You are not authorized to become an admin",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('user_roles').insert({
        user_id: session.user.id,
        role: 'admin'
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Admin role assigned successfully. You can now access the admin dashboard."
      });

      // Redirect to dashboard with parameter to show admin role notification
      navigate('/dashboard?adminAssigned=true');
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign admin role",
        variant: "destructive"
      });
    }
  };

  // WhatsApp direct link with pre-filled message
  const whatsappLink = "https://wa.me/918978354242?text=JOIN%20GlintUp";

  return <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      
      <main>
        <HeroSection />
        <SocialProofBar />
        <HowItWorks />
        <SampleWords />
        <PricingToggle />
        <Testimonials />
        
        {/* Mobile WhatsApp CTA section */}
        <section id="mobile-whatsapp-cta" className="py-16 md:py-24 bg-white lg:hidden">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-center">Start Your Free Trial</h2>
              <img 
                src="/lovable-uploads/abe19db1-a4de-45f3-8a79-3e5ae08951d8.png" 
                alt="WhatsApp Flow" 
                className="rounded-lg shadow-md w-full mb-6"
              />
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full py-6 h-auto flex items-center justify-center">
                  <img src="/lovable-uploads/164886d6-c431-4caf-9f94-f4729aa2698b.png" alt="WhatsApp" className="w-5 h-5 mr-2" />
                  Join on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
        
        <CTASection />
      </main>
      
      <Footer />
    </div>;
};

export default Index;

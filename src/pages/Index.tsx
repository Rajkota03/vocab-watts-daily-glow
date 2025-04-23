
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import SampleWords from '@/components/SampleWords';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import SignupForm from '@/components/SignupForm';
import { Button } from "@/components/ui/button";
import { Shield } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import SocialProofBar from '@/components/SocialProofBar';
import PricingToggle from '@/components/PricingToggle';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  
  const assignAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
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
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: session.user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin role assigned successfully. You can now access the admin dashboard.",
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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={assignAdminRole}
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Shield className="mr-2 h-4 w-4" />
          Assign Admin Role
        </Button>
      </div>
      
      <main>
        <HeroSection />
        <SocialProofBar />
        <HowItWorks />
        <SampleWords />
        <PricingToggle />
        <Testimonials />
        
        {/* Mobile signup form (hidden on desktop) */}
        <section id="mobile-signup" className="py-16 md:py-24 bg-white lg:hidden">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100">
              <SignupForm />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

import React, { useEffect, useState } from 'react';
import UpgradeFlow from '@/components/upgrade/UpgradeFlow';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Upgrade = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getPhoneNumber = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If no user, redirect to onboarding
          navigate('/onboarding');
          return;
        }

        // Try to get phone number from user metadata first
        let phone = user.user_metadata?.whatsapp_number;
        
        // If not in metadata, check subscription
        if (!phone) {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('phone_number')
            .eq('user_id', user.id)
            .single();
          
          phone = subscription?.phone_number;
        }

        if (phone) {
          setPhoneNumber(phone);
        } else {
          // If no phone number found, redirect to onboarding
          navigate('/onboarding');
          return;
        }
      } catch (error) {
        console.error('Error getting user phone number:', error);
        navigate('/onboarding');
      } finally {
        setLoading(false);
      }
    };

    getPhoneNumber();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <UpgradeFlow prefilledPhone={phoneNumber} />;
};

export default Upgrade;
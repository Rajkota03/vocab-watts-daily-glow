import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Mail, Lock, Crown, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRazorpay } from '@/hooks/useRazorpay';

interface UpgradeFlowProps {
  prefilledPhone?: string;
}

const UpgradeFlow: React.FC<UpgradeFlowProps> = ({ prefilledPhone }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const razorpayLoaded = useRazorpay();

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      });
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast({ 
        title: "Weak password", 
        description: "Password must be at least 6 characters long.", 
        variant: "destructive" 
      });
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Payment System Loading",
        description: "Please wait while we initialize the payment system.",
        variant: "default"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order for Pro subscription
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          phoneNumber: prefilledPhone,
          category: 'business', // Default category for Pro
          isPro: true,
          email: email,
          password: password
        }
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderError?.message || orderData?.error || 'Failed to create order');
      }

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'GLINTUP',
        description: 'Vocabulary Pro Subscription',
        order_id: orderData.data.id,
        handler: async function(response: any) {
          try {
            // Complete the upgrade process
            const { data: upgradeData, error: upgradeError } = await supabase.functions.invoke('complete-upgrade', {
              body: {
                phoneNumber: prefilledPhone,
                email: email,
                password: password,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }
            });

            if (upgradeError || !upgradeData?.success) {
              throw new Error('Payment successful but upgrade failed. Please contact support.');
            }

            setSuccess(true);
            toast({
              title: "Upgrade Successful!",
              description: "Welcome to Glintup Pro! You now have access to all premium features.",
            });

            // Navigate to dashboard after short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);

          } catch (error: any) {
            console.error('Error completing upgrade:', error);
            toast({
              title: "Upgrade Error",
              description: error.message || "Payment successful but setup failed. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Feel free to try again.",
            });
          }
        },
        prefill: {
          email: email,
          contact: prefilledPhone
        },
        theme: {
          color: '#3F3D56'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('Error processing upgrade:', error);
      toast({
        title: "Upgrade Error",
        description: error.message || "We couldn't process your upgrade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Pro!</h3>
              <p className="text-gray-600 mb-6">You now have access to all premium features including advanced vocabulary categories and unlimited words.</p>
              <div className="flex items-center justify-center space-x-2 text-primary">
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Taking you to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h2>
            <p className="text-gray-600 text-sm">Get unlimited vocabulary words and premium categories</p>
          </div>

          {/* Pre-filled phone number display */}
          {prefilledPhone && (
            <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">WhatsApp Number</p>
                  <p className="text-sm text-gray-600">{prefilledPhone}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          )}

          {/* Email and password form */}
          <form onSubmit={handleUpgrade} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 text-base border-2 rounded-2xl focus:border-primary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-medium">Create Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-14 text-base border-2 rounded-2xl focus:border-primary"
                />
              </div>
            </div>

            {/* Pro features */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">🚀 What you get with Pro:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Unlimited vocabulary words</li>
                <li>• 7 premium categories</li>
                <li>• Advanced learning insights</li>
                <li>• Priority support</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-medium rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Upgrade Now - ₹799/month
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Secure payment via Razorpay • Cancel anytime • 30-day money-back guarantee
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpgradeFlow;
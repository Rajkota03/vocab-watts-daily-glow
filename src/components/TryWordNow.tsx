import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Send, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TryWordNow = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if it starts with + and has country code, or is just 10 digits
    if (cleaned.startsWith('+')) {
      // International format: +91xxxxxxxxxx (13 chars total)
      return cleaned.length >= 12 && cleaned.length <= 15;
    } else {
      // Local format: 10 digits
      return cleaned.length === 10;
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it doesn't start with + and is 10 digits, add +91
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your WhatsApp number",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid phone number", 
        description: "Please enter with country code (+911234567890) or without (+91 will be added automatically)",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    setIsLoading(true);

    try {
      // Send directly via Meta WhatsApp Business API
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: formattedPhone,
          message: `Hi ${name.trim()},
Here is your requested content:

*Word:* Sample vocabulary word
*Pronunciation:* Sample pronunciation
*Meaning:* Sample meaning
*Example:* Sample example sentence
*Memory Hook:* Sample memory technique

— Glintup`,
          sendImmediately: true
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      toast({
        title: "Word sent! 📨",
        description: "Check your WhatsApp for your vocabulary word",
      });

    } catch (error: any) {
      console.error('Error sending preview word:', error);
      
      if (error.message?.includes('request one preview word per day')) {
        toast({
          title: "Daily limit reached",
          description: "You can only request one preview word per day. Try again tomorrow!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to send word",
          description: "Please check your number and try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToSignup = () => {
    // Store phone number in localStorage for prefilling signup form
    localStorage.setItem('previewPhoneNumber', phoneNumber);
    // Navigate to login/signup page
    window.location.href = '/login';
  };

  if (isSuccess) {
    return (
      <section className="section-padding-compact bg-gradient-to-br from-primary/5 to-accent/5 border-t border-gray-100">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="heading-md mb-2">Word sent! Check your WhatsApp</h3>
            <p className="body-text text-gray-600 mb-6">
              Want to master more vocabulary? Start your free trial and get 3 words daily.
            </p>
            <Button 
              onClick={handleContinueToSignup}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              Start Free Trial
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              7-day free trial • No credit card required
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding-compact bg-gradient-to-br from-primary/5 to-accent/5 border-t border-gray-100">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent mb-3 text-white">
            <Phone className="h-7 w-7" />
          </div>
          <h2 className="heading-lg mb-2">Try a free word now — no signup needed</h2>
          <p className="body-text text-gray-600 max-w-xl mx-auto">
            Enter your name and WhatsApp number to instantly receive a smart vocabulary word.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="space-y-3 mb-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
              disabled={isLoading}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+911234567890 or 1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white h-12 px-6"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <AlertCircle className="h-3 w-3 mr-1" />
              We'll only send one message. No spam.
            </div>
            <p className="text-xs text-gray-400">
              Use +91 country code or enter 10-digit number (we'll add +91 automatically)
            </p>
          </div>
        </form>

        {/* WhatsApp Preview Card */}
        <div className="mt-8 max-w-sm mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#128C7E] text-white p-3 flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold text-sm">G</span>
              </div>
              <div>
                <p className="font-medium text-sm">Glintup</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="bg-[#DCF8C6]/50 p-3 rounded-lg rounded-tl-none">
                <p className="text-xs text-gray-600 mb-2">Example word you'll receive:</p>
                <p className="font-bold text-sm mb-1">Word: eloquent 🟩 (adjective)</p>
                <p className="text-xs mb-1"><strong>Pronunciation:</strong> EL-uh-kwent</p>
                <p className="text-xs mb-1"><strong>Meaning:</strong> fluent or persuasive in speaking or writing</p>
                <p className="text-xs mb-1"><strong>Example:</strong> Her eloquent speech moved the entire audience to tears.</p>
                <p className="text-xs mb-2"><strong>Memory Hook:</strong> Think "ELLA-KWENT" - Ella went and spoke beautifully.</p>
                <p className="text-xs font-medium">— Glintup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TryWordNow;
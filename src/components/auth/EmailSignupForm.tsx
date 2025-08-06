import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2, Mail, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const EmailSignupForm = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName.trim()) {
      toast({ title: "Missing information", description: "Please enter your first name.", variant: "destructive" });
      return;
    }
    if (!lastName.trim()) {
      toast({ title: "Missing information", description: "Please enter your last name.", variant: "destructive" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!whatsappNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(whatsappNumber.replace(/\s+/g, ''))) {
      toast({ title: "Invalid phone number", description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the phone number
      const formattedPhone = whatsappNumber.startsWith('+') ? whatsappNumber : `+${whatsappNumber}`;
      
      // Sign up with Supabase Auth using magic link (passwordless)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            whatsapp_number: formattedPhone,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success state
      setEmailSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email inbox and click the link to complete signup.",
      });

    } catch (error: any) {
      console.error('Error during signup:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (emailSent) {
    return (
      <div className="text-center p-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Check Your Email!</h3>
        <p className="text-gray-600 mb-4">We've sent a magic link to {email}. Click it to complete your signup and start your free trial!</p>
        <Button 
          variant="outline" 
          onClick={() => setEmailSent(false)}
          className="text-sm"
        >
          Use Different Email
        </Button>
      </div>
    );
  }

  // Initial Form
  return (
    <div className="relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Start Your Free Trial</h3>
        <p className="text-gray-600 text-sm">Enter your details and we'll send you a magic link to get started</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              type="text"
              placeholder="Your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* WhatsApp Number */}
        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+91... (with country code)"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">We'll send your daily words to this number</p>
        </div>

        {/* Fixed delivery time notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">📅 Words are delivered daily at 10:00 AM IST</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={cn(
            "w-full font-medium", 
            isSubmitting && "opacity-80"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending Magic Link...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Magic Link
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-2">
          No credit card required. Cancel anytime.
        </p>
      </form>
    </div>
  );
};

export default EmailSignupForm;
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Mail, User, ArrowLeft, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all fields.", 
        variant: "destructive" 
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      });
      return;
    }

    if (password.length < 6) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 6 characters long.", 
        variant: "destructive" 
      });
      return;
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({ 
        title: "Invalid phone number", 
        description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            whatsapp_number: formattedPhone
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Create a free trial subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('create-free-subscription', {
          body: {
            userId: authData.user.id,
            phoneNumber: formattedPhone,
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim()
          }
        });

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          // Don't fail the signup process for subscription errors
        }

        setSuccess(true);
        toast({
          title: "🎉 Welcome to Glintup!",
          description: "Please check your email to verify your account.",
        });

        // Navigate to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

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
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
        {/* Header */}
        <div className="w-full py-4 px-6 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <img 
              src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" 
              alt="Glintup" 
              className="h-8"
            />
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center p-4 pt-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Glintup!</h3>
                <p className="text-gray-600 mb-6">Your account has been created. Please check your email to verify your account.</p>
                <div className="flex items-center justify-center space-x-2 text-primary">
                  <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                  <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <div className="w-full py-4 px-6 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <img 
            src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" 
            alt="Glintup" 
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* Navigation Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h2>
              <p className="text-gray-600 text-sm">Create your account to begin learning</p>
            </div>

            {/* Signup form */}
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-base font-medium">First Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="pl-12 h-12 text-base border-2 rounded-xl focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-base font-medium">Last Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="pl-12 h-12 text-base border-2 rounded-xl focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-12 text-base border-2 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base border-2 rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium">WhatsApp Number</Label>
                <div className="relative mt-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91... (with country code)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="h-12 text-base border-2 rounded-xl focus:border-primary"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">We'll send your vocabulary words to this number</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Start Free Trial"
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                No credit card required • 3 days free • Cancel anytime
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
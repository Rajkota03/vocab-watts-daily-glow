import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const MagicLinkLoginForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send magic link for login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success state
      setEmailSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email inbox and click the link to log in.",
      });

    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        title: "Login failed",
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
        <p className="text-gray-600 mb-4">We've sent a magic link to {email}. Click it to log in!</p>
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

  return (
    <div className="relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Welcome Back</h3>
        <p className="text-gray-600 text-sm">Enter your email to receive a magic link</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
      </form>
    </div>
  );
};

export default MagicLinkLoginForm;
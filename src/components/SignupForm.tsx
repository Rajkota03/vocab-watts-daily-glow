
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2, Send, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('evening');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName.trim()) {
      toast({ title: "Missing information", description: "Please enter your first name.", variant: "destructive" });
      return;
    }
    if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({ title: "Invalid phone number", description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend function to create subscription
      const { data: functionResult, error: functionError } = await supabase.functions.invoke(
        'create-free-subscription',
        {
          body: {
            phoneNumber: phoneNumber.replace(/\s+/g, ''),
            firstName: firstName.trim(),
            deliveryTime: deliveryTime,
          }
        }
      );

      if (functionError) {
        throw new Error(`Failed to invoke subscription function: ${functionError.message}`);
      }

      if (!functionResult?.success) {
        const errorMessage = functionResult?.error || 'Unknown error during subscription creation';
        throw new Error(errorMessage);
      }

      // Show success state
      setSuccess(true);
      toast({
        title: "You're all set!",
        description: "Your free trial has started. Check WhatsApp for your first words!",
      });

      // Reset form after success
      setTimeout(() => {
        setPhoneNumber('');
        setFirstName('');
        setDeliveryTime('evening');
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Something went wrong",
        description: error.message.includes('already has an active subscription')
          ? "This phone number already has an active subscription."
          : "We couldn't process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center p-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Success!</h3>
        <p className="text-gray-600 mb-4">Your free trial is active. Check WhatsApp for your first words!</p>
      </div>
    );
  }

  // Form
  return (
    <div className="relative z-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Start Your Free Trial</h3>
        <p className="text-gray-600 text-sm">Get vocabulary words via WhatsApp for 3 days</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone">WhatsApp Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+91... (with country code)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">We'll send your daily words to this number</p>
        </div>

        {/* Delivery Time */}
        <div>
          <Label htmlFor="deliveryTime">Preferred Time</Label>
          <Select value={deliveryTime} onValueChange={setDeliveryTime}>
            <SelectTrigger id="deliveryTime">
              <SelectValue placeholder="Select delivery time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (7 AM)</SelectItem>
              <SelectItem value="noon">Noon (12 PM)</SelectItem>
              <SelectItem value="evening">Evening (7 PM)</SelectItem>
            </SelectContent>
          </Select>
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
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Start Free Trial
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

export default SignupForm;

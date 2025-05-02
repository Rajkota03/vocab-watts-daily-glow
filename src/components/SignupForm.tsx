import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Use Label component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, Info, Send, Loader2, User, Mail, Phone } from 'lucide-react'; // Added Mail, Phone icons
// Removed unused import: import { sendVocabWords } from '@/services/whatsappService';
import { supabase } from '@/integrations/supabase/client';
// Removed unused imports: import { completeSubscription, checkSubscriptionExists } from '@/services/paymentService';
import { cn } from '@/lib/utils'; // Import cn utility

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('evening'); // Default delivery time
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null); // Use 'any' or a proper User type
  const { toast } = useToast();

  // Simplified session check
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- Input Validations ---
    if (!firstName.trim()) {
      toast({ title: "Missing information", description: "Please enter your first name.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) { // Basic E.164 format check
      toast({ title: "Invalid phone number", description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (step === 2 && !deliveryTime) {
      toast({ title: "Please select a delivery time", description: "Choose when you want to receive your daily words.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting free trial request:", { phoneNumber, firstName, lastName, deliveryTime });

    try {
      // --- Call Backend Function to Create Subscription ---
      console.log("Invoking create-free-subscription function...");
      const { data: functionResult, error: functionError } = await supabase.functions.invoke(
        'create-free-subscription',
        {
          body: {
            phoneNumber: phoneNumber.replace(/\s+/g, ''), // Ensure no spaces
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            deliveryTime: deliveryTime,
            // email: email.trim() // Pass email if the backend function uses it
          }
        }
      );

      if (functionError) {
        console.error("Error invoking create-free-subscription function:", functionError);
        throw new Error(`Failed to invoke subscription function: ${functionError.message}`);
      }

      // Check the response from the function itself
      if (!functionResult?.success) {
        const errorMessage = functionResult?.error || 'Unknown error during subscription creation';
        console.error("Function returned error:", errorMessage);
        toast({
          title: "Subscription Failed",
          description: errorMessage.includes('already has an active subscription')
            ? "This phone number already has an active subscription."
            : `Failed to create subscription: ${errorMessage}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Subscription function executed successfully:", functionResult);

      // --- Show Success State ---
      // Welcome message is now handled by the backend function
      setSuccess(true);
      toast({
        title: "You're all set!",
        description: "Your free trial has started. Check WhatsApp for your first words!",
        variant: "success"
      });

      // Reset form fields after a delay
      setTimeout(() => {
        setPhoneNumber('');
        setEmail('');
        setFirstName('');
        setLastName('');
        setDeliveryTime('evening');
        setStep(1);
        setSuccess(false);
      }, 4000);

    } catch (error: any) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "We couldn't process your request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Success State ---
  if (success) {
    return (
      <div className="text-center p-4 md:p-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your free trial is active. Your first vocabulary words are on their way to WhatsApp!
        </p>
        <Button
          variant="outline" // Use outline for secondary action
          onClick={() => {
            setSuccess(false);
            setStep(1);
            // Fields are reset by the timeout in handleSubmit
          }}
        >
          Start Another Trial
        </Button>
      </div>
    );
  }

  // --- Render Form Steps ---
  return (
    <div className="relative z-10 p-4 md:p-0">
      {/* Header Section */} 
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold mb-2">Get Started with Glintup</h3>
        <div className="inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
          <Clock className="h-4 w-4" />
          <span>3-Day Free Trial</span>
        </div>
      </div>

      {/* Form */} 
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* --- Step 1: User Info --- */} 
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* First Name */} 
            <div>
              <Label htmlFor="firstName" className="mb-1.5">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="pl-10 h-11 md:h-12" // Consistent height
                  aria-label="First Name"
                />
              </div>
            </div>

            {/* Last Name (Optional) */} 
            <div>
              <Label htmlFor="lastName" className="mb-1.5">Last Name <span className="text-gray-500">(Optional)</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 h-11 md:h-12"
                  aria-label="Last Name"
                />
              </div>
            </div>

            {/* Phone Number */} 
            <div>
              <Label htmlFor="phone" className="mb-1.5">WhatsApp Number</Label>
              <div className="relative">
                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91... (with country code)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="pl-10 h-11 md:h-12"
                  aria-label="WhatsApp phone number"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                We need this to send your words. Never shared.
              </p>
            </div>

            {/* Email (Optional) */} 
            <div>
              <Label htmlFor="email" className="mb-1.5">Email <span className="text-gray-500">(Optional)</span></Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 md:h-12"
                  aria-label="Email Address"
                />
              </div>
               <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                Used for account recovery or updates if provided.
              </p>
            </div>

            {/* Continue Button */} 
            <Button
              type="button"
              className="w-full h-11 md:h-12 text-base font-semibold"
              disabled={!phoneNumber || !firstName}
              onClick={() => {
                // Re-validate before proceeding
                if (!firstName.trim()) {
                  toast({ title: "Missing information", description: "Please enter your first name.", variant: "destructive" });
                } else if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
                  toast({ title: "Invalid phone number", description: "Please enter a valid WhatsApp number including country code.", variant: "destructive" });
                } else {
                  setStep(2);
                }
              }}
            >
              Continue
            </Button>

            {/* Terms Text */} 
            <div className="pt-1 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>
        )}

        {/* --- Step 2: Delivery Time --- */} 
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            {/* Delivery Time Select */} 
            <div>
              <Label htmlFor="deliveryTime" className="mb-1.5">Choose Delivery Time</Label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime} required>
                <SelectTrigger id="deliveryTime" className="h-11 md:h-12 text-base">
                  <SelectValue placeholder="Select delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (around 7 AM)</SelectItem>
                  <SelectItem value="noon">Noon (around 12 PM)</SelectItem>
                  <SelectItem value="evening">Evening (around 7 PM)</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                When do you prefer your daily words?
              </p>
              <p className="mt-1 text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                First words sent immediately after signup!
              </p>
            </div>

            {/* Action Buttons */} 
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto flex-1 h-11 md:h-12"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto flex-1 h-11 md:h-12 font-semibold"
                disabled={isSubmitting || !deliveryTime}
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
            </div>

            {/* Trial Info */} 
            <div className="pt-1 text-center">
              <p className="text-sm font-medium text-gray-800 mb-1">3-Day Free Trial</p>
              <p className="text-xs text-gray-600">
                No credit card required. Get daily words via WhatsApp.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SignupForm;


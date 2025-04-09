
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { LockKeyhole, Sparkles, Clock, CheckCircle, Info } from 'lucide-react';

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "You're all set!",
        description: "You'll receive your first words shortly on WhatsApp.",
      });
      setIsSubmitting(false);
      setPhoneNumber('');
      setCategory('');
      setStep(1);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-vocab-purple"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-vocab-teal"></div>
      </div>
      
      {/* Form content */}
      <div className="relative z-10">
        <div className="space-y-2 mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2 font-poppins">Get Started with VocabSpark</h3>
          {isPro ? (
            <div className="flex items-center justify-center gap-2 bg-vocab-purple/10 text-vocab-purple px-3 py-2 rounded-lg">
              <Sparkles className="h-5 w-5" />
              <p className="font-medium">Pro Plan Selection</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-vocab-teal/10 text-vocab-teal px-3 py-2 rounded-lg">
              <Clock className="h-5 w-5" />
              <p className="font-medium">3-Day Free Trial</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5 font-inter">
                  WhatsApp Number
                </label>
                <Input 
                  id="phone"
                  type="tel" 
                  placeholder="+91 your WhatsApp number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="font-inter h-12"
                />
                <p className="mt-1.5 text-xs text-gray-500 flex items-start">
                  <Info className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5" />
                  We'll send daily vocabulary words to this WhatsApp number
                </p>
              </div>
              
              <Button 
                type="button" 
                className="vocab-btn w-full py-6 h-auto text-base"
                disabled={!phoneNumber}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
              
              <div className="pt-2 text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-medium">Plan Selection</h4>
                  <button 
                    type="button" 
                    className="text-xs text-vocab-teal underline"
                    onClick={() => setIsPro(!isPro)}
                  >
                    {isPro ? "Switch to Free Trial" : "Switch to Pro"}
                  </button>
                </div>
                
                <div className={`p-3 rounded-lg border ${isPro ? 'bg-white border-vocab-purple/30' : 'bg-white border-vocab-teal/30'}`}>
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full ${isPro ? 'bg-vocab-purple' : 'bg-vocab-teal'} flex items-center justify-center mt-0.5`}>
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">{isPro ? "Pro Plan" : "Free Trial"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isPro ? "₹149/month after trial" : "3 day free access"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {isPro && (
                <div className="mb-2 animate-fade-in">
                  <label htmlFor="category" className="block text-sm font-medium mb-1.5 font-inter">
                    Preferred Category
                  </label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category" className="h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business & Professional</SelectItem>
                      <SelectItem value="academic">Academic & Exam Prep</SelectItem>
                      <SelectItem value="creative">Creative Writing</SelectItem>
                      <SelectItem value="general">General Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1.5 text-xs text-gray-500 flex items-start">
                    <Sparkles className="h-3.5 w-3.5 mr-1 flex-shrink-0 mt-0.5 text-vocab-purple" />
                    Pro feature: Get words customized to your interests
                  </p>
                </div>
              )}
              
              {!isPro && (
                <div className="mb-2 animate-fade-in">
                  <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <span className="block font-medium text-gray-700">Category selection</span>
                      <span className="text-xs">Available with Pro subscription</span>
                    </div>
                    <button 
                      type="button" 
                      className="ml-auto text-xs bg-vocab-purple/10 text-vocab-purple px-2 py-1 rounded font-medium"
                      onClick={() => setIsPro(true)}
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  className={isPro ? "vocab-btn flex-1" : "vocab-btn-secondary flex-1"}
                  disabled={isSubmitting || (isPro && !category)}
                >
                  {isSubmitting ? 'Processing...' : isPro ? 'Start Pro Subscription' : 'Start Free Trial'}
                </Button>
              </div>
              
              <div className="pt-2">
                {isPro ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 mb-1">₹149/month or ₹999/year</p>
                    <p className="text-xs text-gray-600">
                      Cancel anytime. 7-day money-back guarantee.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 mb-1">3-day free trial</p>
                    <p className="text-xs text-gray-600">
                      No credit card required. 5 words daily for 3 days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupForm;

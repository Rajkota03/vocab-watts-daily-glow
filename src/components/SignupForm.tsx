
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { LockKeyhole, Sparkles } from 'lucide-react';

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto border border-gray-100">
      <div className="space-y-2 mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2 font-poppins">Get Started with VocabSpark</h3>
        {isPro ? (
          <div className="flex items-center justify-center gap-2 bg-vocab-teal/10 text-vocab-teal px-3 py-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
            <p className="font-medium">Pro Plan Selection</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg">
            <p className="font-medium">3-Day Free Trial</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="phone" className="block text-sm font-medium mb-1 font-inter">
            WhatsApp Number
          </label>
          <Input 
            id="phone"
            type="tel" 
            placeholder="+91 your WhatsApp number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="font-inter"
          />
        </div>
        
        {isPro && (
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium mb-1 font-inter">
              Preferred Category
            </label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business & Professional</SelectItem>
                <SelectItem value="academic">Academic & Exam Prep</SelectItem>
                <SelectItem value="creative">Creative Writing</SelectItem>
                <SelectItem value="general">General Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {!isPro && (
          <div className="mb-6">
            <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <LockKeyhole className="h-5 w-5 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="block font-medium text-gray-700">Category selection</span>
                <span className="text-xs">Available with Pro subscription</span>
              </div>
              <button 
                type="button" 
                className="ml-auto text-xs bg-vocab-teal/10 text-vocab-teal px-2 py-1 rounded font-medium"
                onClick={() => setIsPro(true)}
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
        
        <Button 
          type="submit" 
          className={isPro ? "vocab-btn w-full" : "vocab-btn-secondary w-full"}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : isPro ? 'Start Pro Subscription' : 'Start Free Trial'}
        </Button>
        
        <div className="mt-6">
          {isPro ? (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 mb-1">₹149/month or ₹999/year</p>
              <p className="text-xs text-gray-600">
                Cancel anytime. 7-day money-back guarantee.
              </p>
              <button 
                type="button" 
                className="mt-2 text-sm text-vocab-teal underline"
                onClick={() => setIsPro(false)}
              >
                Try the free trial first
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 mb-1">3-day free trial</p>
              <p className="text-xs text-gray-600">
                No credit card required. 5 words daily for 3 days.
              </p>
              <button 
                type="button"
                className="mt-2 text-sm text-vocab-teal underline"
                onClick={() => setIsPro(true)}
              >
                Skip trial, go Pro now
              </button>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
};

export default SignupForm;

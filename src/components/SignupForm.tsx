
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const SignupForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('');
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
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Get Started with VocabSpark</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            WhatsApp Number
          </label>
          <Input 
            id="phone"
            type="tel" 
            placeholder="+91 your WhatsApp number" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium mb-1">
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
        
        <Button type="submit" className="vocab-btn w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Start My Free Trial'}
        </Button>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
          No credit card required.
        </p>
      </form>
    </div>
  );
};

export default SignupForm;

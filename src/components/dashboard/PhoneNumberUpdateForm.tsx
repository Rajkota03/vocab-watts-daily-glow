
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PhoneNumberUpdateFormProps {
  currentPhoneNumber?: string;
  userId: string;
  onUpdate: (newPhoneNumber: string) => void;
}

const PhoneNumberUpdateForm: React.FC<PhoneNumberUpdateFormProps> = ({ 
  currentPhoneNumber, 
  userId,
  onUpdate
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phoneNumber.trim() || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      toast({ 
        title: "Invalid phone number", 
        description: "Please enter a valid WhatsApp number including country code (e.g., +91...).", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`Updating phone number for user ${userId}`);
      
      // Format the phone number to ensure it has a '+' prefix
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // First, check if a subscription exists for this user
      const { data: existingSub, error: checkError, count } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      console.log(`Found ${count} existing subscriptions for user ${userId}`);
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }
      
      // Update or insert into user_subscriptions table
      if (count && count > 0) {
        // Update existing subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            phone_number: formattedPhone
          })
          .eq('user_id', userId);
        
        if (subscriptionError) {
          throw new Error(subscriptionError.message);
        }
        
        console.log(`Updated existing subscription for user ${userId}`);
      } else {
        // Insert new subscription record
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            phone_number: formattedPhone,
            is_pro: false,
            category: 'daily-beginner'
          });
        
        if (subscriptionError) {
          throw new Error(subscriptionError.message);
        }
        
        console.log(`Created new subscription for user ${userId}`);
      }
      
      // Update the whatsapp_number in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ whatsapp_number: formattedPhone })
        .eq('id', userId);
      
      if (profileError) {
        console.warn("Failed to update profile WhatsApp number:", profileError);
        // Continue even if profile update fails, as the subscription update is more important
      } else {
        console.log(`Updated profile WhatsApp number for user ${userId}`);
      }
      
      // Update success state
      setSuccess(true);
      toast({
        title: "Phone number updated",
        description: "Your WhatsApp number has been saved successfully."
      });
      
      // Notify parent component
      onUpdate(formattedPhone);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update your WhatsApp number. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update WhatsApp Number</CardTitle>
        <CardDescription>
          Enter your WhatsApp number to receive daily vocabulary words
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">WhatsApp Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890 (with country code)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              Include your country code (e.g., +91 for India)
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Updated!
              </>
            ) : (
              'Save WhatsApp Number'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhoneNumberUpdateForm;

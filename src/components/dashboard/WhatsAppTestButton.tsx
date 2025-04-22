
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppTestButtonProps {
  category: string;
}

const WhatsAppTestButton: React.FC<WhatsAppTestButtonProps> = ({ category }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestWhatsApp = async () => {
    if (showForm && !phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a WhatsApp phone number to receive the test message.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setDebugInfo(null);
      
      // Format phone number for WhatsApp (ensure it has the country code)
      let formattedNumber = phoneNumber.trim();
      if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
      }
      
      // If it's not already in WhatsApp format, add it
      const whatsappNumber = formattedNumber.startsWith('whatsapp:') 
        ? formattedNumber 
        : `whatsapp:${formattedNumber}`;
      
      console.log(`Testing WhatsApp for number: ${whatsappNumber}, category: ${category}`);
      
      // Call the edge function directly to test sending a WhatsApp message
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: whatsappNumber,
          message: `🌟 *Test Message from VocabSpark* 🌟\n\nThis is a test message from VocabSpark for the "${category}" category. If you're seeing this, WhatsApp integration is working correctly!\n\nThank you for using VocabSpark!`,
          category: category,
          isPro: true
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        setDebugInfo(JSON.stringify({
          error: error,
          timestamp: new Date().toISOString()
        }, null, 2));
        throw error;
      }
      
      console.log('WhatsApp test response:', data);
      
      // Set debug info
      setDebugInfo(JSON.stringify({
        response: data,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      toast({
        title: "WhatsApp test message sent!",
        description: `A test message has been sent to ${phoneNumber}. Check your WhatsApp app.`,
      });
      
      // Reset form
      setShowForm(false);
      
    } catch (error: any) {
      console.error('WhatsApp test error:', error);
      toast({
        title: "WhatsApp Test Failed",
        description: error.message || "An error occurred while testing WhatsApp integration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {showForm ? (
        <div className="flex flex-col space-y-2">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter WhatsApp number (with country code)"
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-vuilder-indigo transition-all duration-300"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleTestWhatsApp}
              variant="default"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all shadow-sm"
              disabled={loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send Test Message"}
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="rounded-full border-gray-300 hover:bg-gray-50"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="default"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full transition-all shadow-sm" 
          disabled={loading}
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {loading ? "Testing WhatsApp..." : "Test WhatsApp Integration"}
        </Button>
      )}
      
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs overflow-x-auto border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium mb-1 text-gray-700">Debug Info:</h4>
          <pre className="whitespace-pre-wrap text-gray-600">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTestButton;

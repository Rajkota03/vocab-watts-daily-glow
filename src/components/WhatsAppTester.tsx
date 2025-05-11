
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendWhatsAppMessage } from "@/services/whatsappService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhatsAppTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  
  const handleSendTest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Valid phone number required",
        description: "Please enter a phone number with country code (e.g., +1234567890)",
        variant: "destructive"
      });
      return;
    }

    if (!message) {
      toast({
        title: "Message required",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const success = await sendWhatsAppMessage({
        phoneNumber,
        message
      });
      
      if (success) {
        toast({
          title: "Message sent successfully",
          description: "Your WhatsApp message has been sent",
          variant: "success"
        });
        
        setResult({
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Error sending WhatsApp message:", err);
      setError(err.message || "Failed to send message");
      
      toast({
        title: "Failed to send message",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">WhatsApp Message Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              Phone Number (with country code)
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include the country code (e.g., +1 for US, +91 for India)
            </p>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Enter your test message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
            />
          </div>
          
          <Button
            onClick={handleSendTest}
            disabled={loading || !phoneNumber || !message}
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
            {loading ? "Sending..." : "Send Test Message"}
          </Button>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && result.success && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Message sent successfully at {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTester;

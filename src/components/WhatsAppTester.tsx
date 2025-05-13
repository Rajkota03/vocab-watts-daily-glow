
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendWhatsAppMessage } from "@/services/whatsappService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const WhatsAppTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [sandboxInfo, setSandboxInfo] = useState<string | null>(null);
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
      setSandboxInfo(null);
      
      const success = await sendWhatsAppMessage({
        phoneNumber,
        message
      });
      
      if (success) {
        toast({
          title: "Message sent successfully",
          description: "Your WhatsApp message has been queued for delivery",
          variant: "default"
        });
        
        setResult({
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Error sending WhatsApp message:", err);
      setError(err.message || "Failed to send message");
      
      // Check for the specific 63016 error code
      if (err.message?.includes('63016') || err.message?.includes('outside the allowed window')) {
        setSandboxInfo(`Important: Error 63016 indicates you need to opt-in to the Twilio WhatsApp sandbox. 
        The recipient (${phoneNumber}) must send "join <your-sandbox-keyword>" to your Twilio WhatsApp number first.`);
      }
      
      toast({
        title: "Failed to send message",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
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
                className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                <AlertTitle>Failed to send message</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {sandboxInfo && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-800" />
                <AlertTitle className="text-amber-800">Sandbox Opt-In Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {sandboxInfo}
                </AlertDescription>
              </Alert>
            )}
            
            {result && result.success && (
              <Alert className="bg-green-50 border-green-200">
                <div className="text-sm text-green-800">
                  ✓ Message sent successfully at {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-2">Important Information for Twilio WhatsApp</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><strong>Sandbox Testing:</strong> If using Twilio's Sandbox, recipients must first send "join &lt;your-sandbox-code&gt;" to your Twilio WhatsApp number.</li>
              <li><strong>Production Setup:</strong> For production, you need to request WhatsApp Business API access and have an approved template.</li>
              <li><strong>24-Hour Window:</strong> You can only send messages to users who messaged you within the last 24 hours, unless using approved templates.</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-sm mb-2">Common Issues</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">Error 63016</Badge>
                <span className="text-sm">Recipient hasn't opted in or 24-hour window expired</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">Error 21211</Badge>
                <span className="text-sm">Invalid phone number format</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">Error 20003</Badge>
                <span className="text-sm">Authentication failure (check credentials)</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs text-gray-500">Need help?</span>
            <a 
              href="https://www.twilio.com/docs/whatsapp/tutorial" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              Twilio WhatsApp Documentation
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhatsAppTester;

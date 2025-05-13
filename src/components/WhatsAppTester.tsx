import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, AlertCircle, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendWhatsAppMessage, isUSPhoneNumber } from "@/services/whatsappService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Default template ID - using the one provided
const DEFAULT_TEMPLATE_ID = "HXabe0b61588dacdb93c6f458288896582";

const WhatsAppTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({
    name: '',
    otp: '',
    expiryMinutes: '10'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [sandboxInfo, setSandboxInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('regular'); // Default to regular direct messages
  const [useTemplate, setUseTemplate] = useState(false); // Default to false - direct messages
  const [forceDirectMessage, setForceDirectMessage] = useState(true); // Default to true - always force direct messages
  const [isUSNumberState, setIsUSNumberState] = useState(false);
  const { toast } = useToast();
  
  // Default template IDs that can be used
  const [defaultTemplates, setDefaultTemplates] = useState<{id: string, name: string, description: string}[]>([
    {
      id: DEFAULT_TEMPLATE_ID,
      name: 'OTP Template',
      description: 'Send verification code'
    }
  ]);
  
  useEffect(() => {
    // Set the template ID from environment or use the default one
    const envTemplateId = import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE_SID;
    if (envTemplateId) {
      setTemplateId(envTemplateId);
    } else {
      // Use the hardcoded default if no env variable
      console.log("Using default template ID:", DEFAULT_TEMPLATE_ID);
    }
    
    // Attempt to load template IDs from Supabase
    const loadTemplateIds = async () => {
      try {
        // This could be expanded to fetch template IDs from your database
        console.log("Loading available WhatsApp templates...");
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };
    
    loadTemplateIds();
  }, []);

  // Check if phone number is US-based whenever it changes
  useEffect(() => {
    if (phoneNumber) {
      const isUS = isUSPhoneNumber(phoneNumber);
      setIsUSNumberState(isUS);
      
      // If it's a US number after April 1, 2025, we should show a warning
      if (isUS) {
        const currentDate = new Date();
        const aprilFirstDate = new Date(2025, 3, 1); // Note: Month is 0-indexed, so 3 = April
        
        if (currentDate >= aprilFirstDate && useTemplate) {
          setSandboxInfo("This appears to be a US number. Due to WhatsApp policy changes after April 1, 2025, template messages cannot be sent to US numbers. The system will automatically use direct messaging instead.");
        } else {
          setSandboxInfo(null);
        }
      } else {
        setSandboxInfo(null);
      }
    }
  }, [phoneNumber, useTemplate]);

  const handleSendTest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Valid phone number required",
        description: "Please enter a phone number with country code (e.g., +1234567890)",
        variant: "destructive"
      });
      return;
    }

    // Regular message tab requires a message
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
      
      const requestPayload: any = {
        phoneNumber,
        message: message || "This is a test message from GlintUp",
        forceDirectMessage: true // Always use direct messaging
      };
      
      // Check if this is a US number
      const isUSNumber = isUSPhoneNumber(phoneNumber);
      if (isUSNumber) {
        console.log("Detected US phone number. Using direct messaging.");
      }
      
      // Only add template if explicitly chosen and not forcing direct message
      if (activeTab === 'template' && useTemplate && !forceDirectMessage) {
        requestPayload.templateId = templateId;
        requestPayload.templateValues = templateValues;
        console.log("Adding template as fallback:", templateId);
      } else {
        console.log("Using direct message mode only");
      }
      
      const success = await sendWhatsAppMessage(requestPayload);
      
      if (success) {
        toast({
          title: "Message sent successfully",
          description: "Your WhatsApp message has been queued for delivery",
          variant: "default"
        });
        
        setResult({
          success: true,
          timestamp: new Date().toISOString(),
          messageType: 'regular' // Always mark as regular for user clarity
        });
      }
    } catch (err: any) {
      console.error("Error sending WhatsApp message:", err);
      setError(err.message || "Failed to send message");
      
      toast({
        title: "Failed to send message",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setTemplateValues({...templateValues, otp});
    return otp;
  };
  
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">WhatsApp Message Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="regular">Direct Message</TabsTrigger>
              <TabsTrigger value="template">
                Template Message
                <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700 text-xs">
                  Not Recommended
                </Badge>
              </TabsTrigger>
            </TabsList>
            
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
                
                {isUSNumberState && (
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">US Number Detected</Badge>
                    <p className="text-xs text-blue-600 mt-1">
                      Using direct messaging for better delivery
                    </p>
                  </div>
                )}
              </div>
              
              {/* Added Direct Message Alert */}
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Direct Messaging Enabled</AlertTitle>
                <AlertDescription className="text-green-700">
                  <p>Messages will be sent as direct WhatsApp messages for better delivery rates.</p>
                  <p className="text-sm mt-2">This bypasses template restrictions and improves delivery reliability.</p>
                </AlertDescription>
              </Alert>
              
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

              {/* Template tab content - now discouraged */}
              <TabsContent value="template" className="mt-0">
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-800" />
                    <AlertTitle className="text-amber-800">Template Limitations</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      <p>Template messaging has limitations and may result in delivery issues.</p>
                      <p className="text-sm mt-2">We now recommend using direct messaging for all numbers for better reliability.</p>
                    </AlertDescription>
                  </Alert>

                  {/* Keep template fields for reference but with disabled styling */}
                  <div className="opacity-50">
                    <label htmlFor="templateId" className="block text-sm font-medium mb-1">
                      Template ID (Not Recommended)
                    </label>
                    <Input
                      id="templateId"
                      placeholder="HXxxxx"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full"
                      disabled={true}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
            
            <Button
              onClick={handleSendTest}
              disabled={loading || !phoneNumber || !message}
              className="w-full mt-4"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              {loading ? "Sending..." : "Send Direct Message"}
            </Button>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to send message</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {sandboxInfo && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 mt-4">
                <AlertCircle className="h-4 w-4 text-amber-800" />
                <AlertTitle className="text-amber-800">Message Delivery Info</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {sandboxInfo}
                </AlertDescription>
              </Alert>
            )}
            
            {result && result.success && (
              <Alert className="bg-green-50 border-green-200 mt-4">
                <div className="text-sm text-green-800">
                  ✓ {result.messageType === 'template' ? 'Template message' : 'Message'} sent successfully at {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </Alert>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-2">WhatsApp Business API (Using Direct Messages)</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><strong>Direct Messaging:</strong> Now using direct messages for all numbers for better delivery reliability.</li>
              <li><strong>Business API:</strong> Your upgraded Twilio account supports direct messaging outside the 24-hour window.</li>
              <li><strong>Bypassing Templates:</strong> This approach avoids template restrictions and simplifies message sending.</li>
              <li><strong>Message Format:</strong> You can send any message content you design in the app.</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-sm mb-2">Best Practices</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal bg-green-50 text-green-700">Recommended</Badge>
                <span className="text-sm">Use direct messages with clear, concise content</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal">Tip</Badge>
                <span className="text-sm">Keep messages professional and avoid spam-like content</span>
              </div>
              <Alert className="mt-2 py-2 px-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your app now sends messages using direct messaging with your upgraded Twilio WhatsApp Business account.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs text-gray-500">Need help?</span>
            <a 
              href="https://www.twilio.com/docs/whatsapp/api" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              Twilio WhatsApp Business API Guide
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhatsAppTester;

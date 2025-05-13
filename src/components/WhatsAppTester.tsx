import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, AlertCircle, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sendWhatsAppMessage } from "@/services/whatsappService";
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
  const [activeTab, setActiveTab] = useState('template'); // Default to template
  const [useTemplate, setUseTemplate] = useState(true); // Default to true
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

  const handleSendTest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Valid phone number required",
        description: "Please enter a phone number with country code (e.g., +1234567890)",
        variant: "destructive"
      });
      return;
    }

    // Always require template for template tab
    if (activeTab === 'template' && !templateId) {
      toast({
        title: "Template ID required",
        description: "Please enter a template ID to use template messaging",
        variant: "destructive"
      });
      return;
    }

    // Regular message tab requires a message
    if (activeTab === 'regular' && !message) {
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
        phoneNumber
      };
      
      // Determine whether to use template or regular message based on active tab
      if (activeTab === 'template') {
        requestPayload.templateId = templateId;
        requestPayload.templateValues = templateValues;
        console.log("Using template mode with ID:", templateId);
        
        // Include fallback message in case template fails
        requestPayload.message = "This is a fallback message if template fails";
      } else {
        // Regular message mode
        requestPayload.message = message;
        console.log("Using regular message mode");
      }
      
      const success = await sendWhatsAppMessage(requestPayload);
      
      if (success) {
        toast({
          title: `${activeTab === 'template' ? 'Template message' : 'Message'} sent successfully`,
          description: "Your WhatsApp message has been queued for delivery",
          variant: "default"
        });
        
        setResult({
          success: true,
          timestamp: new Date().toISOString(),
          messageType: activeTab === 'template' ? 'template' : 'regular'
        });
      }
    } catch (err: any) {
      console.error("Error sending WhatsApp message:", err);
      setError(err.message || "Failed to send message");
      
      // Adjust error messaging for upgraded Twilio account
      if (err.message?.includes('63016')) {
        setSandboxInfo(`Error 63016 indicates a messaging issue. Since you're on a upgraded Twilio account, check that:
        1. Your WhatsApp Business Profile is properly set up
        2. The template being used is approved
        3. The recipient's number is properly formatted with country code`);
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
              <TabsTrigger value="regular">Regular Message</TabsTrigger>
              <TabsTrigger value="template">
                Template Message
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs">Recommended</Badge>
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
              </div>
              
              <TabsContent value="regular" className="mt-0">
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
                
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-800" />
                  <AlertTitle className="text-amber-800">Regular Message</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p>Regular messages can be sent with your upgraded Twilio account but are subject to WhatsApp's 24-hour messaging window limitations.</p>
                    <p className="mt-2 text-sm">Using templates is recommended for most business communications.</p>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="template" className="mt-0">
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-800" />
                    <AlertTitle className="text-blue-800">Using Templates</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      <p>Templates allow you to send WhatsApp messages outside the 24-hour messaging window.</p>
                      <p className="text-sm mt-2">Your upgraded Twilio account is configured for template messaging.</p>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label htmlFor="templateId" className="block text-sm font-medium mb-1">
                      Template ID (Content SID)
                    </label>
                    <Input
                      id="templateId"
                      placeholder="HXxxxx"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Currently using template: {templateId || "None"}
                    </p>
                  </div>
                  
                  {defaultTemplates.length > 0 && defaultTemplates[0].id && (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500">Quick Templates</Label>
                      <div className="flex gap-2 flex-wrap">
                        {defaultTemplates.map(template => (
                          <Button 
                            key={template.id} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTemplateId(template.id)}
                            className={templateId === template.id ? "border-primary bg-primary/10" : ""}
                          >
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="template-values">
                      <AccordionTrigger>Template Values</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name-var">Name</Label>
                              <Input
                                id="name-var"
                                value={templateValues.name}
                                onChange={(e) => setTemplateValues({...templateValues, name: e.target.value})}
                                placeholder="User's name"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="otp-var">OTP Code</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="otp-var"
                                  value={templateValues.otp}
                                  onChange={(e) => setTemplateValues({...templateValues, otp: e.target.value})}
                                  placeholder="123456"
                                />
                                <Button 
                                  variant="outline" 
                                  onClick={() => generateRandomOtp()}
                                  type="button"
                                  size="icon"
                                >
                                  🎲
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="expiry-var">Expiry (minutes)</Label>
                            <Input
                              id="expiry-var"
                              value={templateValues.expiryMinutes}
                              onChange={(e) => setTemplateValues({...templateValues, expiryMinutes: e.target.value})}
                              placeholder="10"
                            />
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Add any values your template requires. The available values depend on your approved template.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
            </div>
            
            <Button
              onClick={handleSendTest}
              disabled={loading || 
                !phoneNumber || 
                (activeTab === 'regular' && !message) || 
                (activeTab === 'template' && !templateId)}
              className="w-full mt-4"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              {loading ? "Sending..." : `Send ${activeTab === 'template' ? 'Template' : ''} Message`}
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
                <AlertTitle className="text-amber-800">Message Delivery Issue</AlertTitle>
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
            <h3 className="font-medium text-sm mb-2">WhatsApp Business API (Production)</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><strong>Business API:</strong> Full features without sandbox limitations, which you're currently using.</li>
              <li><strong>Message Templates:</strong> Pre-approved messages that can be sent outside the 24-hour messaging window.</li>
              <li><strong>Direct Messages:</strong> Can only be sent within 24 hours of the last customer message.</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-sm mb-2">Best Practices</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal bg-green-50 text-green-700">Recommended</Badge>
                <span className="text-sm">Use pre-approved message templates for most communications</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal">Option 2</Badge>
                <span className="text-sm">Use direct messages only when responding to customer queries within 24 hours</span>
              </div>
              <Alert className="mt-2 py-2 px-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your app sends messages to registered users using your upgraded Twilio WhatsApp Business account.
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

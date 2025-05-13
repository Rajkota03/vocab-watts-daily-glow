
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

const WhatsAppTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({
    name: '',
    otp: '',
    expiryMinutes: '10'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [sandboxInfo, setSandboxInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('regular');
  const [useTemplate, setUseTemplate] = useState(false);
  const { toast } = useToast();
  
  // Default template IDs that can be used
  const [defaultTemplates, setDefaultTemplates] = useState<{id: string, name: string, description: string}[]>([
    {
      id: import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE_SID || '',
      name: 'OTP Template',
      description: 'Send verification code'
    }
  ]);
  
  useEffect(() => {
    // If we have a template ID in the environment, set it as default
    if (import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE_SID) {
      setTemplateId(import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE_SID);
    }
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

    if (activeTab === 'regular' && !message) {
      toast({
        title: "Message required",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'template' && !templateId) {
      toast({
        title: "Template ID required",
        description: "Please enter a template ID",
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
      
      if (activeTab === 'regular') {
        requestPayload.message = message;
      } else {
        requestPayload.templateId = templateId;
        requestPayload.templateValues = templateValues;
        // If no message for template fallback, set a default
        requestPayload.message = "This is a fallback message if template fails";
      }
      
      const success = await sendWhatsAppMessage(requestPayload);
      
      if (success) {
        toast({
          title: `Message ${activeTab === 'template' ? 'template ' : ''}sent successfully`,
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
      
      // Check for the specific 63016 error code
      if (err.message?.includes('63016') || err.message?.includes('outside the allowed window')) {
        setSandboxInfo(`Important: Error 63016 indicates you need to opt-in to the Twilio WhatsApp sandbox. 
        The recipient (${phoneNumber}) must send "join <your-sandbox-keyword>" to your Twilio WhatsApp number first.
        
        Alternatively, you can use a message template to bypass this requirement.`);
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
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs">Bypasses Opt-In</Badge>
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
                  <AlertTitle className="text-amber-800">Sandbox Limitations</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p>When using Twilio's sandbox, recipients must opt in by sending "join &lt;your-sandbox-keyword&gt;" to your Twilio WhatsApp number first.</p>
                    <p className="mt-2 text-sm">Switch to the Template tab to bypass this restriction.</p>
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="template" className="mt-0">
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-800" />
                    <AlertTitle className="text-blue-800">About Templates</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      <p>Templates allow you to send WhatsApp messages without requiring user opt-in first.</p>
                      <p className="text-sm mt-2">You must create and approve templates in your Twilio console first.</p>
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
                <AlertTitle className="text-amber-800">Sandbox Opt-In Required</AlertTitle>
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
            <h3 className="font-medium text-sm mb-2">WhatsApp Business API vs. Sandbox</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><strong>Sandbox (Testing Only):</strong> Limited features and requires opt-in unless templates are used.</li>
              <li><strong>Business API (Production):</strong> Full features without sandbox limitations, but requires application approval.</li>
              <li><strong>Message Templates:</strong> Pre-approved messages that can be sent without recipient opt-in.</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-sm mb-2">Bypassing Opt-In Requirements</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal bg-green-50 text-green-700">Option 1</Badge>
                <span className="text-sm">Use pre-approved message templates (recommended for your app)</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal">Option 2</Badge>
                <span className="text-sm">Get approved for WhatsApp Business API (requires business verification)</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal">Option 3</Badge>
                <span className="text-sm">Have recipients opt-in by sending a message to your Twilio number first</span>
              </div>
              <Alert className="mt-2 py-2 px-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  For your app which sends messages to registered users, Option 1 (templates) is recommended during development.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs text-gray-500">Need help?</span>
            <a 
              href="https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              Twilio WhatsApp Templates Guide
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhatsAppTester;

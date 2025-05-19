
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, AlertCircle, ExternalLink, Info, CheckCircle2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPhoneNumber, sendWhatsAppMessage, getAvailableTemplates } from "@/services/aisensyService";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  status: string;
  description?: string;
  variables?: string[];
}

const AiSensyTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setError(null);
      
      const fetchedTemplates = await getAvailableTemplates();
      
      setTemplates(fetchedTemplates || []);
      console.log("Fetched templates:", fetchedTemplates);
      
      if (fetchedTemplates?.length > 0) {
        toast({
          title: "Templates loaded",
          description: `Loaded ${fetchedTemplates.length} templates from AiSensy`,
        });
      }
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(`Failed to load templates: ${err.message}`);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Find the template to get its variables
    const template = templates.find(t => t.id === templateId);
    if (template?.variables) {
      // Initialize variable fields
      const initialVars: Record<string, string> = {};
      template.variables.forEach(v => {
        initialVars[v] = '';
      });
      setTemplateVariables(initialVars);
    } else {
      setTemplateVariables({});
    }
  };

  const handleUpdateVariable = (name: string, value: string) => {
    setTemplateVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendTest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Valid phone number required",
        description: "Please enter a phone number with country code (e.g., +1234567890)",
        variant: "destructive"
      });
      return;
    }

    // Either a message or a selected template is required
    if (!message && !selectedTemplate) {
      toast({
        title: "Message or template required",
        description: "Please enter a message or select a template to send",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const requestPayload: any = {
        phoneNumber: formatPhoneNumber(phoneNumber)
      };
      
      // If using a template, include template info
      if (selectedTemplate) {
        const template = templates.find(t => t.id === selectedTemplate);
        requestPayload.templateName = template?.name;
        requestPayload.templateParams = templateVariables;
      } else {
        // Otherwise use direct message
        requestPayload.message = message;
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
          messageType: selectedTemplate ? 'template' : 'direct'
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
  
  const handleVerifyConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { 
          checkConfig: true,
          provider: "aisensy"
        }
      });

      if (error) {
        throw new Error(`Error checking config: ${error.message}`);
      }

      if (data.success) {
        toast({
          title: "AiSensy Configuration Valid",
          description: "Your AiSensy credentials are properly configured",
          variant: "default"
        });
      } else {
        setError(`Configuration incomplete: ${JSON.stringify(data.configStatus)}`);
        toast({
          title: "Configuration Incomplete",
          description: "AiSensy credentials are missing or invalid",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">AiSensy WhatsApp Tester</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleVerifyConfig}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Verify Config
          </Button>
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
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Select Message Type</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchTemplates}
                  disabled={loadingTemplates}
                >
                  {loadingTemplates ? 
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 
                    <RefreshCcw className="h-3 w-3 mr-1" />
                  }
                  Refresh Templates
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="directMessage"
                      name="messageType"
                      checked={!selectedTemplate}
                      onChange={() => setSelectedTemplate('')}
                      className="mr-2"
                    />
                    <label htmlFor="directMessage" className="text-sm">Direct Message</label>
                  </div>
                  
                  {!selectedTemplate && (
                    <textarea
                      placeholder="Enter your text message here"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={!!selectedTemplate || loading}
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="templateMessage"
                      name="messageType"
                      checked={!!selectedTemplate}
                      onChange={() => setSelectedTemplate(templates[0]?.id || '')}
                      className="mr-2"
                    />
                    <label htmlFor="templateMessage" className="text-sm">Template Message</label>
                  </div>
                  
                  {!!selectedTemplate && (
                    <div className="space-y-4 border rounded-md p-3">
                      <Select 
                        value={selectedTemplate} 
                        onValueChange={handleSelectTemplate}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} 
                              <Badge 
                                variant={template.status === 'APPROVED' ? 'default' : 'outline'}
                                className="ml-2"
                              >
                                {template.status}
                              </Badge>
                            </SelectItem>
                          ))}
                          {templates.length === 0 && (
                            <SelectItem value="none" disabled>
                              No templates available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      {/* Template Variables */}
                      {Object.keys(templateVariables).length > 0 && (
                        <div className="space-y-3 mt-2">
                          <h4 className="text-sm font-medium">Template Variables</h4>
                          {Object.keys(templateVariables).map(varName => (
                            <div key={varName}>
                              <label className="text-xs text-gray-700 mb-1 block">{varName}</label>
                              <Input 
                                value={templateVariables[varName]}
                                onChange={(e) => handleUpdateVariable(varName, e.target.value)}
                                placeholder={`Enter ${varName}`}
                                disabled={loading}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleSendTest}
              disabled={loading || !phoneNumber || (!message && !selectedTemplate)}
              className="w-full mt-4"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              {loading ? "Sending..." : "Send WhatsApp Message"}
            </Button>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to send message</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {result && result.success && (
              <Alert className="bg-green-50 border-green-200 mt-4">
                <div className="text-sm text-green-800">
                  ✓ Message sent successfully at {new Date(result.timestamp).toLocaleTimeString()} using {result.messageType} messaging
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AiSensy Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-2">AiSensy WhatsApp Business API</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><strong>Direct Messaging:</strong> Send custom content without template restrictions</li>
              <li><strong>Template Messaging:</strong> Use pre-approved templates for better delivery rates</li>
              <li><strong>Business API:</strong> Full access to WhatsApp Business features</li>
              <li><strong>Message Format:</strong> Support for text, media, and interactive messages</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-sm mb-2">Best Practices</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal bg-green-50 text-green-700">Recommended</Badge>
                <span className="text-sm">Use templates for initial messages to users</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1 font-normal">Tip</Badge>
                <span className="text-sm">Templates have higher delivery rates and can be sent anytime</span>
              </div>
              <Alert className="mt-2 py-2 px-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your app now uses AiSensy for WhatsApp messaging with better control and delivery rates.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs text-gray-500">Need help?</span>
            <a 
              href="https://aisensy.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              AiSensy Documentation
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export { AiSensyTester };
export default AiSensyTester;

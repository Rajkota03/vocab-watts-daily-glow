import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, Copy, Webhook, MessageSquare, Settings, Database, TestTube2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
interface WhatsAppConfig {
  token: string;
  phone_number_id: string;
  verify_token: string;
  waba_id?: string;
  display_name?: string;
  display_status?: 'pending' | 'approved' | 'rejected';
  display_status_reason?: string;
}
interface Template {
  name: string;
  category: 'utility' | 'marketing';
  language: string;
  status: 'submitted' | 'approved' | 'rejected';
  body_text: string;
  example_params?: string[];
}
interface Message {
  id: string;
  direction: 'in' | 'out';
  to?: string;
  from?: string;
  body?: string;
  template_name?: string;
  status?: string;
  timestamp: string;
}
const WhatsAppSetup = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WhatsAppConfig>({
    token: '',
    phone_number_id: '',
    verify_token: Math.random().toString(36).substring(2, 15)
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [displayNameSubmitted, setDisplayNameSubmitted] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    category: 'utility',
    language: 'en_US'
  });
  const [testMessage, setTestMessage] = useState({
    to: '',
    body: ''
  });
  const [templateMessage, setTemplateMessage] = useState({
    to: '',
    template: '',
    params: ['']
  });

  // Load existing configuration on mount and generate random verify token if needed
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const {
          data
        } = await supabase.functions.invoke('whatsapp-config', {
          body: {
            action: 'get_config'
          }
        });
        if (data?.config) {
          setConfig({
            token: data.config.token || '',
            phone_number_id: data.config.phone_number_id || '',
            verify_token: data.config.verify_token || '',
            display_name: data.config.display_name || 'Glintup by Squareblue Media',
            display_status: data.config.display_status || undefined,
            display_status_reason: data.config.display_status_reason || undefined
          });
          setIsConfigured(true);
          if (data.config.display_name) {
            setDisplayNameSubmitted(true);
          }
        } else {
          // Generate random verify token for new setup
          const randomToken = Math.random().toString(36).substring(2, 15);
          setConfig(prev => ({
            ...prev,
            verify_token: randomToken
          }));
        }
      } catch (error) {
        console.error('Error loading config:', error);
        // Fallback: generate random token
        const randomToken = Math.random().toString(36).substring(2, 15);
        setConfig(prev => ({
          ...prev,
          verify_token: randomToken
        }));
      }
    };
    loadConfig();
  }, []);

  // Polling for display name status
  useEffect(() => {
    if (config.display_status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const {
            data
          } = await supabase.functions.invoke('whatsapp-config', {
            body: {
              action: 'get_display_name_status'
            }
          });
          if (data?.status !== 'pending') {
            setConfig(prev => ({
              ...prev,
              display_status: data.status,
              display_status_reason: data.reason
            }));
          }
        } catch (error) {
          console.error('Error polling display name status:', error);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [config.display_status]);
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-config', {
        body: {
          action: 'save_config',
          token: config.token,
          phone_number_id: config.phone_number_id,
          verify_token: config.verify_token
        }
      });
      if (error) throw error;
      if (data?.ok) {
        setIsConnected(true);
        setConfig(prev => ({
          ...prev,
          waba_id: data.waba_id
        }));
        toast.success('WhatsApp configuration saved successfully!');
      } else {
        throw new Error(data?.error || 'Failed to save configuration');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
    }
    setLoading(false);
  };
  const handleSubmitDisplayName = async () => {
    if (!config.display_name) return;
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-config', {
        body: {
          action: 'submit_display_name',
          display_name: config.display_name
        }
      });
      if (error) throw error;
      setConfig(prev => ({
        ...prev,
        display_status: 'pending'
      }));
      toast.success('Display name submitted for approval!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit display name');
    }
    setLoading(false);
  };
  const handleCreateTemplate = async () => {
    // Validate required fields
    if (!newTemplate.name?.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!newTemplate.body_text?.trim()) {
      toast.error('Template body text is required');
      return;
    }

    setLoading(true);
    try {
        console.log('Creating template with payload:', newTemplate);
        
        const { data, error } = await supabase.functions.invoke('whatsapp-send', {
          body: {
            action: 'send_template',
            create_template: true,
            name: newTemplate.name,
            category: newTemplate.category,
            language: newTemplate.language,
            body_text: newTemplate.body_text
          }
        });
      if (error) throw error;
      
      if (data?.ok) {
        toast.success('Template created successfully!');
        setCreateTemplateOpen(false);
        setNewTemplate({
          category: 'utility',
          language: 'en_US'
        });
        loadTemplates();
      } else {
        throw new Error(data?.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create template');
    }
    setLoading(false);
  };
  const createOtpTemplate = async () => {
    setLoading(true);
    try {
      console.log('Creating OTP template using whatsapp-send');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'create_template',
          name: 'otp_code',
          category: 'UTILITY',
          language: 'en_US',
          body_text: 'Your Glintup verification code is {{1}}. It expires in {{2}} minutes.'
        }
      });
      
      if (error) throw error;
      
      if (data?.ok) {
        toast.success("OTP template created successfully");
        loadTemplates();
      } else {
        throw new Error(data?.error || "Failed to create OTP template");
      }
    } catch (error) {
      console.error('Error creating OTP template:', error);
      toast.error(error.message || "Failed to create OTP template");
    } finally {
      setLoading(false);
    }
  };
  const loadTemplates = async () => {
    try {
      const {
        data
      } = await supabase.functions.invoke('whatsapp-templates', {
        body: {
          action: 'list'
        }
      });
      if (data?.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };
  const loadMessages = async () => {
    try {
      const {
        data
      } = await supabase.functions.invoke('whatsapp-messages', {
        body: {
          action: 'list',
          limit: 10
        }
      });
      if (data?.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  const handleSendText = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'send_text',
          to: testMessage.to,
          body: testMessage.body
        }
      });
      if (error) throw error;
      if (data?.error === 'outside_window') {
        toast.error('Outside 24-hour window. Use a template instead.');
      } else {
        toast.success('Message sent successfully!');
        setTestMessage({
          to: '',
          body: ''
        });
        loadMessages();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
    setLoading(false);
  };
  const handleSendTemplate = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'send_template',
          to: templateMessage.to,
          name: templateMessage.template,
          language: 'en_US',
          bodyParams: templateMessage.params.filter(p => p.trim())
        }
      });
      if (error) throw error;
      toast.success('Template message sent successfully!');
      setTemplateMessage({
        to: '',
        template: '',
        params: ['']
      });
      loadMessages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send template message');
    }
    setLoading(false);
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };
  const webhookUrl = `https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/whatsapp-webhook`;
  return <div className="min-h-screen bg-glintup-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold text-glintup-dark">WhatsApp Setup (Solo Mode)</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Card 1: Meta & Number */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Meta & Phone Number
              </CardTitle>
              <CardDescription>
                Connect your WhatsApp Business API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="token">Permanent Access Token</Label>
                <Input id="token" type="password" value={config.token} onChange={e => setConfig(prev => ({
                ...prev,
                token: e.target.value
              }))} placeholder="Enter your permanent access token" />
              </div>
              <div>
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input id="phone_number_id" value={config.phone_number_id} onChange={e => setConfig(prev => ({
                ...prev,
                phone_number_id: e.target.value
              }))} placeholder="Enter your phone number ID" />
              </div>
              <div>
                <Label htmlFor="verify_token">Verify Token</Label>
                <Input id="verify_token" value={config.verify_token} onChange={e => setConfig(prev => ({
                ...prev,
                verify_token: e.target.value
              }))} placeholder="Random string for webhook verification" />
              </div>
              <Button onClick={handleSaveConfig} disabled={loading || !config.token || !config.phone_number_id} className="w-full">
                {loading ? 'Verifying...' : 'Verify & Save'}
              </Button>
              {isConnected && <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Successfully connected to WhatsApp Business API!</AlertDescription>
                </Alert>}
            </CardContent>
          </Card>

          {/* Card 2: Display Name */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Display Name
              </CardTitle>
              <CardDescription>
                Set your business display name for WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input id="display_name" value={config.display_name || 'Glintup by Squareblue Media'} onChange={e => setConfig(prev => ({
                ...prev,
                display_name: e.target.value
              }))} placeholder="Your business display name" />
              </div>
              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Make sure your website footer/About shows:
                  "Glintup is owned and operated by Squareblue Media (GSTIN: XXXXXXXX)"
                </AlertDescription>
              </Alert>
              <Button onClick={handleSubmitDisplayName} disabled={loading || !config.display_name || !isConnected} className="w-full">
                Submit for Approval
              </Button>
              {config.display_status && <div className="flex items-center gap-2">
                  {config.display_status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                  {config.display_status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {config.display_status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                  <Badge variant={config.display_status === 'approved' ? 'default' : config.display_status === 'pending' ? 'secondary' : 'destructive'}>
                    {config.display_status}
                  </Badge>
                  {config.display_status_reason && <span className="text-sm text-muted-foreground">- {config.display_status_reason}</span>}
                </div>}
            </CardContent>
          </Card>

          {/* Card 3: Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhook endpoints for receiving messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Callback URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly />
                  <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Verify Token</Label>
                <div className="flex gap-2">
                  <Input value={config.verify_token} readOnly />
                  <Button variant="outline" onClick={() => copyToClipboard(config.verify_token)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertDescription>
                  Add these webhook settings to your Meta Developers Console for your WhatsApp Business App.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Card 4: Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Message Templates
              </CardTitle>
              <CardDescription>
                Create and manage message templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Button onClick={loadTemplates} variant="outline">
                  Refresh Templates
                </Button>
                <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button>Create Template</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-50">
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                      <DialogDescription>
                        Create a message template for WhatsApp
                      </DialogDescription>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={createOtpTemplate} disabled={loading}>
                          Quick: Create OTP Template
                        </Button>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template_name">Template Name</Label>
                        <Input id="template_name" value={newTemplate.name || ''} onChange={e => setNewTemplate(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} placeholder="e.g., welcome_message" />
                      </div>
                      <div>
                        <Label htmlFor="template_category">Category</Label>
                        <Select value={newTemplate.category} onValueChange={value => setNewTemplate(prev => ({
                        ...prev,
                        category: value as 'utility' | 'marketing'
                      }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utility">Utility</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="template_language">Language</Label>
                        <Select value={newTemplate.language} onValueChange={value => setNewTemplate(prev => ({
                        ...prev,
                        language: value
                      }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en_US">English (US)</SelectItem>
                            <SelectItem value="en_GB">English (UK)</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="template_body">Body Text</Label>
                        <Textarea id="template_body" value={newTemplate.body_text || ''} onChange={e => setNewTemplate(prev => ({
                        ...prev,
                        body_text: e.target.value
                      }))} placeholder="Hi {{1}}, your order {{2}} is ready for pickup." rows={4} />
                      </div>
                      <Button onClick={handleCreateTemplate} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Template'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template, index) => <TableRow key={index}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        <Badge variant={template.status === 'approved' ? 'default' : template.status === 'submitted' ? 'secondary' : 'destructive'}>
                          {template.status}
                        </Badge>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Card 5: Test & Go Live */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5" />
                Test & Go Live
              </CardTitle>
              <CardDescription>
                Send test messages and view recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Send Text Message */}
                <div className="space-y-4">
                  <h4 className="font-medium">Send Text Message (24hr window)</h4>
                  <div>
                    <Label htmlFor="test_to">To (+E.164 format)</Label>
                    <Input id="test_to" value={testMessage.to} onChange={e => setTestMessage(prev => ({
                    ...prev,
                    to: e.target.value
                  }))} placeholder="+1234567890" />
                  </div>
                  <div>
                    <Label htmlFor="test_message">Message</Label>
                    <Textarea id="test_message" value={testMessage.body} onChange={e => setTestMessage(prev => ({
                    ...prev,
                    body: e.target.value
                  }))} placeholder="Your test message" rows={3} />
                  </div>
                  <Button onClick={handleSendText} disabled={loading || !testMessage.to || !testMessage.body} className="w-full">
                    Send Text
                  </Button>
                </div>

                {/* Send Template Message */}
                <div className="space-y-4">
                  <h4 className="font-medium">Send Template Message</h4>
                  <div>
                    <Label htmlFor="template_to">To (+E.164 format)</Label>
                    <Input id="template_to" value={templateMessage.to} onChange={e => setTemplateMessage(prev => ({
                    ...prev,
                    to: e.target.value
                  }))} placeholder="+1234567890" />
                  </div>
                  <div>
                    <Label htmlFor="template_select">Template</Label>
                    <Select value={templateMessage.template} onValueChange={value => setTemplateMessage(prev => ({
                    ...prev,
                    template: value
                  }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.status === 'approved').map((template, index) => <SelectItem key={index} value={template.name}>
                            {template.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="template_params">Parameters (comma separated)</Label>
                    <Input id="template_params" value={templateMessage.params.join(', ')} onChange={e => setTemplateMessage(prev => ({
                    ...prev,
                    params: e.target.value.split(',').map(p => p.trim())
                  }))} placeholder="param1, param2" />
                  </div>
                  <Button onClick={handleSendTemplate} disabled={loading || !templateMessage.to || !templateMessage.template} className="w-full">
                    Send Template
                  </Button>
                </div>
              </div>

              {/* Recent Messages */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Recent Messages</h4>
                  <Button onClick={loadMessages} variant="outline" size="sm">
                    Refresh
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Direction</TableHead>
                      <TableHead>To/From</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map(message => <TableRow key={message.id}>
                        <TableCell>
                          <Badge variant={message.direction === 'out' ? 'default' : 'secondary'}>
                            {message.direction === 'out' ? 'Outgoing' : 'Incoming'}
                          </Badge>
                        </TableCell>
                        <TableCell>{message.to || message.from}</TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {message.body || `Template: ${message.template_name}`}
                        </TableCell>
                        <TableCell>
                          {message.status && <Badge variant="outline">{message.status}</Badge>}
                        </TableCell>
                        <TableCell>
                          {new Date(message.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default WhatsAppSetup;
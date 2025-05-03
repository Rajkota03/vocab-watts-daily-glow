
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Database, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MessagesSetupTab = () => {
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createWhatsAppTables = async () => {
    try {
      setIsCreatingTables(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('create-whatsapp-tables');
      
      if (error) {
        console.error("Error creating WhatsApp tables:", error);
        setError(`Error creating tables: ${error.message}`);
        toast({
          title: "Setup Failed",
          description: "Failed to create WhatsApp database tables",
          variant: "destructive",
        });
        return;
      }
      
      setSetupResult(data);
      toast({
        title: "Setup Successful",
        description: "WhatsApp database tables created successfully",
        variant: "success",
      });
      
    } catch (err) {
      console.error("Exception during table creation:", err);
      setError(`Unexpected error: ${String(err)}`);
      toast({
        title: "Setup Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTables(false);
    }
  };

  const createMessageLogsTables = async () => {
    try {
      setIsCreatingTables(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('create-whatsapp-logs-table');
      
      if (error) {
        console.error("Error creating message_logs table:", error);
        setError(`Error creating message_logs table: ${error.message}`);
        toast({
          title: "Setup Failed",
          description: "Failed to create message_logs table",
          variant: "destructive",
        });
        return;
      }
      
      setSetupResult(data);
      toast({
        title: "Setup Successful",
        description: "WhatsApp message_logs table created successfully",
        variant: "success",
      });
      
    } catch (err) {
      console.error("Exception during message_logs table creation:", err);
      setError(`Unexpected error: ${String(err)}`);
      toast({
        title: "Setup Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTables(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">WhatsApp Integration Setup</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Database Tables Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> WhatsApp Database Tables
            </CardTitle>
            <CardDescription>
              Create necessary tables for WhatsApp messaging functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The following tables will be created:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>whatsapp_messages - Stores incoming WhatsApp messages</li>
              <li>whatsapp_config - Stores WhatsApp integration configuration</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={createWhatsAppTables}
              disabled={isCreatingTables}
            >
              {isCreatingTables ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Create WhatsApp Tables
            </Button>
          </CardFooter>
        </Card>
        
        {/* Message Logs Table Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> WhatsApp Message Logs
            </CardTitle>
            <CardDescription>
              Create table for tracking WhatsApp message delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This will create a table to track WhatsApp message status events:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>message_logs - Stores delivery status events from Twilio</li>
              <li>Includes message SID, status, error codes, and timestamps</li>
              <li>Enables tracking of message delivery and failures</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={createMessageLogsTables}
              disabled={isCreatingTables}
            >
              {isCreatingTables ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Create Message Logs Table
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Setup Result */}
      {setupResult && (
        <Alert variant="success" className="mt-4">
          <Check className="h-4 w-4" />
          <AlertTitle>Setup Successful</AlertTitle>
          <AlertDescription>
            Database tables were created successfully. You can now use the WhatsApp integration.
            {setupResult.tables_created && setupResult.tables_created.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Tables created:</p>
                <ul className="list-disc pl-5">
                  {setupResult.tables_created.map((table: string) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Setup Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>WhatsApp Setup Instructions</CardTitle>
          <CardDescription>
            Steps to properly configure WhatsApp integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Supabase Secrets Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Add the following secrets in your Supabase project:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground mt-2">
                <li>TWILIO_ACCOUNT_SID - Your Twilio Account SID</li>
                <li>TWILIO_AUTH_TOKEN - Your Twilio Auth Token</li>
                <li>TWILIO_FROM_NUMBER - Your WhatsApp-enabled phone number with country code (e.g., +14155238886)</li>
                <li>TWILIO_MESSAGING_SERVICE_SID - (Optional) Your Twilio Messaging Service SID</li>
                <li>WHATSAPP_VERIFY_TOKEN - Any secure random string for webhook verification</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Twilio Account Setup</h3>
              <p className="text-sm text-muted-foreground">
                In your Twilio console:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground mt-2">
                <li>Enable WhatsApp in your Twilio account</li>
                <li>Set up the WhatsApp sandbox if using a development account</li>
                <li>Configure the webhook URL to point to your Supabase edge function</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Webhook Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Use the following URL as your Twilio WhatsApp webhook:
              </p>
              <pre className="bg-muted p-2 rounded text-xs mt-2">
                https://pbpmtqcffhqwzboviqfw.supabase.co/functions/v1/whatsapp-webhook
              </pre>
              <p className="text-xs text-muted-foreground mt-1">
                * Replace with your actual Supabase project URL
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">4. Testing</h3>
              <p className="text-sm text-muted-foreground">
                After configuration, use the WhatsApp Test Button to send a test message.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesSetupTab;

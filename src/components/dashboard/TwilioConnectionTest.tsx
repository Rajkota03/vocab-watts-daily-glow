
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TwilioConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [detailedCheckPending, setDetailedCheckPending] = useState(false);
  const [detailedResult, setDetailedResult] = useState<any>(null);
  const { toast } = useToast();

  const testTwilioConnection = async () => {
    try {
      setLoading(true);
      setResult(null);
      setDetailedResult(null);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          testTwilioConnection: true,
          detailed: true
        }
      });
      
      if (error) {
        console.error("Error testing Twilio connection:", error);
        toast({
          title: "Connection Test Failed",
          description: "Could not connect to Twilio API",
          variant: "destructive",
        });
        return;
      }
      
      setResult(data);
      
      if (data.success) {
        toast({
          title: "Twilio Connection Successful",
          description: `Connected to account: ${data.accountName || 'Unknown'} (${data.accountStatus || 'status unknown'})`,
          variant: "success"
        });
      } else {
        toast({
          title: "Twilio Connection Failed",
          description: data.error || "Could not connect to Twilio API",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Exception testing Twilio connection:", err);
      toast({
        title: "Connection Test Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testMessageServiceSid = async () => {
    try {
      setDetailedCheckPending(true);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          testMessagingService: true,
          detailed: true,
          validateCredentials: true
        }
      });
      
      if (error) {
        console.error("Error testing Messaging Service SID:", error);
        toast({
          title: "Messaging Service Test Failed",
          description: "Could not validate Messaging Service SID",
          variant: "destructive",
        });
        return;
      }
      
      setDetailedResult(data);
      
      if (data.messagingServiceValid) {
        toast({
          title: "Messaging Service Verified",
          description: `Valid Messaging Service: ${data.messagingServiceName || 'Unknown name'}`,
          variant: "success"
        });
      } else {
        toast({
          title: "Messaging Service Error",
          description: data.error || "Invalid Messaging Service SID",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Exception testing Messaging Service:", err);
      toast({
        title: "Service Test Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDetailedCheckPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={testTwilioConnection}
        disabled={loading}
        className="w-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        Test Twilio Account Connection
      </Button>
      
      {result && (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Account Status</CardTitle>
              {result.success ? 
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </Badge> :
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Failed
                </Badge>
              }
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-sm space-y-2">
              {result.success ? (
                <>
                  <p><span className="font-medium">Account:</span> {result.accountName || 'Unknown'}</p>
                  <p><span className="font-medium">Status:</span> {result.accountStatus || 'Unknown'}</p>
                  <p><span className="font-medium">Account SID:</span> {result.accountSidPrefix || 'Hidden'}...</p>
                  
                  {!detailedResult && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2" 
                      onClick={testMessageServiceSid}
                      disabled={detailedCheckPending}
                    >
                      {detailedCheckPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Test Messaging Service SID
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-red-600">{result.error || 'Unknown error'}</p>
                  {result.errorCode && (
                    <p><span className="font-medium">Error Code:</span> {result.errorCode}</p>
                  )}
                  {result.accountSidPrefix && (
                    <p><span className="font-medium">Account SID Prefix:</span> {result.accountSidPrefix}...</p>
                  )}
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Possible Solution</AlertTitle>
                    <AlertDescription>
                      Please check that your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct in your Supabase secrets.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {detailedResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Messaging Service Status</CardTitle>
            {detailedResult.messagingServiceValid ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 w-fit">
                <CheckCircle className="h-4 w-4 mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 w-fit">
                <AlertCircle className="h-4 w-4 mr-1" />
                Invalid
              </Badge>
            )}
            <CardDescription className="text-xs">
              {detailedResult.messagingServiceValid 
                ? `Service Name: ${detailedResult.messagingServiceName || 'Unknown'}`
                : 'The messaging service could not be verified'}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            {!detailedResult.messagingServiceValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error 21701</AlertTitle>
                <AlertDescription>
                  <p>The Messaging Service SID does not exist or does not belong to this Twilio account.</p>
                  <p className="mt-2">Please check that:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Your TWILIO_MESSAGING_SERVICE_SID is correct</li>
                    <li>The Messaging Service SID belongs to the same account as your Account SID</li>
                    <li>The Messaging Service has not been deleted</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>TWILIO_MESSAGING_SERVICE_SID:</span>
                <span className="font-mono text-xs">{detailedResult.messagingServiceSidPrefix || ''}...</span>
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground pt-2">
                <span className="font-medium">Note:</span> You can find your Messaging Service SID in the{' '}
                <a 
                  href="https://console.twilio.com/us1/develop/sms/services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Twilio Console
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs" 
              onClick={() => setDetailedResult(null)}
            >
              Hide Details
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Help Section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Common Twilio Issues</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li><span className="font-medium">Error 20404:</span> Account SID doesn't exist or has been deactivated</li>
          <li><span className="font-medium">Error 21701:</span> Messaging Service SID is incorrect or belongs to a different account</li>
          <li><span className="font-medium">Error 20003:</span> Authentication failed (Auth Token is incorrect)</li>
        </ul>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>Make sure all three secrets are correctly set in your Supabase project:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>TWILIO_ACCOUNT_SID</li>
            <li>TWILIO_AUTH_TOKEN</li>
            <li>TWILIO_MESSAGING_SERVICE_SID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwilioConnectionTest;

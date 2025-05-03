
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const TwilioConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testTwilioConnection = async () => {
    try {
      setLoading(true);
      setResult(null);
      
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

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={testTwilioConnection}
        disabled={loading}
        className="w-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        Test Twilio Connection
      </Button>
      
      {result && (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Connection Status</CardTitle>
              {result.success ? 
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </div> :
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Failed
                </div>
              }
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-sm space-y-2">
              {result.success ? (
                <>
                  <p><span className="font-medium">Account:</span> {result.accountName || 'Unknown'}</p>
                  <p><span className="font-medium">Status:</span> {result.accountStatus || 'Unknown'}</p>
                  <p><span className="font-medium">Account SID:</span> {result.accountSid || 'Hidden'}</p>
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
                  {result.tip && (
                    <p className="italic text-gray-600">{result.tip}</p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TwilioConnectionTest;

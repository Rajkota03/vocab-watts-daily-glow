
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import WhatsAppTester from "@/components/WhatsAppTester";

const WhatsAppTest = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">WhatsApp Integration Test</h1>
      
      <WhatsAppTester />
      
      <div className="mt-8 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Setup Instructions:</h3>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Ensure all Twilio configuration values are set in your Supabase Edge Function secrets.</li>
          <li>Required values: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID.</li>
          <li>You can check the Edge Function logs for detailed information if messages fail to send.</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppTest;

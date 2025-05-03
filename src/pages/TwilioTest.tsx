
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TwilioConnectionTest from "@/components/dashboard/TwilioConnectionTest";

const TwilioTest = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
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
      
      <h1 className="text-2xl font-bold mb-6">Twilio Connection Test</h1>
      
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <p className="text-gray-600 mb-4">
          This page lets you test your Twilio connection without sending any messages. 
          It will verify if your account credentials are correctly configured.
        </p>
        
        <TwilioConnectionTest />
        
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Credentials being checked:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>TWILIO_ACCOUNT_SID</li>
            <li>TWILIO_AUTH_TOKEN</li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            These credentials should be set in your Supabase project secrets. 
            No actual values are exposed during testing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwilioTest;

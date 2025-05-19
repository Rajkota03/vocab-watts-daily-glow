
import React from 'react';
import { AiSensyTester } from '@/components/AiSensyTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AiSensyTest = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" className="flex items-center gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AiSensy WhatsApp Integration Tester</h1>
        <p className="text-gray-600">
          Use this page to test sending WhatsApp messages via the AiSensy integration.
        </p>
      </div>
      
      <AiSensyTester />
    </div>
  );
};

export default AiSensyTest;

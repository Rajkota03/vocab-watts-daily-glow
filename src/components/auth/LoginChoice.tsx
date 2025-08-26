import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneLoginForm } from './PhoneLoginForm';
import PasswordLoginForm from './MagicLinkLoginForm';
import { useNavigate } from 'react-router-dom';

const LoginChoice = () => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | null>(null);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleBackToChoice = () => {
    setSelectedMethod(null);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Email login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to your account</p>
          </div>
          
          <PasswordLoginForm />
          
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Button
                variant="link"
                onClick={handleBackToHome}
                className="p-0 h-auto text-primary font-medium"
              >
                Start your free trial
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft, Menu } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Header */}
      <div className="w-full py-4 px-6 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <img 
            src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" 
            alt="Glintup" 
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center p-4 pt-8">
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
    </div>
  );
};

export default LoginChoice;
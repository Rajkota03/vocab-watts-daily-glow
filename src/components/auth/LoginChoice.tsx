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

  if (selectedMethod === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToChoice}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login options
            </Button>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            <PasswordLoginForm />
          </div>
        </div>
      </div>
    );
  }

  if (selectedMethod === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToChoice}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login options
            </Button>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Login</h3>
              <p className="text-gray-600 text-sm">Enter your WhatsApp number for instant access</p>
            </div>
            <PhoneLoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Choice screen
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
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Choose how you'd like to log in</p>
          </div>

          {/* Login options */}
          <div className="space-y-4">
            <Button
              onClick={() => setSelectedMethod('email')}
              variant="outline"
              className="w-full h-16 text-base font-medium rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Email & Password</p>
                  <p className="text-sm text-gray-600">For Pro users with accounts</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedMethod('phone')}
              variant="outline"
              className="w-full h-16 text-base font-medium rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">WhatsApp Login</p>
                  <p className="text-sm text-gray-600">Quick access via OTP code</p>
                </div>
              </div>
            </Button>
          </div>

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
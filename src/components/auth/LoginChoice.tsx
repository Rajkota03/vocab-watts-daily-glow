import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft, Menu, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneLoginForm } from './PhoneLoginForm';
import PasswordLoginForm from './MagicLinkLoginForm';
import { RegisterForm } from './RegisterForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RegisterFormValues } from '@/types/auth';

const LoginChoice = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleBackToChoice = () => {
    setSelectedMethod(null);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignup = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            nick_name: values.nickName,
            whatsapp_number: values.whatsappNumber,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Header with toggle buttons */}
            <div className="text-center mb-8">
              <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
                <Button
                  variant={mode === 'login' ? 'default' : 'ghost'}
                  onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 rounded-xl font-semibold transition-all",
                    mode === 'login' 
                      ? "bg-white text-primary shadow-md" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In
                </Button>
                <Button
                  variant={mode === 'signup' ? 'default' : 'ghost'}
                  onClick={() => setMode('signup')}
                  className={cn(
                    "flex-1 rounded-xl font-semibold transition-all",
                    mode === 'signup' 
                      ? "bg-white text-primary shadow-md" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 text-sm">
                {mode === 'login' 
                  ? 'Sign in to your account' 
                  : 'Join thousands of learners expanding their vocabulary'
                }
              </p>
            </div>
            
            {mode === 'login' ? (
              <PasswordLoginForm />
            ) : (
              <RegisterForm onSubmit={handleSignup} isLoading={isLoading} />
            )}
            
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      onClick={() => setMode('signup')}
                      className="p-0 h-auto text-primary font-medium"
                    >
                      Start your free trial
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      onClick={() => setMode('login')}
                      className="p-0 h-auto text-primary font-medium"
                    >
                      Sign in here
                    </Button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;
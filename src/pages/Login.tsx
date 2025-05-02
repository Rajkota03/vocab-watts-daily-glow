import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PhoneLoginForm } from '@/components/auth/PhoneLoginForm'; // Import the new component
import type { LoginFormValues, RegisterFormValues } from '@/types/auth';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email'); // State to toggle login method
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Session check on login page:", data.session);
      if (data.session) {
        console.log("User already logged in, redirecting to dashboard");
        navigate('/dashboard');
      }
    };
    checkUser();

    // Check WhatsApp configuration status when login page loads
    const checkWhatsAppConfig = async () => {
      try {
        // Assuming 'update-whatsapp-settings' can check config
        const { data, error } = await supabase.functions.invoke('update-whatsapp-settings', {
          body: { checkOnly: true }
        });
        
        if (!error) {
          setConfigStatus(data);
          console.log("WhatsApp configuration status:", data);
        }
      } catch (err) {
        console.error("Error checking WhatsApp config:", err);
      }
    };
    
    checkWhatsAppConfig();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event, session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (window.location.pathname.includes('/login')) {
             console.log("Signed in, navigating to dashboard from login page.");
             navigate('/dashboard');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Navigation is handled by onAuthStateChange
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            nick_name: values.nickName || null,
            whatsapp_number: values.whatsappNumber
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Account created successfully",
        description: "Please check your email for a confirmation link or proceed to login.",
      });
      setIsSignUp(false); // Switch back to login view after registration
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLoginSuccess = () => {
    console.log("Phone login successful, navigating to dashboard.");
    // Navigation should be handled by onAuthStateChange, but force it if needed
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9b87f5]/10 to-[#7E69AB]/10 px-4 py-12 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center text-[#9b87f5] hover:text-[#7E69AB] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      <Card className="w-full max-w-md border border-gray-100/50 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] rounded-full flex items-center justify-center shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] to-[#7E69AB]">
            {isSignUp ? 'Join GLINTUP' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-500 text-base">
            {isSignUp 
              ? 'Create your account to get started' 
              : `Sign in via ${loginMethod === 'email' ? 'Email' : 'WhatsApp OTP'} to access your GLINTUP dashboard`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {configStatus && configStatus.configRequired?.TWILIO_AUTH_TOKEN === false && (
            <div className="bg-green-50 text-green-700 p-2 rounded-md text-xs mb-4">
              WhatsApp messaging is configured and ready to use
            </div>
          )}
          
          {isSignUp ? (
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          ) : (
            loginMethod === 'email' ? (
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            ) : (
              <PhoneLoginForm onLoginSuccess={handlePhoneLoginSuccess} />
            )
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-2">
          {!isSignUp && (
            <div className="text-center text-sm">
              <button
                type="button"
                className="text-[#9b87f5] hover:text-[#7E69AB] font-medium transition-colors inline-flex items-center"
                onClick={() => setLoginMethod(loginMethod === 'email' ? 'phone' : 'email')}
              >
                {loginMethod === 'email' ? <Phone className="h-4 w-4 mr-1"/> : <Mail className="h-4 w-4 mr-1"/>}
                Sign in with {loginMethod === 'email' ? 'WhatsApp OTP' : 'Email/Password'} instead
              </button>
            </div>
          )}
          <div className="text-center text-sm">
            <span className="text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>{' '}
            <button
              type="button"
              className="text-[#9b87f5] hover:text-[#7E69AB] font-medium transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;


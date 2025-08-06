import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PhoneLoginForm } from '@/components/auth/PhoneLoginForm';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the return path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let mounted = true;
    
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && mounted) {
          console.log("User already logged in, navigating to:", from);
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_IN' && session && mounted) {
        console.log("User signed in, navigating to:", from);
        // Small delay to ensure session is fully established
        setTimeout(() => {
          if (mounted) {
            navigate(from, { replace: true });
          }
        }, 100);
      }
      
      if (event === 'SIGNED_OUT' && mounted) {
        setIsCheckingAuth(false);
      }
    });

    checkUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, from]);

  const handleLogin = async (values: any) => {
    setIsLoading(true);
    try {
      console.log("Attempting login for:", values.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) throw error;
      
      console.log("Login successful, session:", !!data.session);
      
      // Show success message
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setIsLoading(true);
    try {
      console.log("Registration values:", values);
      
      // Ensure whatsapp_number is properly formatted
      const whatsappNumber = values.whatsappNumber?.startsWith('+') 
        ? values.whatsappNumber 
        : values.whatsappNumber ? `+${values.whatsappNumber}` : '';
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            nick_name: values.nickName || null,
            whatsapp_number: whatsappNumber
          }
        }
      });

      if (error) throw error;
      
      if (data?.user) {
        // Create initial subscription record to ensure WhatsApp number is available
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: data.user.id,
            phone_number: whatsappNumber,
            is_pro: false,
            category: 'daily-beginner'
          });
          
        if (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError);
          // Don't throw error here, continue with registration flow
        }
      }
      
      toast({
        title: "Account created successfully",
        description: "Please check your email for a confirmation link.",
      });
      setIsSignUp(false); // Switch back to login view
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

  if (isCheckingAuth) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

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
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-500 text-base">
            {isSignUp 
              ? 'Sign up to manage your account' 
              : 'Sign in to access your dashboard'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {isSignUp ? (
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          ) : (
            loginMethod === 'email' ? (
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            ) : (
              <PhoneLoginForm onLoginSuccess={() => navigate(from, { replace: true })} />
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
                Sign in with {loginMethod === 'email' ? 'WhatsApp OTP' : 'Email/Password'}
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, LockIcon, MailIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          navigate('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Account created successfully",
          description: "Please check your email for a confirmation link or proceed to login.",
        });
        
        // Automatically switch to login mode after signup
        setIsSignUp(false);
      } else {
        // Sign in
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Successfully logged in
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // Navigate to dashboard
        navigate('/dashboard');
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md border border-gray-200 shadow-xl">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-vocab-teal to-vocab-purple rounded-full flex items-center justify-center shadow-md">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-vocab-teal to-vocab-purple">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-gray-500 text-base">
            {isSignUp 
              ? 'Sign up for VocabSpark to start your vocabulary journey' 
              : 'Login to access your VocabSpark dashboard'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-50 border border-gray-200 focus:border-vocab-teal"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-50 border border-gray-200 focus:border-vocab-teal"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full py-6 text-base font-medium shadow-md transition-all hover:scale-[1.01]" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-500">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                className="text-vocab-teal hover:text-vocab-purple font-medium transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/dashboard';

        if (!token_hash || !type) {
          throw new Error('Invalid confirmation link');
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          
          toast({
            title: "Email Confirmed!",
            description: "Your account is now active. Redirecting to dashboard...",
          });

          // Navigate to dashboard after success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. Please try again.');
        
        toast({
          title: "Verification Failed",
          description: error.message || 'Failed to verify email. Please try again.',
          variant: "destructive"
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleResendVerification = async () => {
    try {
      // This would typically require the user's email, which we might not have here
      toast({
        title: "Resend Verification",
        description: "Please sign in again to resend verification email.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Resend verification error:', error);
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
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-primary/10">
            <div className="text-center">
              {status === 'verifying' && (
                <>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Verifying Your Email</h3>
                  <p className="text-gray-600 mb-6">Please wait while we confirm your email address...</p>
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
                    <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Confirmed!</h3>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                    <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h3>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="space-y-3">
                    <Button
                      onClick={handleResendVerification}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturnHome}
                      className="w-full"
                    >
                      Return to Home
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
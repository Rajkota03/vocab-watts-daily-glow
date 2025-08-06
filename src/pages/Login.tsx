import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordLoginForm from '@/components/auth/MagicLinkLoginForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmailAuth } from '@/hooks/useEmailAuth';

const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useEmailAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <PasswordLoginForm />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="p-0 h-auto text-primary"
            >
              Start your free trial
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

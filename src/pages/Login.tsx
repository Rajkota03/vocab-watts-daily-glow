import React from 'react';
import LoginChoice from '@/components/auth/LoginChoice';
import { useNavigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginChoice />;
};

export default Login;

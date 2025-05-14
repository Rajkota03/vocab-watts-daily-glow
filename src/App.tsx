
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import WhatsAppTest from './pages/WhatsAppTest';
import { supabase } from '@/integrations/supabase/client';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Check session once during initialization
    const checkSession = async () => {
      try {
        await supabase.auth.getSession();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsInitialized(true); // Set initialized even on error to prevent loading state from hanging
      }
    };
    
    checkSession();
  }, []);
  
  // Don't render routes until we've initialized auth
  if (!isInitialized) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/whatsapp-test" element={
            <ProtectedRoute>
              <WhatsAppTest />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

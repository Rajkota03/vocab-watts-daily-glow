import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import WhatsAppTest from './pages/WhatsAppTest';
import TwilioTest from './pages/TwilioTest';
import AiSensyTest from './pages/AiSensyTest';
import { useEmailAuth } from './hooks/useEmailAuth';

// Auth wrapper component that uses the hook inside Router context
function AuthProvider({ children }: { children: React.ReactNode }) {
  useEmailAuth();
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/whatsapp-test" element={
            <ProtectedRoute>
              <WhatsAppTest />
            </ProtectedRoute>
          } />
          <Route path="/twilio-test" element={<TwilioTest />} />
          <Route path="/aisensy-test" element={<AiSensyTest />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
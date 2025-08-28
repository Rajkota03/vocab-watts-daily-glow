import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Upgrade from './pages/Upgrade';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import WhatsAppSetup from './pages/WhatsAppSetup';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import EmailConfirmation from './pages/EmailConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import WhatsAppTest from './pages/WhatsAppTest';
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
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/auth/confirm" element={<EmailConfirmation />} />
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
          <Route path="/admin/whatsapp-setup" element={
            <ProtectedRoute>
              <WhatsAppSetup />
            </ProtectedRoute>
          } />
          <Route path="/whatsapp-test" element={
            <ProtectedRoute>
              <WhatsAppTest />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
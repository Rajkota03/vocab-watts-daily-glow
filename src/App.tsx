import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import WhatsAppTest from './pages/WhatsAppTest';

function App() {
  return (
    <Toaster>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Add WhatsApp Test route */}
          <Route path="/whatsapp-test" element={
            <ProtectedRoute>
              <WhatsAppTest />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </Toaster>
  );
}

export default App;


import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col bg-glintup-bg">
      <Navbar />
      
      <main className="flex-1">
        <AdminDashboard />
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;

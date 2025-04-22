
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserManagementDashboard from '@/components/admin/UserManagementDashboard';

const AdminUsers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <UserManagementDashboard />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminUsers;


import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminAnalyticsContent from '@/components/admin/AdminAnalyticsContent';

const AdminAnalytics = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <AdminAnalyticsContent />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminAnalytics;

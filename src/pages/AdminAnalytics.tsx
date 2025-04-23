
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAnalyticsContent from '@/components/admin/AdminAnalyticsContent';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  
  const handleTabChange = (tab: string) => {
    // If user selects a tab other than analytics, navigate to main admin page
    if (tab !== 'analytics') {
      navigate('/admin');
    }
  };
  
  return (
    <AdminLayout activeTab="analytics" setActiveTab={handleTabChange}>
      <AdminAnalyticsContent />
    </AdminLayout>
  );
};

export default AdminAnalytics;

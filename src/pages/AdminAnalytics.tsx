
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAnalyticsContent from '@/components/admin/AdminAnalyticsContent';

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  return (
    <AdminLayout activeTab="analytics" setActiveTab={setActiveTab}>
      <AdminAnalyticsContent />
    </AdminLayout>
  );
};

export default AdminAnalytics;

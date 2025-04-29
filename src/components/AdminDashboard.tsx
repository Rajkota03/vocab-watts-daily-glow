
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import OverviewTab from './admin/tabs/OverviewTab';
import UserManagementTab from './admin/tabs/UserManagementTab';
import VocabularyTab from './admin/tabs/VocabularyTab';
import SubscriptionsTab from './admin/tabs/SubscriptionsTab';
import MessagesTab from './admin/tabs/MessagesTab';
import ActivityTab from './admin/tabs/ActivityTab';
import SettingsTab from './admin/tabs/SettingsTab';
import UserRolesTab from './admin/tabs/UserRolesTab';
import PromptManagerTab from './admin/tabs/PromptManagerTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-renders
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for user deletion events to refresh relevant tabs
    const handleUserDeleted = (event: Event) => {
      console.log("User deleted event received in AdminDashboard", (event as CustomEvent).detail);
      // Force a re-render of all tabs by incrementing the refresh key
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('userDeleted', handleUserDeleted);
    
    return () => {
      window.removeEventListener('userDeleted', handleUserDeleted);
    };
  }, []);

  // Modified to handle navigation to analytics page
  const handleTabChange = (tab: string) => {
    if (tab === 'analytics') {
      navigate('/admin/analytics');
    } else {
      setActiveTab(tab);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab key={refreshKey} />;
      case 'users':
        return <UserManagementTab key={refreshKey} />;
      case 'vocabulary':
        return <VocabularyTab key={refreshKey} />;
      case 'subscriptions':
        return <SubscriptionsTab key={refreshKey} />;
      case 'messages':
        return <MessagesTab key={refreshKey} />;
      case 'activity':
        return <ActivityTab key={refreshKey} />;
      case 'settings':
        return <SettingsTab key={refreshKey} />;
      case 'roles':
        return <UserRolesTab key={refreshKey} />;
      case 'prompts':
        return <PromptManagerTab key={refreshKey} />;
      default:
        return <OverviewTab key={refreshKey} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;

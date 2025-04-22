
import React, { useState } from 'react';
import AdminLayout from './admin/AdminLayout';
import OverviewTab from './admin/tabs/OverviewTab';
import UserManagementTab from './admin/tabs/UserManagementTab';
import VocabularyTab from './admin/tabs/VocabularyTab';
import SubscriptionsTab from './admin/tabs/SubscriptionsTab';
import MessagesTab from './admin/tabs/MessagesTab';
import ActivityTab from './admin/tabs/ActivityTab';
import SettingsTab from './admin/tabs/SettingsTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Render the appropriate tab based on the active tab state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'users':
        return <UserManagementTab />;
      case 'vocabulary':
        return <VocabularyTab />;
      case 'subscriptions':
        return <SubscriptionsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'activity':
        return <ActivityTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;

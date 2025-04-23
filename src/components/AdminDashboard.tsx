import React, { useState } from 'react';
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
      case 'roles':
        return <UserRolesTab />;
      case 'prompts':
        return <PromptManagerTab />;
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

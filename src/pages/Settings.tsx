import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager';
import { useAuthHandler } from '@/hooks/useAuthHandler';

const Settings = () => {
  const navigate = useNavigate();
  const { session } = useAuthHandler();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Subscription Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
            <SubscriptionManager userId={session?.user?.id || null} />
          </div>

          {/* Other Settings Sections */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600">Account settings will be available here.</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600">User preferences will be available here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

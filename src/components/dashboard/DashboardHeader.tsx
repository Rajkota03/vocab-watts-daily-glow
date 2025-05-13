import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, Settings, MessageSquare } from "lucide-react";
import { useAuth } from '@clerk/clerk-react';

const DashboardHeader = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Redirect will be handled by Clerk's useAuth hook
  };

  return (
    <div className="flex justify-between items-center mb-6 p-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2">
        {/* Add WhatsApp Test link */}
        <Link to="/whatsapp-test">
          <Button variant="ghost" size="sm" className="flex gap-1 items-center">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Test
          </Button>
        </Link>
        
        {/* Keep existing buttons */}
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;

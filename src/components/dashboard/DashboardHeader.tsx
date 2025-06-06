
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  userNickname: string;
  handleSignOut: () => Promise<void>;
  isAdmin: boolean;
  wordsLearnedThisMonth: number;
}

const DashboardHeader = ({ 
  userNickname, 
  handleSignOut, 
  isAdmin,
  wordsLearnedThisMonth 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            WordDrop
          </span>
        </Link>
        
        <div className="hidden md:flex ml-10 gap-5">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link to="/whatsapp-test" className="text-gray-600 hover:text-gray-900">WhatsApp Test</Link>
          {isAdmin && (
            <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
          )}
        </div>
      </div>
    
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right mr-2">
          <p className="font-medium">Hey, {userNickname || 'there'}</p>
          <p className="text-xs text-gray-500">
            {wordsLearnedThisMonth} words learned this month
          </p>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;

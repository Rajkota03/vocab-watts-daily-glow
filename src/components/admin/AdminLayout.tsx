import React, { useState } from 'react';
import { 
  Users, BarChart2, MessageSquare, Activity, 
  Settings, Database, PieChart, Shield, FileText,
  LineChart, ArrowLeft
} from 'lucide-react';
import { 
  Sheet, SheetContent, SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  icon: React.ElementType;
  value: string;
  path?: string;
}

const navItems: NavItem[] = [
  { title: 'Overview', icon: PieChart, value: 'overview', path: '/admin' },
  { title: 'User Management', icon: Users, value: 'users', path: '/admin' },
  { title: 'User Roles', icon: Shield, value: 'roles', path: '/admin' },
  { title: 'Vocabulary', icon: Database, value: 'vocabulary', path: '/admin' },
  { title: 'Analytics', icon: LineChart, value: 'analytics', path: '/admin/analytics' },
  { title: 'Prompt Manager', icon: FileText, value: 'prompts', path: '/admin' },
  { title: 'Subscriptions', icon: BarChart2, value: 'subscriptions', path: '/admin' },
  { title: 'Messages', icon: MessageSquare, value: 'messages', path: '/admin' },
  { title: 'Activity', icon: Activity, value: 'activity', path: '/admin' },
  { title: 'Settings', icon: Settings, value: 'settings', path: '/admin' }
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab 
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (item: NavItem) => {
    if (item.path === '/admin') {
      setActiveTab(item.value);
    } else if (item.path) {
      navigate(item.path);
    }
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img src="/logo-horizontal.svg" alt="GLINTUP" className="h-8" />
          </div>
          <nav className="mt-5 flex-1 flex flex-col divide-y divide-gray-100 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md w-full",
                    (activeTab === item.value && item.path === '/admin') || 
                    (window.location.pathname === item.path && item.path !== '/admin')
                      ? "bg-glintup-mint/10 text-glintup-mint"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-gray-700"
                    asChild
                  >
                    <Link to="/dashboard">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return to main dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <img src="/logo-horizontal.svg" alt="GLINTUP" className="h-8" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <div className="mb-6">
              <img src="/logo.svg" alt="GLINTUP" className="h-10" />
            </div>
            <nav className="flex flex-col gap-2 py-4">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                    (activeTab === item.value && item.path === '/admin') || 
                    (window.location.pathname === item.path && item.path !== '/admin')
                      ? "bg-glintup-mint/10 text-glintup-mint"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </button>
              ))}
            </nav>
            <div className="px-2 pt-4 border-t border-gray-200 mt-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-gray-700"
                asChild
              >
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

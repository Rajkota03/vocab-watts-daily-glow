
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  LogIn, 
  ChevronDown,
  Sparkles,
  BookOpen,
  DollarSign,
  MessageSquare,
  Dumbbell,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setIsLoggedIn(!!session);
      
      // Check if user has admin role using our DB function
      if (session) {
        try {
          const { data: hasAdminRole, error } = await supabase.rpc('has_role', { 
            _user_id: session.user.id,
            _role: 'admin'
          });
          
          if (error) {
            console.error('Error checking admin role:', error);
          } else {
            setIsAdmin(!!hasAdminRole);
          }
        } catch (error) {
          console.error('Failed to check admin role:', error);
        }
      }
    };
    
    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const scrollToSignup = () => {
    const signupSection = document.querySelector('section:nth-of-type(5)');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Don't show navbar on login page
  if (location.pathname === '/login') return null;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 shadow-md backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-vuilder-indigo relative">
            {/* Custom VUILDER Logo with flexing arms */}
            <span className="text-white font-bold text-lg">V</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3">
              <Dumbbell className="h-3 w-3 text-white transform rotate-90" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3">
              <Dumbbell className="h-3 w-3 text-white transform rotate-90" />
            </div>
          </div>
          <span className="font-bold text-xl text-vuilder-indigo font-poppins tracking-tight">VUILDER</span>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-vuilder-indigo hover:text-vuilder-mint focus:outline-none transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-vuilder-text hover:text-vuilder-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <BookOpen className="h-4 w-4 mr-1 group-hover:text-vuilder-mint" />
            How It Works
          </a>
          <a href="#samples" className="text-vuilder-text hover:text-vuilder-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <MessageSquare className="h-4 w-4 mr-1 group-hover:text-vuilder-mint" />
            Sample Words
          </a>
          <a href="#pricing" className="text-vuilder-text hover:text-vuilder-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <DollarSign className="h-4 w-4 mr-1 group-hover:text-vuilder-mint" />
            Pricing
          </a>
          
          {isLoggedIn && isAdmin && (
            <Link 
              to="/admin" 
              className="text-vuilder-text hover:text-vuilder-mint transition-colors font-medium font-inter text-sm flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}

          {isLoggedIn ? (
            <Link to="/dashboard" className="text-white bg-vuilder-mint px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="text-vuilder-text hover:text-vuilder-mint transition-colors font-medium font-inter text-sm flex items-center gap-1">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
          
          {!isLoggedIn && (
            <div className="flex gap-3">
              <Button className="bg-white border border-vuilder-indigo text-vuilder-indigo hover:bg-vuilder-indigo/10 shadow-sm" onClick={scrollToSignup}>
                Start Free Trial
              </Button>
              <Button className="bg-vuilder-coral hover:bg-vuilder-coral/90 text-white shadow-md" onClick={() => {
                scrollToSignup();
                // Set Pro mode in signup form by triggering a click on the "Switch to Pro" button after a delay
                setTimeout(() => {
                  const switchToProButton = document.querySelector('button.text-xs.text-vuilder-mint.underline');
                  if (switchToProButton) {
                    (switchToProButton as HTMLButtonElement).click();
                  }
                }, 100);
              }}>
                Go Pro
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 md:hidden animate-fade-in">
            <div className="flex flex-col p-4 space-y-3">
              <a href="#how-it-works" className="py-2 px-4 text-vuilder-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <BookOpen className="h-4 w-4 mr-2 text-vuilder-mint" />
                How It Works
              </a>
              <a href="#samples" className="py-2 px-4 text-vuilder-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <MessageSquare className="h-4 w-4 mr-2 text-vuilder-mint" />
                Sample Words
              </a>
              <a href="#pricing" className="py-2 px-4 text-vuilder-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <DollarSign className="h-4 w-4 mr-2 text-vuilder-mint" />
                Pricing
              </a>
              
              {isLoggedIn && isAdmin && (
                <Link 
                  to="/admin" 
                  className="py-2 px-4 text-vuilder-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center gap-2" 
                  onClick={toggleMenu}
                >
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {isLoggedIn ? (
                <Link to="/dashboard" className="py-2 px-4 bg-vuilder-mint text-white rounded-lg font-medium font-inter flex items-center gap-2" onClick={toggleMenu}>
                  <Sparkles className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="py-2 px-4 text-vuilder-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center gap-2" onClick={toggleMenu}>
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
              
              {!isLoggedIn && (
                <div className="pt-2 space-y-2">
                  <Button className="bg-white border border-vuilder-indigo text-vuilder-indigo hover:bg-vuilder-indigo/10 w-full justify-center" onClick={scrollToSignup}>
                    Start Free Trial
                  </Button>
                  <Button className="bg-vuilder-coral hover:bg-vuilder-coral/90 text-white w-full justify-center" onClick={() => {
                    scrollToSignup();
                    setTimeout(() => {
                      const switchToProButton = document.querySelector('button.text-xs.text-vuilder-mint.underline');
                      if (switchToProButton) {
                        (switchToProButton as HTMLButtonElement).click();
                      }
                    }, 100);
                  }}>
                    Go Pro
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

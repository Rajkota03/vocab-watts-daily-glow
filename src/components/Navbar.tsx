
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronDown, Sparkles, BookOpen, DollarSign, MessageSquare, Settings, Shield } from 'lucide-react';
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-md backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/lovable-uploads/7486a276-d787-490b-a716-26688baba4e0.png" alt="Glintup" className="h-8" />
        </Link>
        
        <button
          className="md:hidden p-2 text-glintup-indigo hover:text-glintup-mint focus:outline-none transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-glintup-text hover:text-glintup-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <BookOpen className="h-4 w-4 mr-1 group-hover:text-glintup-mint" />
            How It Works
          </a>
          <a href="#samples" className="text-glintup-text hover:text-glintup-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <MessageSquare className="h-4 w-4 mr-1 group-hover:text-glintup-mint" />
            Sample Words
          </a>
          <a href="#pricing" className="text-glintup-text hover:text-glintup-mint transition-colors font-medium font-inter text-sm flex items-center group">
            <DollarSign className="h-4 w-4 mr-1 group-hover:text-glintup-mint" />
            Pricing
          </a>
          
          {isLoggedIn && isAdmin && (
            <Link to="/admin" className="text-glintup-text hover:text-glintup-mint transition-colors font-medium font-inter text-sm flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}

          {isLoggedIn ? (
            <Link to="/dashboard" className="text-white bg-glintup-indigo px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="text-glintup-text hover:text-glintup-mint transition-colors font-medium font-inter text-sm flex items-center gap-1">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
          
          {!isLoggedIn && (
            <div className="flex gap-3">
              <Button onClick={scrollToSignup} className="border border-glintup-indigo text-glintup-indigo hover:bg-glintup-indigo/10 shadow-sm bg-stone-50">
                Start Free Trial
              </Button>
              <Button onClick={() => {
                scrollToSignup();
                setTimeout(() => {
                  const switchToProButton = document.querySelector('button.text-xs.text-glintup-mint.underline');
                  if (switchToProButton) {
                    (switchToProButton as HTMLButtonElement).click();
                  }
                }, 100);
              }} className="bg-glintup-coral hover:bg-glintup-coral/90 text-white shadow-md bg-emerald-500 hover:bg-emerald-400">
                Go Pro
              </Button>
            </div>
          )}
        </div>
        
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 md:hidden animate-fade-in">
            <div className="flex flex-col p-4 space-y-3">
              <a href="#how-it-works" className="py-2 px-4 text-glintup-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <BookOpen className="h-4 w-4 mr-2 text-glintup-mint" />
                How It Works
              </a>
              <a href="#samples" className="py-2 px-4 text-glintup-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <MessageSquare className="h-4 w-4 mr-2 text-glintup-mint" />
                Sample Words
              </a>
              <a href="#pricing" className="py-2 px-4 text-glintup-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center" onClick={toggleMenu}>
                <DollarSign className="h-4 w-4 mr-2 text-glintup-mint" />
                Pricing
              </a>
              
              {isLoggedIn && isAdmin && (
                <Link to="/admin" className="py-2 px-4 text-glintup-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center gap-2" onClick={toggleMenu}>
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {isLoggedIn ? (
                <Link to="/dashboard" className="py-2 px-4 bg-glintup-indigo text-white rounded-lg font-medium font-inter flex items-center gap-2" onClick={toggleMenu}>
                  <Sparkles className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="py-2 px-4 text-glintup-text hover:bg-gray-50 rounded-lg font-medium font-inter flex items-center gap-2" onClick={toggleMenu}>
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
              
              {!isLoggedIn && (
                <div className="pt-2 space-y-2">
                  <Button className="bg-white border border-glintup-indigo text-glintup-indigo hover:bg-glintup-indigo/10 w-full justify-center" onClick={scrollToSignup}>
                    Start Free Trial
                  </Button>
                  <Button className="bg-glintup-coral hover:bg-glintup-coral/90 text-white w-full justify-center" onClick={() => {
                    scrollToSignup();
                    setTimeout(() => {
                      const switchToProButton = document.querySelector('button.text-xs.text-glintup-mint.underline');
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

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
      setIsScrolled(window.scrollY > 10); // Trigger slightly earlier
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSignup = () => {
    const signupSection = document.querySelector('#signup-form'); // Assuming the form section has this ID
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Don't show navbar on login page
  if (location.pathname === '/login') return null;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {/* Placeholder for new logo - using text for now */}
          <span className="font-poppins font-bold text-xl text-primary">GlintUP</span>
          {/* <img src="/GlintUp_logo_new.svg" alt="GlintUp" className="h-8" /> */}
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-foreground hover:text-primary focus:outline-none transition-colors" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#samples" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Sample Words
          </a>
          <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Pricing
          </a>
          
          {isLoggedIn && isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
              <Settings className="h-4 w-4" /> Admin
            </Link>
          )}

          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
               <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-primary">
                 Login
               </Button>
            </Link>
          )}
          
          {!isLoggedIn && (
            <Button onClick={scrollToSignup} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free Trial
            </Button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background shadow-lg border-t border-border md:hidden animate-accordion-down">
            <div className="flex flex-col p-4 space-y-2">
              <a href="#how-it-works" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center" onClick={toggleMenu}>
                <BookOpen className="h-4 w-4 mr-2 text-primary" /> How It Works
              </a>
              <a href="#samples" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center" onClick={toggleMenu}>
                <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Sample Words
              </a>
              <a href="#pricing" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center" onClick={toggleMenu}>
                <DollarSign className="h-4 w-4 mr-2 text-primary" /> Pricing
              </a>
              
              {isLoggedIn && isAdmin && (
                <Link to="/admin" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center gap-2" onClick={toggleMenu}>
                  <Settings className="h-4 w-4 text-primary" /> Admin Dashboard
                </Link>
              )}

              {isLoggedIn ? (
                <Link to="/dashboard" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center gap-2" onClick={toggleMenu}>
                  <Sparkles className="h-4 w-4 text-primary" /> Dashboard
                </Link>
              ) : (
                <Link to="/login" className="py-2 px-3 text-foreground hover:bg-muted rounded-md font-medium flex items-center gap-2" onClick={toggleMenu}>
                  <LogIn className="h-4 w-4 text-primary" /> Login
                </Link>
              )}
              
              {!isLoggedIn && (
                <div className="pt-3 border-t border-border">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-center" onClick={scrollToSignup}>
                    Start Free Trial
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


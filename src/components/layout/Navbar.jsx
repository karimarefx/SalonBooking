import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => {
    return isActive(path)
      ? 'text-primary font-semibold border-b-2 border-primary pb-1 hover:text-primary-container transition-colors duration-300'
      : 'text-secondary font-medium hover:text-primary-container transition-colors duration-300';
  };

  const mobileLinkClass = (path) => {
    return isActive(path)
      ? 'text-primary font-semibold text-lg border-l-4 border-primary pl-3 py-2'
      : 'text-secondary font-medium text-lg pl-4 py-2 hover:text-primary transition-colors';
  };

  return (
    <header className="bg-surface sticky top-0 z-50 w-full shadow-sm border-b border-outline-variant/30">
      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        
        {/* Brand/Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          {/* Logo (Desktop) */}
          <button 
            className="hidden md:flex items-baseline gap-2 font-display-lg text-display-lg text-primary tracking-tight cursor-pointer focus:outline-none" 
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
          >
            <span>Miraia</span>
            <span className="font-body-sm text-body-sm font-medium text-secondary tracking-normal opacity-80">· Beauty Booking</span>
          </button>
          {/* Logo (Mobile) */}
          <button 
            className="md:hidden flex items-baseline gap-1.5 font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight cursor-pointer focus:outline-none" 
            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
          >
            <span>Miraia</span>
            <span className="font-label-md text-label-md font-medium text-secondary tracking-normal opacity-75">· Beauty Booking</span>
          </button>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-body-md">
            <button className={linkClass('/')} onClick={() => navigate('/')}>Explore</button>
            <button className={linkClass('/search')} onClick={() => navigate('/search')}>Salons</button>
            <button className={linkClass('/about')} onClick={() => navigate('/about')}>About</button>
          </nav>
        </div>

        {/* Desktop Actions & Icons */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 font-body-md">
            {isAuthenticated ? (
              <>
                <button 
                  className="text-primary font-semibold hover:text-primary-container transition-colors duration-300" 
                  onClick={() => navigate('/owner/dashboard')}
                >
                  Owner Dashboard
                </button>
                <button 
                  className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  className="text-primary font-medium hover:text-primary-container transition-colors duration-300" 
                  onClick={() => navigate('/owner/portal')}
                >
                  List Your Salon
                </button>
                <button 
                  className="text-secondary font-medium hover:text-primary-container transition-colors duration-300" 
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
          
          {/* Calendar & Profile Icons */}
          <div className="flex items-center gap-3">
            <button 
              aria-label="View bookings" 
              onClick={() => navigate('/account/bookings')} 
              className="text-secondary hover:text-primary-container active:scale-95 transition-transform duration-200 focus:outline-none"
            >
              <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
            </button>
            
            <button 
              aria-label="Profile/Account" 
              onClick={() => navigate(isAuthenticated ? '/owner/dashboard' : '/login')} 
              className="text-secondary hover:text-primary-container active:scale-95 transition-transform duration-200 focus:outline-none"
            >
              <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-secondary hover:text-primary-container active:scale-95 transition-transform duration-200 focus:outline-none ml-2"
            >
              <span className="material-symbols-outlined block text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Menu Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-surface h-full shadow-lg border-l border-outline-variant/30 ml-auto z-50 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <span className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">Miraia</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary hover:text-primary focus:outline-none"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-4 font-body-md">
              <button 
                className={mobileLinkClass('/')} 
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              >
                Explore
              </button>
              <button 
                className={mobileLinkClass('/search')} 
                onClick={() => { navigate('/search'); setMobileMenuOpen(false); }}
              >
                Salons
              </button>
              <button 
                className={mobileLinkClass('/about')} 
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
              >
                About
              </button>
              <button 
                className={mobileLinkClass('/account/bookings')} 
                onClick={() => { navigate('/account/bookings'); setMobileMenuOpen(false); }}
              >
                Check Bookings
              </button>
            </nav>

            <div className="border-t border-outline-variant/30 pt-6 flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 text-xs text-secondary truncate">
                    Signed in as:<br/>
                    <span className="font-semibold text-on-surface">{user?.email}</span>
                  </div>
                  <button 
                    className="w-full bg-primary-container text-on-primary font-semibold py-2.5 px-4 rounded-lg text-center hover:bg-primary-container/90 transition-colors"
                    onClick={() => { navigate('/owner/dashboard'); setMobileMenuOpen(false); }}
                  >
                    Owner Dashboard
                  </button>
                  <button 
                    className="w-full border border-outline-variant text-secondary font-medium py-2 px-4 rounded-lg hover:bg-surface-container transition-colors"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="w-full bg-primary-container text-on-primary font-semibold py-2.5 px-4 rounded-lg text-center hover:bg-primary-container/90 transition-colors"
                    onClick={() => { navigate('/owner/portal'); setMobileMenuOpen(false); }}
                  >
                    List Your Salon
                  </button>
                  <button 
                    className="w-full border border-outline-variant text-secondary font-medium py-2 px-4 rounded-lg hover:bg-surface-container transition-colors"
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

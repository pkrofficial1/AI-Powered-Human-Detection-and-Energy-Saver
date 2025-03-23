import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, LayoutDashboard, LogIn, Sun, Moon, LogOut, Clock, Shield, Zap } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'navbar-scroll' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Home className={`h-8 w-8 ${scrolled ? 'text-blue-600' : 'text-white'}`} />
              <span className={`text-xl font-bold ${
                scrolled 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                  : 'text-white'
              }`}>SmartHome</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`nav-link ${
                  scrolled 
                    ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${
                      scrolled 
                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/energy" 
                    className={`nav-link flex items-center space-x-1 ${
                      scrolled 
                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Energy</span>
                  </Link>
                  <Link 
                    to="/schedule" 
                    className={`nav-link flex items-center space-x-1 ${
                      scrolled 
                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Schedule</span>
                  </Link>
                  <Link 
                    to="/security" 
                    className={`nav-link flex items-center space-x-1 ${
                      scrolled 
                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </Link>
                </>
              )}
              {!isLoggedIn && (
                <Link 
                  to="/login" 
                  className={`nav-link ${
                    scrolled 
                      ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className={`nav-link flex items-center space-x-1 ${
                    scrolled 
                      ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                scrolled 
                  ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="mobile-nav-link">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="mobile-nav-link">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/energy" className="mobile-nav-link">
                  <Zap className="h-5 w-5" />
                  <span>Energy</span>
                </Link>
                <Link to="/schedule" className="mobile-nav-link">
                  <Clock className="h-5 w-5" />
                  <span>Schedule</span>
                </Link>
                <Link to="/security" className="mobile-nav-link">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </Link>
              </>
            )}
            {!isLoggedIn ? (
              <Link to="/login" className="mobile-nav-link">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="mobile-nav-link w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
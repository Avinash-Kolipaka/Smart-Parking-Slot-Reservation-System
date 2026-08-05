import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Compass, Menu, X, Bell, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load user notifications
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/users/profile'); // user details contains info
          // Fetch notifications via endpoint
          const res = await api.get('/auth/me');
        } catch (err) {
          // Fallback silences errors
        }
      };
      
      // Seed notifications state or poll
      setNotifications([
        { id: '1', message: 'Welcome to SpotFlow! Secure your first slot.', read: false, createdAt: new Date() }
      ]);
    }
  }, [user]);

  // Handle header scroll transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const activeLinkClass = "text-blue-400 font-semibold";
  const inactiveLinkClass = "text-slate-300 hover:text-white transition-colors";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b backdrop-blur-md ${
        isScrolled
          ? 'bg-slate-950/80 border-slate-900/80 shadow-lg shadow-black/10 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Compass className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight font-display bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SpotFlow
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={location.pathname === '/' ? activeLinkClass : inactiveLinkClass}
          >
            Home
          </Link>
          <Link
            to="/locations"
            className={location.pathname.startsWith('/locations') ? activeLinkClass : inactiveLinkClass}
          >
            Find Parking
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === '/dashboard' ? activeLinkClass : inactiveLinkClass}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className={location.pathname === '/history' ? activeLinkClass : inactiveLinkClass}
              >
                My Bookings
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* Admin Dashboard shortcut */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 bg-indigo-950/20 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  <ShieldCheck size={14} />
                  Admin Console
                </Link>
              )}

              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white transition-colors"
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl p-4 glow-blue backdrop-blur-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold font-display text-sm text-slate-200">Alerts</h4>
                      <button className="text-xs text-blue-400 hover:underline">Mark all read</button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="text-xs p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl">
                          <p className="text-slate-300">{n.message}</p>
                          <span className="text-[10px] text-slate-500 block mt-1">Just now</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900/80 transition-colors"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt="profile"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-300 max-w-[80px] truncate">{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl py-2 backdrop-blur-lg">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white border-t border-slate-800/40"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-slate-800/50 hover:text-rose-300 border-t border-slate-800/40"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm font-semibold rounded-xl">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950/95 border-b border-slate-900 py-6 px-6 flex flex-col gap-4 shadow-xl backdrop-blur-lg">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/locations"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Find Parking
          </Link>
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-slate-300 hover:text-white border-t border-slate-900 pt-3"
              >
                My Profile
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-rose-400 hover:text-rose-300 text-left mt-2 flex items-center gap-1"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <div className="flex flex-col gap-3 border-t border-slate-900 pt-4 mt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-sm font-semibold text-slate-300 hover:text-white py-2">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary py-2 rounded-xl text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

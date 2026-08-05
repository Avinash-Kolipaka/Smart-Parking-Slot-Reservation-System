import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Users, MapPin, Grid, ScanLine, FileBarChart2, 
  ArrowLeft, LogOut, ShieldAlert 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'QR Validator', path: '/admin/scan', icon: ScanLine },
    { name: 'Manage Locations', path: '/admin/locations', icon: MapPin },
    { name: 'Manage Slots', path: '/admin/slots', icon: Grid },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'System Reports', path: '/admin/reports', icon: FileBarChart2 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-900 backdrop-blur-md shrink-0 flex flex-col pt-6">
        
        {/* Profile Branding */}
        <div className="px-6 pb-6 border-b border-slate-900/60 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-slate-100 font-display">Control Console</h4>
            <span className="text-[10px] uppercase font-bold text-indigo-400">Admin Mode</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Quick exit to client space */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 mt-8 border-t border-slate-900/60 pt-4"
          >
            <ArrowLeft size={16} />
            <span>Customer App</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 text-left w-full mt-2"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Footer profile log */}
        {user && (
          <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center gap-3 mt-auto">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
              alt="avatar"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-slate-300 truncate">{user.name}</p>
              <span className="text-[9px] text-slate-500 font-mono truncate block">{user.email}</span>
            </div>
          </div>
        )}

      </aside>

      {/* Main Admin Page Area */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        
        {/* Quick safety banner */}
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between bg-slate-900/10 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-950/10">
            <ShieldAlert size={14} />
            <span>Protected Admin Area</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Pages Injector */}
        <section className="flex-1 p-6 md:p-8 flex flex-col">
          <Outlet />
        </section>

      </main>

    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { Compass, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950/80 border-t border-slate-900 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Compass className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight font-display bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SpotFlow
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find, reserve, and manage premium parking slots in seconds. Designed to simplify your city commute.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 font-display">
              Navigate
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="/locations" className="hover:text-blue-400 transition-colors">Search Slots</a></li>
              <li><a href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="/profile" className="hover:text-blue-400 transition-colors">Profile</a></li>
            </ul>
          </div>

          {/* Security Rules */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 font-display">
              Reservation Rules
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>15-Minute Grace Period</li>
              <li>Single Active Reservation</li>
              <li>Easy QR Check-in/out</li>
              <li>Simulated Instant Refunds</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 font-display">
              Contact Support
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                <span>support@spotflow.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                <span>+1 (555) 012-3456</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SpotFlow Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

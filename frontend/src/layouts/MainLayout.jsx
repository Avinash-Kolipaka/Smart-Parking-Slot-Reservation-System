import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top Header Navigation */}
      <Navbar />
      
      {/* Route Content Area */}
      <main className="flex-1 pt-28 pb-16 flex flex-col">
        <Outlet />
      </main>

      {/* Footer Area */}
      <Footer />
    </div>
  );
};

export default MainLayout;

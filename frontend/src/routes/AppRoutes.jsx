import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout shells
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ParkingLocations from '../pages/ParkingLocations';
import ParkingDetails from '../pages/ParkingDetails';
import NotFound from '../pages/NotFound';

// Protected pages
import Dashboard from '../pages/Dashboard';
import SlotSelection from '../pages/SlotSelection';
import BookingPage from '../pages/BookingPage';
import BookingSuccess from '../pages/BookingSuccess';
import BookingHistory from '../pages/BookingHistory';
import Profile from '../pages/Profile';

// Admin pages
import AdminDashboard from '../pages/AdminDashboard';
import ManageUsers from '../pages/ManageUsers';
import ManageParking from '../pages/ManageParking';
import ManageSlots from '../pages/ManageSlots';
import Reports from '../pages/Reports';
import QRScanner from '../components/QRScanner'; // Render QR scanner component directly on a page

// Route Guard: Requires login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Route Guard: Requires admin role
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      
      {/* Customer / Public Layout */}
      <Route path="/" element={<MainLayout />}>
        
        {/* Public paths */}
        <Route index element={<Landing />} />
        <Route path="locations" element={<ParkingLocations />} />
        <Route path="locations/:id" element={<ParkingDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:resetToken" element={<ResetPassword />} />

        {/* Private paths */}
        <Route path="dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="locations/:id/reserve" element={
          <PrivateRoute>
            <SlotSelection />
          </PrivateRoute>
        } />
        <Route path="bookings/:id/checkout" element={
          <PrivateRoute>
            <BookingPage />
          </PrivateRoute>
        } />
        <Route path="bookings/:id/success" element={
          <PrivateRoute>
            <BookingSuccess />
          </PrivateRoute>
        } />
        <Route path="history" element={
          <PrivateRoute>
            <BookingHistory />
          </PrivateRoute>
        } />
        <Route path="profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

      </Route>

      {/* Admin Layout */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="scan" element={
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-display text-slate-100">QR Code Ticket Scan</h1>
              <p className="text-xs text-slate-400">Check in or check out customers by scanning their reservation confirmation tickets.</p>
            </div>
            <div className="glass-card p-6 bg-slate-900/20">
              <QRScanner />
            </div>
          </div>
        } />
        <Route path="locations" element={<ManageParking />} />
        <Route path="slots" element={<ManageSlots />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;

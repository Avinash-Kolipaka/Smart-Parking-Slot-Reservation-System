import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Car, Clock, MapPin, Compass, History, UserCheck, 
  AlertTriangle, Calendar, RefreshCcw, Bell, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data.data.bookings);
      
      // Seed notifications list
      setNotifications([
        { id: '1', message: 'Payment of $10.00 successful for ticket PRK-20260728-E192B4. Your slot is confirmed!', type: 'PaymentSuccess', date: new Date() },
        { id: '2', message: 'Welcome to SpotFlow! Add a registered vehicle to start.', type: 'General', date: new Date() }
      ]);
    } catch (err) {
      console.error('Failed to retrieve dashboard info:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter current active/confirmed reservations
  const activeBooking = bookings.find(b => ['Pending', 'Confirmed', 'Active'].includes(b.bookingStatus));

  // Aggregate statistics
  const totalReservations = bookings.length;
  const completedReservations = bookings.filter(b => b.bookingStatus === 'Completed').length;
  const totalSpent = bookings.reduce((sum, b) => b.paymentStatus === 'Paid' ? sum + b.amount : sum, 0);

  // Profile completion status
  let profileScore = 30; // base register
  if (user?.phone) profileScore += 30;
  if (user?.vehicles?.length > 0) profileScore += 40;

  return (
    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8">
      
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-100">
            Hello, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400">Manage your reservations, tickets, and vehicle details.</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="md:col-span-2 h-64 bg-slate-900/30 border border-slate-900 rounded-2xl" />
          <div className="h-64 bg-slate-900/30 border border-slate-900 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Active Ticket Console */}
            {activeBooking ? (
              <GlassCard className="p-6 border-blue-500/30 bg-gradient-to-r from-blue-950/10 via-indigo-950/10 to-slate-900/40 relative overflow-hidden">
                {/* Decorative border accent */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-500" />
                
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex-1 flex flex-col gap-4">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded border border-blue-900/30">
                        {activeBooking.bookingStatus} Ticket
                      </span>
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        Ref: {activeBooking.bookingId}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-bold font-display text-slate-100">
                        {activeBooking.locationId?.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-500" />
                        {activeBooking.locationId?.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">SLOT LOCATION</span>
                        <span className="text-slate-200">
                          Zone {activeBooking.slotId?.parkingZone} | Floor {activeBooking.slotId?.floor} | Spot {activeBooking.slotId?.slotNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">VEHICLE PLATE</span>
                        <span className="text-slate-200">{activeBooking.vehicleNumber}</span>
                      </div>
                    </div>

                    {activeBooking.bookingStatus === 'Confirmed' && (
                      <div className="flex items-center gap-2 p-3 border border-amber-500/20 bg-amber-950/10 text-amber-400 rounded-xl text-[11px] leading-relaxed">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>
                          <strong>Check-in Deadline:</strong> Attendant must scan your QR ticket within 15 minutes of reservation start time.
                        </span>
                      </div>
                    )}

                  </div>

                  {/* QR Image Box */}
                  <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 self-center">
                    {activeBooking.qrUrl ? (
                      <img
                        src={activeBooking.qrUrl}
                        alt="booking qr"
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        Loading QR...
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-1">
                      Present at gate
                    </span>
                  </div>

                </div>

                <div className="flex justify-end gap-3 border-t border-slate-900/60 mt-6 pt-4">
                  {activeBooking.bookingStatus === 'Pending' && (
                    <Link
                      to={`/bookings/${activeBooking._id}/checkout`}
                      className="btn-primary py-2 px-5 text-xs font-bold rounded-lg"
                    >
                      Process Payment (${activeBooking.amount})
                    </Link>
                  )}
                  <Link
                    to="/history"
                    className="btn-secondary py-2 px-5 text-xs font-bold rounded-lg"
                  >
                    View History
                  </Link>
                </div>

              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center flex flex-col items-center justify-center gap-4 bg-slate-900/20 border-dashed border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center">
                  <Compass size={22} className="animate-spin-slow" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h3 className="font-bold text-base text-slate-200 font-display">No Active Reservation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reserve a slot ahead of time at one of our downtown parking structures and bypass traffic delays.
                  </p>
                </div>
                <Link to="/locations" className="btn-primary py-2.5 px-6 text-xs font-semibold rounded-xl">
                  Browse Parking Lots
                </Link>
              </GlassCard>
            )}

            {/* General Activity Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <GlassCard className="p-5 flex flex-col gap-2 bg-slate-900/20">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Bookings</span>
                <span className="text-2xl font-bold font-display text-slate-100">{totalReservations}</span>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col gap-2 bg-slate-900/20">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completed Trips</span>
                <span className="text-2xl font-bold font-display text-slate-100">{completedReservations}</span>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col gap-2 bg-slate-900/20">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Expenses</span>
                <span className="text-2xl font-bold font-display text-slate-100">${totalSpent.toFixed(2)}</span>
              </GlassCard>

            </div>

          </div>

          {/* Sidebar Column */}
          <div className="flex flex-col gap-8">
            
            {/* Profile Status */}
            <GlassCard className="p-6 bg-slate-900/20 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">
                Profile Integrity
              </h3>
              
              <div className="flex items-center gap-3">
                <img
                  src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt="avatar"
                  className="w-11 h-11 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-200 leading-tight">{user?.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400 capitalize">{user?.role}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-slate-400">Completion Score</span>
                  <span className="text-blue-400">{profileScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
              </div>

              {profileScore < 100 && (
                <Link
                  to="/profile"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-1"
                >
                  Configure vehicles & phone number
                  <ArrowRight size={12} />
                </Link>
              )}
            </GlassCard>

            {/* Notification alert lists */}
            <GlassCard className="p-6 bg-slate-900/20 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">
                  Notifications Log
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {notifications.map(n => (
                  <div key={n.id} className="text-xs p-3 bg-slate-950/40 border border-slate-900/60 rounded-xl leading-relaxed">
                    <p className="text-slate-300">{n.message}</p>
                    <span className="text-[9px] text-slate-500 block mt-1">Just now</span>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;

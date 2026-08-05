import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import {
  History, MapPin, Clock, Car, Bike, Zap, CheckCircle2,
  XCircle, AlertTriangle, RefreshCcw, Calendar, DollarSign,
  ChevronDown, ChevronUp, QrCode
} from 'lucide-react';

const statusConfig = {
  Pending: { color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-500/20', dot: 'bg-amber-400' },
  Confirmed: { color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-500/20', dot: 'bg-blue-400' },
  Active: { color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-500/20', dot: 'bg-emerald-400' },
  Completed: { color: 'text-slate-400', bg: 'bg-slate-900/40 border-slate-800/40', dot: 'bg-slate-400' },
  Cancelled: { color: 'text-rose-400', bg: 'bg-rose-950/20 border-rose-500/20', dot: 'bg-rose-400' },
  Expired: { color: 'text-orange-400', bg: 'bg-orange-950/20 border-orange-500/20', dot: 'bg-orange-400' },
};

const vehicleIcon = (type) => {
  if (type === 'Bike') return <Bike size={13} />;
  if (type === 'EV') return <Zap size={13} />;
  return <Car size={13} />;
};

const BookingCard = ({ booking, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[booking.bookingStatus] || statusConfig.Completed;
  const canCancel = ['Pending', 'Confirmed'].includes(booking.bookingStatus);

  return (
    <GlassCard className="overflow-hidden">
      {/* Header row */}
      <div
        className="p-5 flex flex-col sm:flex-row justify-between gap-4 cursor-pointer hover:bg-slate-800/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
              {booking.bookingStatus}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">{booking.bookingId}</span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-slate-100 font-display">
              {booking.locationId?.name || 'Unknown Location'}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-blue-500" />
              {booking.locationId?.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold font-display text-slate-100">${booking.amount?.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 font-semibold">
              {booking.paymentStatus === 'Paid' ? '✓ Paid' : booking.paymentStatus}
            </p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-900/60 p-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Slot</span>
              <span className="text-slate-200 font-mono font-semibold">
                Zone {booking.slotId?.parkingZone} | Floor {booking.slotId?.floor} | #{booking.slotId?.slotNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Vehicle</span>
              <span className="text-slate-200 flex items-center gap-1.5">
                {vehicleIcon(booking.vehicleType)}
                {booking.vehicleNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Start Time</span>
              <span className="text-slate-200 font-mono">
                {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Duration</span>
              <span className="text-slate-200">{booking.duration}h</span>
            </div>
          </div>

          {/* QR code if applicable */}
          {booking.qrUrl && (
            <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="p-2 bg-white rounded-lg shrink-0">
                <img src={booking.qrUrl} alt="QR Ticket" className="w-20 h-20 object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 mb-1 font-display">QR Entry Ticket</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Present this QR code to the parking attendant for check-in and check-out.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {canCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                disabled={cancelling === booking._id}
                className="btn-secondary py-2 px-4 text-xs rounded-lg text-rose-400 border-rose-500/20 hover:border-rose-500/40 hover:text-rose-300"
              >
                <XCircle size={14} />
                {cancelling === booking._id ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cancelling, setCancelling] = useState(null);

  const filters = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Expired'];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: 'Cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.bookingStatus === filter);

  // Summary stats
  const totalSpent = bookings.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.amount, 0);
  const completedCount = bookings.filter(b => b.bookingStatus === 'Completed').length;
  const activeCount = bookings.filter(b => ['Pending', 'Confirmed', 'Active'].includes(b.bookingStatus)).length;

  return (
    <div className="max-w-5xl mx-auto px-6 w-full flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-100 flex items-center gap-3">
            <History size={28} className="text-blue-500" />
            Booking History
          </h1>
          <p className="text-xs text-slate-400 mt-1">All your parking reservations and tickets.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Bookings</span>
          <span className="text-2xl font-bold font-display text-slate-100">{bookings.length}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</span>
          <span className="text-2xl font-bold font-display text-emerald-400">{completedCount}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Spent</span>
          <span className="text-2xl font-bold font-display text-blue-400">${totalSpent.toFixed(2)}</span>
        </GlassCard>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 opacity-60">
                {bookings.filter(b => b.bookingStatus === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-900/30 border border-slate-900 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center">
            <Calendar size={24} className="text-slate-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 font-display mb-1">No Bookings Found</h3>
            <p className="text-xs text-slate-500">
              {filter === 'All' ? 'You have not made any reservations yet.' : `No ${filter} bookings.`}
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(b => (
            <BookingCard
              key={b._id}
              booking={b}
              onCancel={handleCancel}
              cancelling={cancelling}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default BookingHistory;

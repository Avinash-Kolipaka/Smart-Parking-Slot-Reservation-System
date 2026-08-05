import React, { useState, useEffect } from 'react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import {
  FileBarChart2, TrendingUp, DollarSign, Car, Clock,
  RefreshCcw, Download, CalendarRange, BarChart3,
  MapPin, Users, Layers
} from 'lucide-react';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, bookingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/analytics'),
        api.get('/bookings')
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute booking status breakdown
  const statusBreakdown = bookings.reduce((acc, b) => {
    acc[b.bookingStatus] = (acc[b.bookingStatus] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + b.amount, 0);
  const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.filter(b => b.paymentStatus === 'Paid').length : 0;
  const cancellationRate = bookings.length > 0 ? ((statusBreakdown['Cancelled'] || 0) / bookings.length * 100).toFixed(1) : 0;

  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Status', 'Vehicle', 'Location', 'Amount', 'Payment', 'Start Time', 'Created'];
    const rows = bookings.map(b => [
      b.bookingId,
      b.bookingStatus,
      b.vehicleNumber,
      b.locationId?.name || '—',
      `$${b.amount?.toFixed(2)}`,
      b.paymentStatus,
      new Date(b.startTime).toLocaleString(),
      new Date(b.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spotflow-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    Pending: '#f59e0b',
    Confirmed: '#3b82f6',
    Active: '#10b981',
    Completed: '#94a3b8',
    Cancelled: '#f43f5e',
    Expired: '#f97316'
  };

  const barMaxVal = Math.max(...(analytics?.peakHours?.map(h => h.count) || [1]));

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">System Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Revenue analytics, booking trends, and system performance insights.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn-secondary py-2 px-3 text-xs rounded-xl">
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExportCSV} className="btn-primary py-2 px-4 text-xs rounded-xl">
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/30 border border-slate-900 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/20 text-emerald-500 border border-emerald-900/20 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-xl font-bold font-display text-slate-100">${totalRevenue.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <div>
                <p className="text-xl font-bold font-display text-slate-100">{bookings.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/20 text-indigo-500 border border-indigo-900/20 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-xl font-bold font-display text-slate-100">${isNaN(avgBookingValue) ? '0.00' : avgBookingValue.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Booking Value</p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-950/20 text-rose-500 border border-rose-900/20 flex items-center justify-center">
                <Car size={16} />
              </div>
              <div>
                <p className="text-xl font-bold font-display text-slate-100">{cancellationRate}%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Rate</p>
              </div>
            </GlassCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Booking Status Breakdown */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Booking Status Breakdown</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400 w-20 shrink-0">{status}</span>
                      <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: statusColors[status] || '#64748b' }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-300 w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
                {Object.keys(statusBreakdown).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No booking data available.</p>
                )}
              </div>
            </GlassCard>

            {/* Peak Hours Chart */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Peak Booking Hours</h3>
              {analytics?.peakHours?.length > 0 ? (
                <div className="flex items-end gap-1.5 h-32">
                  {analytics.peakHours.map((h, i) => {
                    const heightPct = barMaxVal > 0 ? (h.count / barMaxVal) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                        <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-sm group-hover:from-blue-500 group-hover:to-indigo-400 transition-all"
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                            title={`${h.hour}: ${h.count} bookings`}
                          />
                        </div>
                        <span className="text-[8px] text-slate-600 group-hover:text-slate-400 transition-colors">{h.hour?.split(':')[0]}h</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-slate-500">No peak hour data available yet.</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Daily Revenue Chart */}
          {analytics?.dailyRevenue?.length > 0 && (
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Daily Revenue – Last 7 Days</h3>
              <div className="flex items-end gap-4 h-36">
                {analytics.dailyRevenue.map((d, i) => {
                  const maxR = Math.max(...analytics.dailyRevenue.map(x => x.revenue), 1);
                  const h = (d.revenue / maxR) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[9px] text-slate-500 group-hover:text-emerald-400 transition-colors font-mono">${d.revenue.toFixed(0)}</span>
                      <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-md group-hover:from-emerald-500 group-hover:to-teal-400 transition-all"
                          style={{ height: `${Math.max(h, 4)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors">
                        {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Vehicle Distribution */}
          {analytics?.vehicleDistribution?.length > 0 && (
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Vehicle Type Distribution</h3>
              <div className="flex items-center justify-center gap-8">
                {analytics.vehicleDistribution.map((item, i) => {
                  const total = analytics.vehicleDistribution.reduce((s, v) => s + v.count, 0);
                  const pct = total ? Math.round((item.count / total) * 100) : 0;
                  const colors = ['from-blue-500 to-indigo-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500'];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={['#3b82f6', '#f59e0b', '#10b981'][i]}
                            strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-200">{pct}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-300">{item.type}</p>
                        <p className="text-[10px] text-slate-500">{item.count} bookings</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Top Locations */}
          {analytics?.topLocations?.length > 0 && (
            <GlassCard className="p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Top Performing Locations by Revenue</h3>
              <div className="flex flex-col gap-3">
                {analytics.topLocations.map((loc, i) => {
                  const maxRev = analytics.topLocations[0]?.revenue || 1;
                  const pct = Math.round((loc.revenue / maxRev) * 100);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-blue-500 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-300">{loc.name}</span>
                          <span className="text-emerald-400 font-bold">${loc.revenue?.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-600 mt-0.5">{loc.bookingsCount} bookings</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </>
      )}

    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import CreateParkingModal from '../components/CreateParkingModal';
import {
  LayoutDashboard, Users, MapPin, Grid, TrendingUp,
  DollarSign, Car, Clock, AlertCircle, CheckCircle2,
  RefreshCcw, Activity, Building2, Plus, ScanLine,
  FileBarChart2, ArrowRight, Zap, Shield
} from 'lucide-react';

// ─── StatCard ───────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color = 'blue', sub, trend }) => {
  const colorMap = {
    blue: {
      icon: 'text-blue-400 bg-blue-950/30 border-blue-900/30',
      glow: 'hover:border-blue-500/20',
    },
    emerald: {
      icon: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30',
      glow: 'hover:border-emerald-500/20',
    },
    amber: {
      icon: 'text-amber-400 bg-amber-950/30 border-amber-900/30',
      glow: 'hover:border-amber-500/20',
    },
    rose: {
      icon: 'text-rose-400 bg-rose-950/30 border-rose-900/30',
      glow: 'hover:border-rose-500/20',
    },
    indigo: {
      icon: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/30',
      glow: 'hover:border-indigo-500/20',
    },
    violet: {
      icon: 'text-violet-400 bg-violet-950/30 border-violet-900/30',
      glow: 'hover:border-violet-500/20',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <GlassCard className={`p-5 flex flex-col gap-4 group ${c.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.icon} transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-slate-100 tabular-nums">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
      </div>
    </GlassCard>
  );
};

// ─── Quick Action Card ──────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, desc, color, onClick, to }) => {
  const Wrapper = to ? Link : 'button';
  return (
    <Wrapper
      to={to}
      onClick={onClick}
      className={`group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 text-left overflow-hidden
        ${color === 'blue'   ? 'bg-blue-950/20 border-blue-500/20 hover:bg-blue-950/30 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10' : ''}
        ${color === 'violet' ? 'bg-violet-950/20 border-violet-500/20 hover:bg-violet-950/30 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10' : ''}
        ${color === 'emerald'? 'bg-emerald-950/20 border-emerald-500/20 hover:bg-emerald-950/30 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10' : ''}
        ${color === 'amber'  ? 'bg-amber-950/20 border-amber-500/20 hover:bg-amber-950/30 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10' : ''}
      `}
    >
      {/* Glow orb */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl
        ${color === 'blue' ? 'bg-blue-500' : color === 'violet' ? 'bg-violet-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}
      `} />

      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300
        ${color === 'blue'   ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : ''}
        ${color === 'violet' ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : ''}
        ${color === 'emerald'? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : ''}
        ${color === 'amber'  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : ''}
      `}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-200 font-display">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ArrowRight size={13} className={`self-end transition-transform group-hover:translate-x-1 duration-200
        ${color === 'blue' ? 'text-blue-500' : color === 'violet' ? 'text-violet-500' : color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}
      `} />
    </Wrapper>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, bookingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/analytics'),
        api.get('/bookings'),
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setRecentBookings(bookingsRes.data.data.slice(0, 8));
    } catch (err) {
      console.error('Failed to load admin dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreated = (building) => {
    setNewlyCreated(building);
    fetchData(); // Refresh stats
  };

  const bookingStatusColors = {
    Pending:   'text-amber-400 bg-amber-950/20 border-amber-500/20',
    Confirmed: 'text-blue-400 bg-blue-950/20 border-blue-500/20',
    Active:    'text-emerald-400 bg-emerald-950/20 border-emerald-500/20',
    Completed: 'text-slate-400 bg-slate-900/40 border-slate-800/40',
    Cancelled: 'text-rose-400 bg-rose-950/20 border-rose-500/20',
    Expired:   'text-orange-400 bg-orange-950/20 border-orange-500/20',
  };

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <LayoutDashboard size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Admin Console</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">System overview, live statistics, and quick actions.</p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* ── Newly Created Banner ── */}
      {newlyCreated && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-300 font-display">Parking Building Created!</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              <strong>{newlyCreated.name}</strong> at {newlyCreated.address} is now live.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/admin/locations"
              className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/20 transition-all"
            >
              View <ArrowRight size={11} />
            </Link>
            <button
              onClick={() => setNewlyCreated(null)}
              className="text-[11px] text-slate-500 hover:text-slate-400 px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all"
            >✕</button>
          </div>
        </div>
      )}

      {/* ── CREATE PARKING BUILDING — HERO CARD ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-blue-500/25 p-6 cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, rgba(29,78,216,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(15,23,42,0.6) 100%)',
        }}
        onClick={() => setShowCreateModal(true)}
      >
        {/* Decorative glows */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-600/10 blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-indigo-600/10 blur-2xl group-hover:bg-indigo-600/20 transition-all duration-500" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Building2 size={26} className="text-white" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Quick Action</span>
              <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">• Admin</span>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-100 group-hover:text-white transition-colors">
              Create Parking Building
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Set up a new parking facility — define location, floors, vehicle types, hours, and pricing with a guided step-by-step wizard.
            </p>
          </div>

          {/* CTA Button */}
          <button
            id="create-parking-btn"
            className="btn-primary py-3 px-6 text-sm rounded-xl shrink-0 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all duration-300"
            onClick={(e) => { e.stopPropagation(); setShowCreateModal(true); }}
          >
            <Plus size={16} />
            New Building
          </button>
        </div>

        {/* Feature tags */}
        <div className="relative flex gap-2 flex-wrap mt-5 pt-4 border-t border-slate-800/60">
          {['Multi-floor support', 'Vehicle type config', 'GPS coordinates', 'Pricing rules', 'Instant activation'].map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-900/40 px-2.5 py-1 rounded-full border border-slate-800/60">
              <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/30 border border-slate-900 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard label="Total Users"       value={stats.totalUsers}         icon={Users}       color="blue"    />
            <StatCard label="Parking Areas"     value={stats.totalParkingAreas}  icon={MapPin}      color="indigo"  />
            <StatCard label="Total Slots"       value={stats.totalSlots}         icon={Grid}        color="violet"  />
            <StatCard label="Available Slots"   value={stats.availableSlots}     icon={CheckCircle2}color="emerald" />
            <StatCard label="Occupied Slots"    value={stats.occupiedSlots}      icon={Car}         color="amber"   />
            <StatCard label="Today's Bookings"  value={stats.todaysBookings}     icon={Activity}    color="blue"    />
            <StatCard label="Pending Payments"  value={stats.pendingBookings}    icon={Clock}       color="amber"   sub="Awaiting checkout" />
            <StatCard
              label="Revenue Today"
              value={`$${stats.revenueToday?.toFixed(2) || '0.00'}`}
              icon={DollarSign}
              color="emerald"
              sub={`Month: $${stats.revenueThisMonth?.toFixed(2) || '0.00'}`}
            />
          </div>

          {/* ── Quick Actions Grid ── */}
          <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                icon={Building2}
                label="Manage Locations"
                desc="Add, edit, and configure parking facilities"
                color="blue"
                to="/admin/locations"
              />
              <QuickAction
                icon={Grid}
                label="Manage Slots"
                desc="Configure individual parking slots per floor"
                color="violet"
                to="/admin/slots"
              />
              <QuickAction
                icon={Users}
                label="Manage Users"
                desc="View and manage registered user accounts"
                color="emerald"
                to="/admin/users"
              />
              <QuickAction
                icon={FileBarChart2}
                label="System Reports"
                desc="Revenue analytics and booking reports"
                color="amber"
                to="/admin/reports"
              />
            </div>
          </div>

          {/* ── Analytics Panel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Vehicle Distribution */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Vehicle Distribution</h3>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">All Bookings</span>
              </div>
              <div className="flex flex-col gap-3">
                {analytics?.vehicleDistribution?.length > 0 ? analytics.vehicleDistribution.map((item, i) => {
                  const total = analytics.vehicleDistribution.reduce((s, v) => s + v.count, 0);
                  const pct = total ? Math.round((item.count / total) * 100) : 0;
                  const colors = ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500'];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400 w-10">{item.type}</span>
                      <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-300 w-20 text-right tabular-nums">{item.count} <span className="text-slate-600">({pct}%)</span></span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-500 text-center py-4">No booking data yet.</p>
                )}
              </div>
            </GlassCard>

            {/* Top Locations */}
            <GlassCard className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Top Revenue Locations</h3>
                <Link to="/admin/reports" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Full report <ArrowRight size={10} />
                </Link>
              </div>
              <div className="flex flex-col gap-1">
                {analytics?.topLocations?.length > 0 ? analytics.topLocations.map((loc, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-900/60 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border ${
                        i === 0 ? 'bg-amber-950/30 text-amber-400 border-amber-500/20' :
                        i === 1 ? 'bg-slate-800/60 text-slate-400 border-slate-700/40' :
                        'bg-slate-900/40 text-slate-600 border-slate-800/40'
                      }`}>{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{loc.name}</p>
                        <p className="text-[9px] text-slate-500">{loc.bookingsCount} bookings</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">${loc.revenue?.toFixed(2)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 text-center py-4">No revenue data yet.</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* ── Recent Bookings ── */}
          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Recent System Bookings</h3>
              <Link to="/admin/reports" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight size={10} />
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      <th className="text-left pb-3 pr-4">Booking ID</th>
                      <th className="text-left pb-3 pr-4">Location</th>
                      <th className="text-left pb-3 pr-4">Vehicle</th>
                      <th className="text-left pb-3 pr-4">Amount</th>
                      <th className="text-left pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {recentBookings.map(b => (
                      <tr key={b._id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 pr-4 font-mono text-slate-300 font-bold">{b.bookingId}</td>
                        <td className="py-3 pr-4 text-slate-400">{b.locationId?.name || '—'}</td>
                        <td className="py-3 pr-4 font-mono text-slate-400">{b.vehicleNumber}</td>
                        <td className="py-3 pr-4 text-slate-200 font-bold tabular-nums">${b.amount?.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${bookingStatusColors[b.bookingStatus] || ''}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <AlertCircle size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Failed to load dashboard data.</p>
          <button onClick={fetchData} className="btn-secondary py-2 px-4 text-xs rounded-xl mt-4">
            <RefreshCcw size={13} />Retry
          </button>
        </GlassCard>
      )}

      {/* ── Create Parking Modal ── */}
      <CreateParkingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />

    </div>
  );
};

export default AdminDashboard;

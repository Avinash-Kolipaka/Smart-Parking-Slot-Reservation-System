import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { 
  Search, ShieldCheck, MapPin, Clock, CreditCard, 
  BarChart3, Zap, HelpCircle, Building2, QrCode,
  Users, TrendingUp, Lock, Globe, ArrowRight
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/locations?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/locations');
    }
  };

  const stats = [
    { value: '5+', label: 'Demo Locations' },
    { value: '100+', label: 'Parking Slots' },
    { value: 'Real-time', label: 'Slot Sync' },
    { value: '99.9%', label: 'QR Verification' }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Availability',
      desc: 'Live slot occupancy maps update instantly via Socket.IO. Reserve before you arrive — no stale data, ever.'
    },
    {
      icon: QrCode,
      title: 'QR Code Check-In',
      desc: 'Receive a cryptographically signed QR pass after booking. The operator scans it at the gate to check you in.'
    },
    {
      icon: BarChart3,
      title: 'Operations Analytics',
      desc: 'Revenue trends, occupancy rates, and demand forecasting for parking operators — all in a unified dashboard.'
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tenant Security',
      desc: 'Full RBAC with role-based access (User, Manager, Admin, Super Admin). Data isolation across all tenants.'
    },
    {
      icon: Building2,
      title: 'Multi-Location Management',
      desc: 'Manage multiple parking facilities, floors, zones, and vehicle types from a single admin dashboard.'
    },
    {
      icon: Zap,
      title: 'Concurrency Protection',
      desc: 'Redis distributed locks prevent double-booking under simultaneous high-demand. Atomic slot reservation.'
    }
  ];

  const userflows = [
    {
      step: '01',
      title: 'Search & Discover',
      desc: 'Filter parking by city, vehicle type, price range, and proximity. See real-time availability instantly.'
    },
    {
      step: '02',
      title: 'Select & Book',
      desc: 'Choose your slot from an interactive floor/zone map. Enter your vehicle details and confirm in seconds.'
    },
    {
      step: '03',
      title: 'Pay & Get QR Pass',
      desc: 'Complete payment and receive a signed QR code ticket for entry. Check your booking history anytime.'
    },
    {
      step: '04',
      title: 'Scan & Park',
      desc: 'Present your QR at the gate. The operator scans to check in and out. Your slot is released automatically.'
    }
  ];

  const forDrivers = [
    'Search parking near your destination',
    'Book in advance or on-demand',
    'Secure QR code entry — no physical ticket',
    'View booking history and receipts',
    'Real-time notifications for booking status',
    'Support for Cars, Bikes, and EV vehicles'
  ];

  const forOperators = [
    'Manage multiple facilities from one dashboard',
    'Create and configure floors, zones, and slot types',
    'Scan QR codes at gate to check in / check out',
    'Monitor live occupancy across all locations',
    'View revenue analytics and occupancy trends',
    'Manage user accounts and access roles'
  ];

  const techHighlights = [
    { label: 'Backend', value: 'Node.js + Express REST API' },
    { label: 'Database', value: 'MongoDB Atlas + Mongoose' },
    { label: 'Real-time', value: 'Socket.IO + Redis Pub/Sub' },
    { label: 'Cloud', value: 'AWS ECS, CloudFront, ALB' },
    { label: 'Auth', value: 'JWT (HS256) + Refresh Tokens' },
    { label: 'Infra as Code', value: 'Terraform + GitHub Actions' }
  ];

  const faqs = [
    {
      q: 'How does QR Code check-in work?',
      a: 'After confirming a booking, a cryptographically signed QR code pass is generated (HMAC-SHA256). When you arrive, the parking operator scans it to verify authenticity and check you in. This updates your booking to Active and marks the slot as Occupied in real-time.'
    },
    {
      q: 'How is double-booking prevented?',
      a: 'ParkOps uses a two-layer concurrency guard: a Redis distributed lock (atomic NX SET) is acquired before checking the database, and a compound database index enforces the overlap check. Even under simultaneous concurrent requests, only one booking can succeed for the same slot and time window.'
    },
    {
      q: 'Is there a booking grace period?',
      a: 'Yes. A background cron job runs every 5 minutes. If a booking is not paid within 15 minutes of creation (or not checked in within 15 minutes of the start time), it is automatically expired and the slot is released back to the pool.'
    },
    {
      q: 'What types of vehicles are supported?',
      a: 'ParkOps supports Standard Cars, Motorbikes, and EV (Electric Vehicles) slots. EV slots carry a slight pricing premium. Slot types are configured per floor/zone by the parking operator.'
    },
    {
      q: 'How does multi-tenancy work?',
      a: 'Each tenant (parking operator organization) has a fully isolated data scope. Every API request includes an X-Tenant-Id header. The middleware verifies the user has active membership in that tenant before any data access. Cross-tenant data leakage is prevented at the API layer.'
    }
  ];

  return (
    <div className="flex flex-col gap-24 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-24 md:py-32 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-indigo-600/6 blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/20 px-4 py-2 border border-blue-500/20 rounded-full mb-6">
          <Zap size={14} className="text-blue-500 animate-pulse" />
          <span>Multi-Tenant Smart Parking SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-[1.1] mb-6 text-slate-100">
          Smart Parking for<br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Modern Cities
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-4">
          ParkOps is a full-stack parking operations platform — real-time slot reservation, 
          QR check-in/out, multi-tenant management, analytics, and role-based administration.
        </p>
        
        <p className="text-xs text-slate-600 mb-10 italic">
          ⚡ Built with MERN · Redis · Socket.IO · AWS · Docker · Terraform
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl bg-slate-900/60 border border-slate-800/80 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 backdrop-blur-md shadow-2xl shadow-blue-500/5">
          <div className="flex-1 flex items-center gap-3 px-4 py-3">
            <MapPin className="text-blue-500 shrink-0" size={20} />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search by city, parking lot name, address..."
              className="bg-transparent text-slate-200 placeholder-slate-500 text-sm font-medium w-full focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-primary py-3 px-8 text-sm font-semibold rounded-xl shrink-0 flex items-center gap-2">
            <Search size={16} />
            Find Parking
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <span className="text-xs text-slate-600 flex items-center gap-1"><Lock size={10} className="text-green-500" /> Demo — No real payments</span>
          <span className="text-xs text-slate-600">·</span>
          <button onClick={() => navigate('/login')} className="text-xs text-blue-500 hover:text-blue-400 underline underline-offset-2">Admin Demo (admin@parkops.local)</button>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-slate-900/10 border-y border-slate-900/80 backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold font-display text-blue-500 mb-1">
                {stat.value}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
            Built for Real Operations
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every feature is production-engineered — from atomic concurrency control to real-time 
            slot broadcasts, QR security, and multi-tenant data isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <GlassCard key={i} className="p-6 flex flex-col gap-4 hover:border-blue-800/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-slate-200 font-display text-sm">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/20 border-y border-slate-900 py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
              How ParkOps Works
            </h2>
            <p className="text-sm text-slate-400">
              A complete parking session — from discovery to check-out — in four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userflows.map((step, i) => (
              <GlassCard key={i} className="p-8 flex flex-col gap-4 relative">
                <span className="text-4xl font-black text-blue-500/20 font-display">{step.step}</span>
                <h3 className="font-bold text-base text-slate-200 font-display">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                {i < userflows.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-700 z-10" size={20} />
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* For Drivers / For Operators */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Drivers */}
          <GlassCard className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">For Drivers</span>
                <h3 className="font-bold text-slate-200 font-display">Find & Reserve Parking</h3>
              </div>
            </div>
            <ul className="flex flex-col gap-3">
              {forDrivers.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/register')} className="btn-primary py-3 px-6 text-sm font-semibold rounded-xl w-fit">
              Get Started Free
            </button>
          </GlassCard>

          {/* For Operators */}
          <GlassCard className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/20 text-indigo-400 border border-indigo-900/20 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">For Parking Operators</span>
                <h3 className="font-bold text-slate-200 font-display">Manage Your Facilities</h3>
              </div>
            </div>
            <ul className="flex flex-col gap-3">
              {forOperators.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} className="border border-slate-700 hover:border-slate-600 text-slate-300 py-3 px-6 text-sm font-semibold rounded-xl w-fit transition-colors">
              Admin Demo →
            </button>
          </GlassCard>
        </div>
      </section>

      {/* Tech Stack Highlights */}
      <section className="bg-slate-900/20 border-y border-slate-900 py-16 px-6 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
              Production-Grade Engineering
            </h2>
            <p className="text-sm text-slate-400">
              Built to the same standards as commercial SaaS — infrastructure as code, CI/CD, 
              observability, and security at every layer.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {techHighlights.map((t, i) => (
              <GlassCard key={i} className="p-5 flex flex-col gap-1">
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{t.label}</span>
                <span className="text-sm text-slate-300 font-medium font-display">{t.value}</span>
              </GlassCard>
            ))}
          </div>

          <div className="text-center">
            <a 
              href="https://github.com/Avinash-Kolipaka/Smart-Parking-Slot-Reservation-System"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              View source on GitHub <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-6 w-full pb-24 flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Engineering details, booking rules, and how key features work under the hood.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <GlassCard
              key={idx}
              className="p-5 cursor-pointer hover:border-slate-800/80 transition-colors"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-blue-500 shrink-0" size={18} />
                  <span className="text-sm font-semibold text-slate-200 font-display">{faq.q}</span>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase shrink-0">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </div>
              {activeFaq === idx && (
                <div className="mt-4 pt-4 border-t border-slate-900/60 text-xs text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col items-center gap-4">
          <h3 className="text-lg font-bold font-display text-slate-200">Ready to explore?</h3>
          <p className="text-sm text-slate-500">Try the demo — no account needed for browsing.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => navigate('/locations')} className="btn-primary py-3 px-8 text-sm font-semibold rounded-xl">
              Browse Parking
            </button>
            <button onClick={() => navigate('/register')} className="border border-slate-700 hover:border-slate-600 text-slate-300 py-3 px-8 text-sm font-semibold rounded-xl transition-colors">
              Create Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { 
  Search, ShieldCheck, MapPin, Compass, Clock, CreditCard, 
  BarChart3, Star, ArrowRight, CheckCircle2, AlertTriangle, Zap, HelpCircle
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
    { value: '25+', label: 'Prime Locations' },
    { value: '500+', label: 'Parking Slots' },
    { value: '12k+', label: 'Active Bookings' },
    { value: '99.9%', label: 'Scan Verification' }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Availability',
      desc: 'No more searching. View live slot occupancy maps and secure your slot before you arrive.'
    },
    {
      icon: CreditCard,
      title: 'Simulated Secure Payments',
      desc: 'Review digital invoices and checkout securely using simulated local payment gateways.'
    },
    {
      icon: ShieldCheck,
      title: 'QR Code Ticket Entry',
      desc: 'Receive confirmation instantly. The gate operator scans your ticket QR code to check in and check out.'
    },
    {
      icon: BarChart3,
      title: 'Cron Release Jobs',
      desc: 'Automatic grace periods ensure slots are cleared if bookings are left unpaid or checked out late.'
    }
  ];

  const faqs = [
    {
      q: 'How does QR Code check-in work?',
      a: 'After confirming a booking, a printable QR code is generated. Once you arrive, present it to the parking attendant. They scan the QR code to check you in, which updates your booking to Active and marks your slot as Occupied.'
    },
    {
      q: 'Is there a booking grace period?',
      a: 'Yes! SpotFlow runs a cron job background task. If you do not check in within 15 minutes of your reserved start time (or fail to pay for a pending booking within 15 minutes of creation), the slot is automatically released back to the pool.'
    },
    {
      q: 'Can I have multiple bookings open?',
      a: 'To guarantee fairness and prevent spot hoarding, each user is restricted to a maximum of one concurrent active reservation (Pending, Confirmed, or Active statuses).'
    },
    {
      q: 'What types of vehicles are supported?',
      a: 'We support Standard Cars, Motorbikes, and EV (Electric Vehicles) slots. EV slots are equipped with charging outlets and carry a slight premium.'
    }
  ];

  return (
    <div className="flex flex-col gap-24 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-24 md:py-32 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/20 px-4 py-2 border border-blue-500/20 rounded-full mb-6">
          <Zap size={14} className="text-blue-500 animate-pulse" />
          <span>Intelligent Parking Allocations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-[1.1] mb-6 text-slate-100">
          Secure Your Parking Spot <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Before You Arrive
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          SpotFlow is a modern glassmorphic parking slot reservation platform. Pick a location, choose dates and durations, reserve your slot, and check in via secure QR tickets.
        </p>

        {/* Search console bar */}
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
          <button type="submit" className="btn-primary py-3 px-8 text-sm font-semibold rounded-xl shrink-0">
            <Search size={16} />
            Search Slots
          </button>
        </form>

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

      {/* Features Showcase */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
            Designed for Modern Parking Networks
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            SpotFlow integrates MERN architecture with Zod validations and background cron sweepers to provide a state-of-the-art reservation experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <GlassCard key={i} className="p-6 flex flex-col gap-4">
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

      {/* Visual How It Works */}
      <section className="bg-slate-900/20 border-y border-slate-900 py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
              Getting Started is Simple
            </h2>
            <p className="text-sm text-slate-400">
              Flow through our reservation process and secure your spot in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <GlassCard className="p-8 flex flex-col gap-4">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Step 01</span>
              <h3 className="font-bold text-base text-slate-200 font-display">Select Lot & Spot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter parking spaces by type, allowed vehicles, price, and distance. Tap a location to open the visual slot grid.
              </p>
            </GlassCard>

            {/* Step 2 */}
            <GlassCard className="p-8 flex flex-col gap-4">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Step 02</span>
              <h3 className="font-bold text-base text-slate-200 font-display">Book & Mock Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specify your license plate, arrival window, and duration. Tap to confirm booking and complete mock checking.
              </p>
            </GlassCard>

            {/* Step 3 */}
            <GlassCard className="p-8 flex flex-col gap-4">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Step 03</span>
              <h3 className="font-bold text-base text-slate-200 font-display">Scan QR & Park</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download your printable QR code ticket. Present it to check in and check out, releasing your vacant spot automatically.
              </p>
            </GlassCard>

          </div>

        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-6 w-full pb-24 flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mb-4">
            Frequently Answered Questions
          </h2>
          <p className="text-sm text-slate-400">
            Got queries regarding bookings, grace periods, or payment processes?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <GlassCard
              key={idx}
              className="p-5 cursor-pointer hover:border-slate-800/80"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="text-blue-500 shrink-0" size={18} />
                  <span className="text-sm font-semibold text-slate-200 font-display">{faq.q}</span>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase">
                  {activeFaq === idx ? 'Collapse' : 'Expand'}
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
      </section>

    </div>
  );
};

export default Landing;

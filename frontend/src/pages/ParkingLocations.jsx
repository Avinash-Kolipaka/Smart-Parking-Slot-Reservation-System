import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import { 
  Search, MapPin, Clock, Car, Bike, Zap, 
  SlidersHorizontal, ShieldAlert, Star 
} from 'lucide-react';

const ParkingLocations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state variables
  const appliedSearch = searchParams.get('search') || '';
  const [searchVal, setSearchVal] = useState(appliedSearch);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (appliedSearch) params.search = appliedSearch;
      if (vehicleFilter) params.vehicleType = vehicleFilter;
      if (typeFilter) params.parkingType = typeFilter;
      if (priceMax) params.maxPrice = priceMax;

      const response = await api.get('/parking', { params });
      setLocations(response.data.data.locations);
    } catch (err) {
      console.error('Failed to retrieve locations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [appliedSearch, vehicleFilter, typeFilter, priceMax]);

  // Keep the input in sync when navigation changes the search query.
  useEffect(() => {
    setSearchVal(appliedSearch);
  }, [appliedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedSearch = searchVal.trim();

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      if (trimmedSearch) {
        nextParams.set('search', trimmedSearch);
      } else {
        nextParams.delete('search');
      }

      return nextParams;
    });
  };

  const getVehicleBadge = (type, key) => {
    switch (type) {
      case 'Bike':
        return <span key={key} className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"><Bike size={12} /> Bike</span>;
      case 'EV':
        return <span key={key} className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-400 bg-yellow-950/20 border border-yellow-900/30 px-2 py-0.5 rounded animate-pulse-slow"><Zap size={12} /> EV</span>;
      case 'Car':
      default:
        return <span key={key} className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-950/20 border border-blue-900/30 px-2 py-0.5 rounded"><Car size={12} /> Car</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8">
      
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-100 mb-1">
          Explore Parking Spaces
        </h1>
        <p className="text-xs text-slate-400">Search and filter active parking locations near you.</p>
      </div>

      {/* Control filters bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Options Panel */}
        <div className="lg:col-span-1 flex flex-col gap-5 bg-slate-900/10 border border-slate-900/80 p-5 rounded-2xl h-fit backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3">
            <SlidersHorizontal size={16} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">
              Filter Options
            </h3>
          </div>

          {/* Vehicle compatibility */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Vehicle Type
            </label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 cursor-pointer"
            >
              <option value="">All Vehicles</option>
              <option value="Car">Car</option>
              <option value="Bike">Motorbike</option>
              <option value="EV">EV Charger</option>
            </select>
          </div>

          {/* Parking structure type */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Structure Format
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 cursor-pointer"
            >
              <option value="">All Formats</option>
              <option value="Covered">Covered Structure</option>
              <option value="Open">Open Air Lot</option>
              <option value="Basement">Underground Basement</option>
            </select>
          </div>

          {/* Pricing constraints */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              Max Price: {priceMax ? `$${priceMax}/hr` : 'Any Price'}
            </label>
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={priceMax || '15'}
              onChange={(e) => setPriceMax(e.target.value === '15' ? '' : e.target.value)}
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-semibold px-0.5">
              <span>$2.00</span>
              <span>$15.00+</span>
            </div>
          </div>

          {/* Reset button */}
          {(vehicleFilter || typeFilter || priceMax || appliedSearch) && (
            <button
              onClick={() => {
                setVehicleFilter('');
                setTypeFilter('');
                setPriceMax('');
                setSearchVal('');
                setSearchParams({});
              }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/10 hover:border-rose-500/20 bg-rose-950/10 py-2.5 rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}

        </div>

        {/* Right Side: Search bar and results grids */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Search bar form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search slots by city, name, zipcode..."
                className="glass-input pl-10 py-2.5 text-xs font-medium"
              />
            </div>
          </form>

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              <div className="h-64 bg-slate-900/30 border border-slate-900 rounded-2xl" />
              <div className="h-64 bg-slate-900/30 border border-slate-900 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map(loc => (
                <GlassCard key={loc._id} className="overflow-hidden flex flex-col h-full bg-slate-900/30 border-slate-800/80">
                  
                  {/* Photo Banner */}
                  <div className="aspect-video relative overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={loc.images[0] || 'https://images.unsplash.com/photo-1506521788701-1e13a700b10a?auto=format&fit=crop&q=80&w=600'}
                      alt={loc.name}
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-bold text-blue-400 backdrop-blur-sm">
                      ${loc.pricePerHour.toFixed(2)}/hr
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-bold font-display text-slate-100 hover:text-blue-400 transition-colors">
                        <Link to={`/locations/${loc._id}`}>{loc.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium truncate">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        {loc.address}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {loc.vehicleTypes.map(vt => getVehicleBadge(vt, vt))}
                    </div>

                    {/* Operational hours and counts */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 border border-slate-900 p-3 rounded-xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Business Hours</span>
                        <span className="text-slate-300 font-mono flex items-center gap-1">
                          <Clock size={11} className="text-blue-400" />
                          {loc.openingHours} - {loc.closingHours}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">Vacant Slots</span>
                        <span className={`font-semibold ${loc.availableSlots > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {loc.availableSlots} / {loc.totalSlots}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {loc.description}
                    </p>

                    {/* Navigation buttons */}
                    <div className="flex gap-3 border-t border-slate-900/60 pt-4 mt-auto">
                      <Link
                        to={`/locations/${loc._id}`}
                        className="btn-secondary flex-1 py-2 rounded-xl text-xs font-semibold"
                      >
                        Details
                      </Link>
                      <Link
                        to={loc.availableSlots > 0 ? `/locations/${loc._id}/reserve` : '#'}
                        className={`btn-primary flex-1 py-2 rounded-xl text-xs font-semibold ${
                          loc.availableSlots === 0 ? 'opacity-30 cursor-not-allowed shadow-none' : ''
                        }`}
                      >
                        Reserve Slot
                      </Link>
                    </div>

                  </div>

                </GlassCard>
              ))}

              {locations.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center glass-card border-dashed border-slate-800">
                  <ShieldAlert className="text-slate-600 mb-3 animate-bounce" size={32} />
                  <h3 className="font-bold text-sm text-slate-300 font-display">No Matches Found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Try modifying your search queries, vehicle types, or raise your maximum price cap.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ParkingLocations;

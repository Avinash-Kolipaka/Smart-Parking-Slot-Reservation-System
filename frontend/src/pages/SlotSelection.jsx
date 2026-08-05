import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import SlotMap from '../components/SlotMap';
import GlassCard from '../components/GlassCard';
import { Calendar, Clock, Car, Bike, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

const SlotSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [location, setLocation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reservation configuration inputs state
  const [vehicleType, setVehicleType] = useState('Car');
  
  // Date selection: default today
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  
  // Time selectors
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(2); // hours
  const [licensePlate, setLicensePlate] = useState('');
  
  // Selected slot state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocationData = async () => {
    try {
      const locRes = await api.get(`/parking/${id}`);
      setLocation(locRes.data.data);
      
      const slotsRes = await api.get(`/slots?parkingLocationId=${id}`);
      setSlots(slotsRes.data.data);
    } catch (err) {
      showToast('Failed to load slots configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, [id]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    showToast(`Slot ${slot.slotNumber} selected.`, 'info');
  };

  // Compile datetime-local ISO strings for API
  const getISOStrings = () => {
    const startStr = `${bookingDate}T${startTime}:00`;
    const start = new Date(startStr);
    
    // add duration hours
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString()
    };
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      showToast('Please select a parking slot first', 'warning');
      return;
    }

    if (!licensePlate.trim()) {
      showToast('Please enter your vehicle license plate number', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const { startISO, endISO } = getISOStrings();
      
      const response = await api.post('/bookings/book', {
        locationId: id,
        slotId: selectedSlot._id,
        vehicleNumber: licensePlate.trim().toUpperCase(),
        vehicleType,
        bookingDate: new Date(bookingDate).toISOString(),
        startTime: startISO,
        endTime: endISO
      });

      showToast('Reservation slot locked. Proceeding to checkout.', 'success');
      const booking = response.data.data;
      navigate(`/bookings/${booking._id}/checkout`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 w-full py-12 flex items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-100 mb-1">
          Reserve Parking Slot
        </h1>
        <p className="text-xs text-slate-400">Specify dates, duration, vehicle specs, and choose your spot on the grid map.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Parameters picker & Slot map */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Reservation parameters Form */}
          <GlassCard className="p-6 bg-slate-900/20 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
              Reservation Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              
              {/* Vehicle configuration selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Vehicle Type Compatibility
                </label>
                <div className="flex gap-2.5">
                  {[
                    { id: 'Car', label: 'Car', icon: Car },
                    { id: 'Bike', label: 'Bike', icon: Bike },
                    { id: 'EV', label: 'EV Charger', icon: Zap }
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = vehicleType === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setVehicleType(cat.id);
                          setSelectedSlot(null); // Clear selected slot since vehicle compatibility changed
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* License Plate Plate field */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. XYZ-7890"
                  className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500/60 uppercase"
                />
              </div>

              {/* Date selection picker */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                  <Calendar size={12} className="text-blue-500" />
                  Booking Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
                />
              </div>

              {/* Timing specifications and durations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Duration (Hours)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </GlassCard>

          {/* Interactive slot grid map */}
          <GlassCard className="p-6 bg-slate-900/20">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3 mb-6">
              Interactive Grid Map ({vehicleType} Slots)
            </h3>
            
            <SlotMap
              slots={slots}
              selectedSlotId={selectedSlot?._id}
              onSelectSlot={handleSlotSelect}
              vehicleTypeFilter={vehicleType}
            />
          </GlassCard>

        </div>

        {/* Right Side: Quick invoice details review card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="p-6 bg-slate-900/20 border-slate-800/80 flex flex-col gap-5 sticky top-28">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
              Reservation Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Parking Lot</span>
                <span className="font-semibold text-slate-200 text-right max-w-[150px] truncate">{location?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Date</span>
                <span className="font-semibold text-slate-200">{bookingDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Start Time</span>
                <span className="font-semibold text-slate-200">{startTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Reserved Duration</span>
                <span className="font-semibold text-slate-200">{duration} Hour(s)</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-900/60 pt-3 mt-1">
                <span className="text-slate-500">Selected Slot</span>
                <span className="font-bold text-blue-400">
                  {selectedSlot ? `Spot ${selectedSlot.slotNumber} (Floor ${selectedSlot.floor})` : 'None Selected'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-900/60 pt-3 mt-1 text-sm">
                <span className="text-slate-400 font-bold">Estimated Cost</span>
                <span className="font-bold text-slate-100">
                  ${selectedSlot ? (duration * (selectedSlot.price || location?.pricePerHour)).toFixed(2) : '$0.00'}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={submitting || !selectedSlot}
              className="btn-primary w-full py-3 text-sm font-semibold rounded-xl text-center flex items-center justify-center"
            >
              <span>{submitting ? 'Locking spot...' : 'Proceed to Checkout'}</span>
              <ArrowRight size={14} />
            </button>

            {/* General policies alert */}
            <div className="flex gap-2 p-3 border border-slate-900 bg-slate-950/20 text-slate-500 rounded-xl text-[10px] leading-relaxed">
              <ShieldAlert size={14} className="shrink-0 text-slate-600" />
              <span>
                By proceeding, you agree that your spot reservation will be auto-expired if check-in is not finalized within 15 minutes of reservation start time.
              </span>
            </div>

          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default SlotSelection;

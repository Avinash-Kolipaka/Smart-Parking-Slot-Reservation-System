import React, { useState } from 'react';
import { X, Building2, MapPin, Car, Bike, Zap, DollarSign, Clock, Info, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const AddApartmentSlotModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    buildingName: '',
    unitNumber: '',
    slotNumber: '',
    address: '',
    city: 'San Francisco',
    zipCode: '94102',
    parkingType: 'Covered',
    vehicleTypes: ['Car'],
    pricePerHour: 2.5,
    floor: 1,
    parkingZone: 'A',
    openingHours: '00:00',
    closingHours: '23:59',
    description: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleTypeToggle = (type) => {
    setFormData(prev => {
      const exists = prev.vehicleTypes.includes(type);
      if (exists) {
        if (prev.vehicleTypes.length === 1) return prev; // keep at least one
        return { ...prev, vehicleTypes: prev.vehicleTypes.filter(t => t !== type) };
      } else {
        return { ...prev, vehicleTypes: [...prev.vehicleTypes, type] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.buildingName || !formData.address || !formData.slotNumber) {
      setError('Please fill in Building Name, Address, and Slot Number');
      return;
    }

    setLoading(true);

    try {
      const titleName = formData.unitNumber 
        ? `${formData.buildingName} (${formData.unitNumber})`
        : formData.buildingName;

      const payload = {
        name: titleName,
        address: formData.address,
        city: formData.city || 'San Francisco',
        zipCode: formData.zipCode || '94102',
        isApartmentSlot: true,
        apartmentDetails: {
          buildingName: formData.buildingName,
          unitNumber: formData.unitNumber
        },
        slotNumber: formData.slotNumber,
        floor: Number(formData.floor) || 1,
        parkingZone: formData.parkingZone || 'A',
        pricePerHour: Number(formData.pricePerHour) || 0,
        parkingType: formData.parkingType,
        vehicleTypes: formData.vehicleTypes,
        openingHours: formData.openingHours || '00:00',
        closingHours: formData.closingHours || '23:59',
        description: formData.description || `Apartment parking slot at ${formData.buildingName}`
      };

      const res = await api.post('/parking', payload);
      
      if (res.data.success) {
        showToast('Apartment parking slot added successfully!', 'success');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to add apartment slot:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to add apartment slot';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-100">Add Apartment Parking Slot</h2>
              <p className="text-xs text-slate-400">List your apartment or private spot so others can reserve it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Apartment Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Apartment & Slot Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Building / Apartment Name *</label>
                <input
                  type="text"
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleChange}
                  placeholder="e.g. Skyline Heights Residency"
                  required
                  className="glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Flat / Unit Number</label>
                <input
                  type="text"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  placeholder="e.g. Flat 302, Block B"
                  className="glass-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Slot Number / Name *</label>
                <input
                  type="text"
                  name="slotNumber"
                  value={formData.slotNumber}
                  onChange={handleChange}
                  placeholder="e.g. B-302 or Slot 45"
                  required
                  className="glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Floor Number</label>
                <input
                  type="number"
                  name="floor"
                  min="1"
                  value={formData.floor}
                  onChange={handleChange}
                  className="glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Parking Zone</label>
                <input
                  type="text"
                  name="parkingZone"
                  value={formData.parkingZone}
                  onChange={handleChange}
                  placeholder="e.g. A, B, B1"
                  className="glass-input text-xs uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Address */}
          <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Address & Location</h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Street Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 742 Evergreen Terrace, Apt Complex B"
                required
                className="glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="glass-input text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parking Type, Vehicles & Pricing */}
          <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Type, Vehicle & Pricing</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Structure Type</label>
                <select
                  name="parkingType"
                  value={formData.parkingType}
                  onChange={handleChange}
                  className="glass-input text-xs bg-slate-950 cursor-pointer"
                >
                  <option value="Covered">Covered Structure</option>
                  <option value="Basement">Underground Basement</option>
                  <option value="Open">Open Air Lot</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Rate per Hour ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    className="glass-input text-xs pl-7 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Allowed Vehicle Types</label>
              <div className="flex gap-3">
                {[
                  { id: 'Car', label: 'Car', icon: Car },
                  { id: 'Bike', label: 'Motorbike', icon: Bike },
                  { id: 'EV', label: 'EV Charger', icon: Zap }
                ].map(({ id, label, icon: Icon }) => {
                  const active = formData.vehicleTypes.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleVehicleTypeToggle(id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-blue-950/40 border-blue-500 text-blue-400 shadow-sm shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                      {active && <CheckCircle2 size={12} className="ml-0.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Available From</label>
                <input
                  type="time"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  className="glass-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Available Until</label>
                <input
                  type="time"
                  name="closingHours"
                  value={formData.closingHours}
                  onChange={handleChange}
                  className="glass-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Access Instructions & Description */}
          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-5">
            <label className="text-xs font-semibold text-slate-300 block">Access Notes / Special Instructions</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Near Elevator 2 in Basement 1. Gate passcode is #402. Please park within designated lines."
              className="glass-input text-xs resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2.5 px-5 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Slot...
                </>
              ) : (
                'Publish Parking Slot'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddApartmentSlotModal;

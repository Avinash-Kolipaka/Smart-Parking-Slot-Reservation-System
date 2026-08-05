import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  X, ChevronRight, ChevronLeft, Building2, MapPin, Clock,
  DollarSign, Layers, Car, Bike, Zap, Check, Loader2,
  Navigation, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const parkingTypes = [
  { value: 'Open', label: 'Open Air', desc: 'Outdoor surface-level lot', icon: '🌤️' },
  { value: 'Covered', label: 'Covered', desc: 'Sheltered multi-level structure', icon: '🏢' },
  { value: 'Basement', label: 'Basement', desc: 'Underground parking facility', icon: '🏗️' },
];

const vehicleTypesList = [
  { value: 'Car', label: 'Car', icon: Car, color: 'blue' },
  { value: 'Bike', label: 'Bike / Moto', icon: Bike, color: 'violet' },
  { value: 'EV', label: 'EV Charging', icon: Zap, color: 'emerald' },
];

const defaultForm = {
  name: '',
  address: '',
  city: '',
  zipCode: '',
  coordinates: { lat: '', lng: '' },
  openingHours: '08:00',
  closingHours: '22:00',
  pricePerHour: '',
  numberOfFloors: 1,
  parkingType: 'Covered',
  vehicleTypes: ['Car'],
  description: '',
  status: 'Active',
};

// ─── Step Indicator ─────────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: 'Building Info', icon: Building2 },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Hours & Pricing', icon: Clock },
  { id: 4, label: 'Review', icon: CheckCircle2 },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
    {children}
    {required && <span className="text-rose-500">*</span>}
  </label>
);

const StepDot = ({ step, current }) => {
  const Icon = step.icon;
  const done = current > step.id;
  const active = current === step.id;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
        done
          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          : active
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
          : 'bg-slate-900 border-slate-800 text-slate-600'
      }`}>
        {done ? <Check size={14} /> : <Icon size={14} />}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
        active ? 'text-blue-400' : done ? 'text-emerald-400' : 'text-slate-600'
      }`}>{step.label}</span>
    </div>
  );
};

// ─── Main Modal ─────────────────────────────────────────────────────────────────
const CreateParkingModal = ({ isOpen, onClose, onCreated }) => {
  const { showToast } = useNotifications();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const overlayRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setCoord = (k, v) => setForm(p => ({ ...p, coordinates: { ...p.coordinates, [k]: v } }));
  const toggleVehicle = (type) => {
    setForm(p => ({
      ...p,
      vehicleTypes: p.vehicleTypes.includes(type)
        ? p.vehicleTypes.filter(v => v !== type)
        : [...p.vehicleTypes, type],
    }));
  };

  // ── Validation per step ─────────────────────────────────────────────────────
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Location name is required';
      if (!form.parkingType) e.parkingType = 'Select a parking type';
      if (form.vehicleTypes.length === 0) e.vehicleTypes = 'Select at least one vehicle type';
      if (!form.numberOfFloors || form.numberOfFloors < 1) e.numberOfFloors = 'At least 1 floor required';
    }
    if (s === 2) {
      if (!form.address.trim()) e.address = 'Address is required';
      if (!form.coordinates.lat || isNaN(parseFloat(form.coordinates.lat))) e.lat = 'Valid latitude required';
      if (!form.coordinates.lng || isNaN(parseFloat(form.coordinates.lng))) e.lng = 'Valid longitude required';
    }
    if (s === 3) {
      if (!form.openingHours) e.openingHours = 'Opening time required';
      if (!form.closingHours) e.closingHours = 'Closing time required';
      if (!form.pricePerHour || parseFloat(form.pricePerHour) < 0) e.pricePerHour = 'Valid price required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        coordinates: {
          lat: parseFloat(form.coordinates.lat),
          lng: parseFloat(form.coordinates.lng),
        },
        pricePerHour: parseFloat(form.pricePerHour),
        numberOfFloors: parseInt(form.numberOfFloors),
      };
      const res = await api.post('/parking', payload);
      showToast(`"${res.data.data.name}" created successfully!`, 'success');
      if (onCreated) onCreated(res.data.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create parking building', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Render step content ──────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>Parking Building Name</FieldLabel>
              <input
                id="park-name"
                className={`glass-input text-sm ${errors.name ? 'border-rose-500/60' : ''}`}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Downtown Parking Hub"
              />
              {errors.name && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={2}
                className="glass-input text-sm resize-none"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Optional notes about this parking facility..."
              />
            </div>

            {/* Parking Type */}
            <div className="flex flex-col gap-2">
              <FieldLabel required>Structure Type</FieldLabel>
              <div className="grid grid-cols-3 gap-3">
                {parkingTypes.map(pt => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => set('parkingType', pt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      form.parkingType === pt.value
                        ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{pt.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${form.parkingType === pt.value ? 'text-blue-300' : 'text-slate-300'}`}>{pt.label}</p>
                      <p className="text-[9px] text-slate-500">{pt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.parkingType && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.parkingType}</p>}
            </div>

            {/* Vehicle Types */}
            <div className="flex flex-col gap-2">
              <FieldLabel required>Supported Vehicle Types</FieldLabel>
              <div className="flex gap-3 flex-wrap">
                {vehicleTypesList.map(({ value, label, icon: Icon, color }) => {
                  const active = form.vehicleTypes.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleVehicle(value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                        active
                          ? `bg-${color}-600/15 border-${color}-500/60 text-${color}-300 shadow-md`
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                      {active && <Check size={11} className="ml-0.5" />}
                    </button>
                  );
                })}
              </div>
              {errors.vehicleTypes && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.vehicleTypes}</p>}
            </div>

            {/* Number of Floors */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>Number of Floors</FieldLabel>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('numberOfFloors', Math.max(1, (parseInt(form.numberOfFloors) || 1) - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                >−</button>
                <div className="flex-1 glass-input text-center text-sm font-bold font-display text-slate-100 py-2.5">
                  {form.numberOfFloors} {parseInt(form.numberOfFloors) === 1 ? 'floor' : 'floors'}
                </div>
                <button
                  type="button"
                  onClick={() => set('numberOfFloors', (parseInt(form.numberOfFloors) || 1) + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                >+</button>
              </div>
              {errors.numberOfFloors && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.numberOfFloors}</p>}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div>
                <p className="text-xs font-semibold text-slate-300">Active Status</p>
                <p className="text-[10px] text-slate-500">Enable this location for bookings</p>
              </div>
              <button
                type="button"
                onClick={() => set('status', form.status === 'Active' ? 'Disabled' : 'Active')}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  form.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  form.status === 'Active' ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-5">
            {/* Map preview hint */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
              <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-300">Enter the address and GPS coordinates of the parking facility. Use Google Maps to find exact latitude/longitude.</p>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>Street Address</FieldLabel>
              <input
                id="park-address"
                className={`glass-input text-sm ${errors.address ? 'border-rose-500/60' : ''}`}
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="e.g. 123 Main Street"
              />
              {errors.address && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.address}</p>}
            </div>

            {/* City & Zip in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>City</FieldLabel>
                <input
                  className="glass-input text-sm"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="e.g. San Francisco"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>ZIP Code</FieldLabel>
                <input
                  className="glass-input text-sm"
                  value={form.zipCode}
                  onChange={e => set('zipCode', e.target.value)}
                  placeholder="e.g. 94102"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="flex flex-col gap-2">
              <FieldLabel required>GPS Coordinates</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-600 uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className={`glass-input text-sm ${errors.lat ? 'border-rose-500/60' : ''}`}
                    value={form.coordinates.lat}
                    onChange={e => setCoord('lat', e.target.value)}
                    placeholder="e.g. 37.7749"
                  />
                  {errors.lat && <p className="text-[10px] text-rose-400"><AlertCircle size={10} className="inline mr-1" />{errors.lat}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-600 uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className={`glass-input text-sm ${errors.lng ? 'border-rose-500/60' : ''}`}
                    value={form.coordinates.lng}
                    onChange={e => setCoord('lng', e.target.value)}
                    placeholder="e.g. -122.4194"
                  />
                  {errors.lng && <p className="text-[10px] text-rose-400"><AlertCircle size={10} className="inline mr-1" />{errors.lng}</p>}
                </div>
              </div>
            </div>

            {/* Mini map placeholder */}
            {form.coordinates.lat && form.coordinates.lng && !isNaN(parseFloat(form.coordinates.lat)) && (
              <div className="rounded-xl overflow-hidden border border-slate-800/60 h-40 bg-slate-900/60 flex flex-col items-center justify-center gap-2">
                <Navigation size={24} className="text-blue-500" />
                <p className="text-xs text-slate-400 font-medium">
                  {parseFloat(form.coordinates.lat).toFixed(4)}°, {parseFloat(form.coordinates.lng).toFixed(4)}°
                </p>
                <p className="text-[10px] text-slate-600">Coordinates confirmed</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-5">
            {/* Operating Hours */}
            <div className="flex flex-col gap-2">
              <FieldLabel required>Operating Hours</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-600 uppercase tracking-wider">Opens At</label>
                  <input
                    type="time"
                    className={`glass-input text-sm ${errors.openingHours ? 'border-rose-500/60' : ''}`}
                    value={form.openingHours}
                    onChange={e => set('openingHours', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-600 uppercase tracking-wider">Closes At</label>
                  <input
                    type="time"
                    className={`glass-input text-sm ${errors.closingHours ? 'border-rose-500/60' : ''}`}
                    value={form.closingHours}
                    onChange={e => set('closingHours', e.target.value)}
                  />
                </div>
              </div>

              {/* Visual timeline */}
              {form.openingHours && form.closingHours && (
                <div className="mt-1 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400">Open</span>
                    <span className="text-xs font-bold text-slate-200 ml-1">{form.openingHours}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 via-blue-500/40 to-slate-700 mx-2"></div>
                    <span className="text-xs font-bold text-slate-200">{form.closingHours}</span>
                    <span className="text-xs text-slate-400">Close</span>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Price per Hour */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>Price per Hour</FieldLabel>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  className={`glass-input text-sm pl-8 ${errors.pricePerHour ? 'border-rose-500/60' : ''}`}
                  value={form.pricePerHour}
                  onChange={e => set('pricePerHour', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {errors.pricePerHour && <p className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle size={10} />{errors.pricePerHour}</p>}

              {/* Quick-set buttons */}
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 5, 8, 10, 15].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('pricePerHour', v)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 ${
                      parseFloat(form.pricePerHour) === v
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >${v}.00</button>
                ))}
              </div>
            </div>

            {/* Estimated revenue card */}
            {form.pricePerHour && form.numberOfFloors && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900/60 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">Revenue Estimate</p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold font-display text-slate-100">
                      ${(parseFloat(form.pricePerHour) * 10).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-500">Per slot / 10 hrs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold font-display text-slate-100">
                      ${(parseFloat(form.pricePerHour) * 10 * parseInt(form.numberOfFloors) * 20).toFixed(0)}
                    </p>
                    <p className="text-[10px] text-slate-500">Est. daily max ({parseInt(form.numberOfFloors)} fl × 20 slots)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-4">
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-500/20">
                <Building2 size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-100">{form.name || 'Unnamed Building'}</h3>
              <p className="text-xs text-slate-400">{form.address}{form.city ? `, ${form.city}` : ''}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Type', value: form.parkingType },
                { label: 'Floors', value: `${form.numberOfFloors} floor${parseInt(form.numberOfFloors) !== 1 ? 's' : ''}` },
                { label: 'Opens', value: form.openingHours },
                { label: 'Closes', value: form.closingHours },
                { label: 'Price/hr', value: `$${parseFloat(form.pricePerHour || 0).toFixed(2)}` },
                { label: 'Status', value: form.status },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vehicles Supported</p>
              <div className="flex gap-2 flex-wrap">
                {form.vehicleTypes.map(v => (
                  <span key={v} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-950/30 text-blue-300 border border-blue-500/20">{v}</span>
                ))}
              </div>
            </div>

            {form.coordinates.lat && form.coordinates.lng && (
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center gap-2">
                <MapPin size={13} className="text-blue-400 shrink-0" />
                <span className="text-xs text-slate-400 font-mono">{parseFloat(form.coordinates.lat).toFixed(5)}, {parseFloat(form.coordinates.lng).toFixed(5)}</span>
              </div>
            )}

            {form.description && (
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs text-slate-400">{form.description}</p>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-300">Everything looks good! Click <strong>Create Building</strong> to finalize and publish this parking location.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%)',
          border: '1px solid rgba(148,163,184,0.12)',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.05)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-slate-100">New Parking Building</h2>
              <p className="text-[10px] text-slate-500">Step {step} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="px-6 py-4 border-b border-slate-900/60 shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <StepDot step={s} current={step} />
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all duration-500 ${step > s.id ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Step Title ── */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <h3 className="text-base font-bold font-display text-slate-100">{steps[step - 1].label}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {step === 1 && 'Define the building name, type, and supported vehicle categories.'}
            {step === 2 && 'Set the physical location and GPS coordinates.'}
            {step === 3 && 'Configure operating hours and parking rates.'}
            {step === 4 && 'Review all details before creating the parking location.'}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {renderStep()}
        </div>

        {/* ── Footer Navigation ── */}
        <div className="px-6 py-4 border-t border-slate-900 flex items-center justify-between shrink-0">
          <button
            onClick={step === 1 ? onClose : prevStep}
            className="btn-secondary py-2.5 px-5 text-xs rounded-xl"
          >
            <ChevronLeft size={14} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < steps.length ? (
            <button
              onClick={nextStep}
              className="btn-primary py-2.5 px-5 text-xs rounded-xl"
            >
              Continue
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary py-2.5 px-6 text-xs rounded-xl"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" />Creating...</>
              ) : (
                <><Check size={14} />Create Building</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateParkingModal;

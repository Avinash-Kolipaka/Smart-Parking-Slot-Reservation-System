import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import ConfirmDialog from '../components/ConfirmDialog';
import CreateParkingModal from '../components/CreateParkingModal';
import {
  MapPin, Plus, Trash2, Edit3, RefreshCcw, X, Check,
  Clock, DollarSign, Layers, Car, Bike, Zap, AlertCircle
} from 'lucide-react';

const vehicleTypeIcons = { Car, Bike, EV: Zap };
const parkingTypes = ['Open', 'Covered', 'Basement'];
const vehicleTypes = ['Car', 'Bike', 'EV'];
const statusOptions = ['Active', 'Disabled'];

const defaultForm = {
  name: '', address: '', coordinates: { lat: '', lng: '' },
  openingHours: '08:00', closingHours: '22:00',
  pricePerHour: '', numberOfFloors: 1, parkingType: 'Open',
  vehicleTypes: ['Car'], description: '', status: 'Active'
};

const LocationForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || defaultForm);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setCoord = (k, v) => setForm(p => ({ ...p, coordinates: { ...p.coordinates, [k]: v } }));

  const toggleVehicle = (type) => {
    setForm(p => ({
      ...p,
      vehicleTypes: p.vehicleTypes.includes(type)
        ? p.vehicleTypes.filter(v => v !== type)
        : [...p.vehicleTypes, type]
    }));
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location Name *</label>
          <input className="glass-input text-sm" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Downtown Parking Hub" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address *</label>
          <input className="glass-input text-sm" value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 123 Main St, City" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude *</label>
          <input type="number" step="any" className="glass-input text-sm" value={form.coordinates.lat} onChange={e => setCoord('lat', e.target.value)} placeholder="e.g. 40.7128" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude *</label>
          <input type="number" step="any" className="glass-input text-sm" value={form.coordinates.lng} onChange={e => setCoord('lng', e.target.value)} placeholder="e.g. -74.0060" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opening Time *</label>
          <input type="time" className="glass-input text-sm" value={form.openingHours} onChange={e => set('openingHours', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Closing Time *</label>
          <input type="time" className="glass-input text-sm" value={form.closingHours} onChange={e => set('closingHours', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price per Hour ($) *</label>
          <input type="number" min="0" step="0.5" className="glass-input text-sm" value={form.pricePerHour} onChange={e => set('pricePerHour', e.target.value)} placeholder="e.g. 5.00" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Number of Floors *</label>
          <input type="number" min="1" className="glass-input text-sm" value={form.numberOfFloors} onChange={e => set('numberOfFloors', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parking Type *</label>
          <select className="glass-input text-sm" value={form.parkingType} onChange={e => set('parkingType', e.target.value)}>
            {parkingTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
          <select className="glass-input text-sm" value={form.status} onChange={e => set('status', e.target.value)}>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supported Vehicle Types *</label>
        <div className="flex gap-3">
          {vehicleTypes.map(type => {
            const Icon = vehicleTypeIcons[type];
            const active = form.vehicleTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleVehicle(type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  active
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                }`}
              >
                <Icon size={14} />
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
        <textarea rows={3} className="glass-input text-sm resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional notes about the location..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-900">
        <button onClick={onCancel} className="btn-secondary py-2 px-4 text-xs rounded-xl">
          <X size={14} />
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="btn-primary py-2 px-5 text-xs rounded-xl"
        >
          <Check size={14} />
          {saving ? 'Saving...' : 'Save Location'}
        </button>
      </div>
    </div>
  );
};

const ManageParking = () => {
  const { showToast } = useNotifications();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Use admin route to get all including Disabled
      const res = await api.get('/parking');
      setLocations(res.data.data);
    } catch (err) {
      showToast('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleModalCreated = (newLoc) => {
    setLocations(prev => [newLoc, ...prev]);
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const payload = { ...form, coordinates: { lat: parseFloat(form.coordinates.lat), lng: parseFloat(form.coordinates.lng) }, pricePerHour: parseFloat(form.pricePerHour), numberOfFloors: parseInt(form.numberOfFloors) };
      const res = await api.post('/parking', payload);
      setLocations(prev => [res.data.data, ...prev]);
      showToast('Parking location created!', 'success');
      setShowForm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const payload = { ...form, coordinates: { lat: parseFloat(form.coordinates.lat), lng: parseFloat(form.coordinates.lng) }, pricePerHour: parseFloat(form.pricePerHour), numberOfFloors: parseInt(form.numberOfFloors) };
      const res = await api.put(`/parking/${editTarget._id}`, payload);
      setLocations(prev => prev.map(l => l._id === editTarget._id ? res.data.data : l));
      showToast('Location updated!', 'success');
      setEditTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/parking/${id}`);
      setLocations(prev => prev.filter(l => l._id !== id));
      showToast('Location deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Manage Locations</h1>
          <p className="text-xs text-slate-400 mt-1">Add, edit, and remove parking areas and their configurations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLocations} className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl">
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl">
            <Plus size={14} />
            Add Location
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && !editTarget && (
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-slate-900 bg-slate-900/20">
            <h3 className="text-sm font-bold text-slate-200 font-display">New Parking Location</h3>
          </div>
          <LocationForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </GlassCard>
      )}

      {/* Location cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-900/30 border border-slate-900 rounded-2xl" />)}
        </div>
      ) : locations.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <MapPin size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No parking locations yet. Add one to get started.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {locations.map(loc => (
            <React.Fragment key={loc._id}>
              {editTarget?._id === loc._id ? (
                <GlassCard className="overflow-hidden">
                  <div className="p-4 border-b border-slate-900 bg-slate-900/20">
                    <h3 className="text-sm font-bold text-slate-200 font-display">Edit: {loc.name}</h3>
                  </div>
                  <LocationForm
                    initial={{ ...loc, coordinates: { lat: loc.coordinates?.lat || '', lng: loc.coordinates?.lng || '' } }}
                    onSave={handleUpdate}
                    onCancel={() => setEditTarget(null)}
                    saving={saving}
                  />
                </GlassCard>
              ) : (
                <GlassCard className="p-5 flex flex-col sm:flex-row justify-between gap-4 group">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        loc.status === 'Active'
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20'
                          : 'text-rose-400 bg-rose-950/20 border-rose-500/20'
                      }`}>{loc.status}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-900/40 border border-slate-800 px-2 py-0.5 rounded-full">{loc.parkingType}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 font-display">{loc.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={11} className="text-blue-500" />
                      {loc.address}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap mt-1">
                      <span className="flex items-center gap-1"><DollarSign size={10} />${loc.pricePerHour}/hr</span>
                      <span className="flex items-center gap-1"><Layers size={10} />{loc.numberOfFloors} floors</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{loc.openingHours} – {loc.closingHours}</span>
                      <span>{loc.vehicleTypes?.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditTarget(loc)}
                      className="btn-secondary py-2 px-3 text-xs rounded-xl"
                    >
                      <Edit3 size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(loc)}
                      className="py-2 px-3 text-xs rounded-xl bg-rose-950/10 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 hover:border-rose-500/40 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </GlassCard>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Parking Location"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will also delete all associated slots permanently.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete._id)}
        onClose={() => setConfirmDelete(null)}
        isDanger
      />

      <CreateParkingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleModalCreated}
      />

    </div>
  );
};

export default ManageParking;

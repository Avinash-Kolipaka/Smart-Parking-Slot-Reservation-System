import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Grid, Plus, Trash2, Edit3, RefreshCcw, X, Check,
  Car, Bike, Zap, ChevronDown, Layers
} from 'lucide-react';

const vehicleTypes = ['Car', 'Bike', 'EV'];
const slotStatuses = ['Available', 'Occupied', 'Reserved', 'Disabled'];
const vehicleIcons = { Car, Bike, EV: Zap };

const statusColors = {
  Available: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20',
  Occupied: 'text-rose-400 bg-rose-950/20 border-rose-500/20',
  Reserved: 'text-amber-400 bg-amber-950/20 border-amber-500/20',
  Disabled: 'text-slate-500 bg-slate-900/40 border-slate-700/20',
};

const ManageSlots = () => {
  const { showToast } = useNotifications();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const [singleForm, setSingleForm] = useState({
    slotNumber: '', floor: 1, parkingZone: 'A', vehicleType: 'Car', price: ''
  });

  const [batchForm, setBatchForm] = useState({
    floor: 1, parkingZone: 'A', vehicleType: 'Car', count: 10, startNumber: 1, price: ''
  });

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/parking');
        setLocations(res.data.data);
      } catch (err) {
        showToast('Failed to load locations', 'error');
      }
    };
    fetchLocations();
  }, []);

  const fetchSlots = async (locationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/slots?parkingLocationId=${locationId}`);
      setSlots(res.data.data);
    } catch (err) {
      showToast('Failed to load slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (e) => {
    const id = e.target.value;
    setSelectedLocation(id);
    setSlots([]);
    setEditingSlot(null);
    if (id) fetchSlots(id);
  };

  const handleCreateSingle = async () => {
    if (!selectedLocation) return;
    setSaving(true);
    try {
      const payload = {
        ...singleForm,
        parkingLocationId: selectedLocation,
        floor: parseInt(singleForm.floor),
        price: singleForm.price ? parseFloat(singleForm.price) : undefined
      };
      const res = await api.post('/slots', payload);
      setSlots(prev => [...prev, res.data.data]);
      showToast('Slot created!', 'success');
      setShowSingleForm(false);
      setSingleForm({ slotNumber: '', floor: 1, parkingZone: 'A', vehicleType: 'Car', price: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (!selectedLocation) return;
    setSaving(true);
    try {
      const payload = {
        ...batchForm,
        parkingLocationId: selectedLocation,
        floor: parseInt(batchForm.floor),
        count: parseInt(batchForm.count),
        startNumber: parseInt(batchForm.startNumber),
        price: batchForm.price ? parseFloat(batchForm.price) : undefined
      };
      const res = await api.post('/slots/generate-batch', payload);
      showToast(`Generated ${res.data.count} slots!`, 'success');
      fetchSlots(selectedLocation);
      setShowBatchForm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Batch generate failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (slotId) => {
    setSaving(true);
    try {
      const payload = { ...editForm, floor: parseInt(editForm.floor), price: editForm.price ? parseFloat(editForm.price) : undefined };
      const res = await api.put(`/slots/${slotId}`, payload);
      setSlots(prev => prev.map(s => s._id === slotId ? res.data.data : s));
      showToast('Slot updated!', 'success');
      setEditingSlot(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s._id !== slotId));
      showToast('Slot deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setConfirmDelete(null);
  };

  const slotCounts = {
    available: slots.filter(s => s.status === 'Available').length,
    occupied: slots.filter(s => s.status === 'Occupied').length,
    reserved: slots.filter(s => s.status === 'Reserved').length,
    disabled: slots.filter(s => s.status === 'Disabled').length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Manage Slots</h1>
          <p className="text-xs text-slate-400 mt-1">Create, configure, and manage individual parking slots.</p>
        </div>
        <div className="flex gap-2">
          {selectedLocation && (
            <>
              <button onClick={() => { setShowSingleForm(!showSingleForm); setShowBatchForm(false); }} className="btn-secondary py-2 px-3 text-xs rounded-xl">
                <Plus size={13} />
                Add Single
              </button>
              <button onClick={() => { setShowBatchForm(!showBatchForm); setShowSingleForm(false); }} className="btn-primary py-2 px-3 text-xs rounded-xl">
                <Layers size={13} />
                Batch Generate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Location selector */}
      <GlassCard className="p-5 flex flex-col gap-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Parking Location</label>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          className="glass-input text-sm"
        >
          <option value="">— Choose a location —</option>
          {locations.map(l => (
            <option key={l._id} value={l._id}>{l.name} ({l.address})</option>
          ))}
        </select>
      </GlassCard>

      {/* Create single slot form */}
      {showSingleForm && (
        <GlassCard className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 font-display">Add Single Slot</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Slot Number *</label>
              <input className="glass-input text-sm" value={singleForm.slotNumber} onChange={e => setSingleForm(p => ({...p, slotNumber: e.target.value}))} placeholder="e.g. A-01" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Zone *</label>
              <input className="glass-input text-sm" value={singleForm.parkingZone} onChange={e => setSingleForm(p => ({...p, parkingZone: e.target.value}))} placeholder="e.g. A" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Floor *</label>
              <input type="number" min="1" className="glass-input text-sm" value={singleForm.floor} onChange={e => setSingleForm(p => ({...p, floor: e.target.value}))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Vehicle Type *</label>
              <select className="glass-input text-sm" value={singleForm.vehicleType} onChange={e => setSingleForm(p => ({...p, vehicleType: e.target.value}))}>
                {vehicleTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Custom Price ($/hr)</label>
              <input type="number" min="0" step="0.5" className="glass-input text-sm" value={singleForm.price} onChange={e => setSingleForm(p => ({...p, price: e.target.value}))} placeholder="Leave blank to use location rate" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-900">
            <button onClick={() => setShowSingleForm(false)} className="btn-secondary py-2 px-4 text-xs rounded-xl"><X size={13} /> Cancel</button>
            <button onClick={handleCreateSingle} disabled={saving} className="btn-primary py-2 px-4 text-xs rounded-xl"><Check size={13} />{saving ? 'Creating...' : 'Create Slot'}</button>
          </div>
        </GlassCard>
      )}

      {/* Batch generate form */}
      {showBatchForm && (
        <GlassCard className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 font-display">Batch Generate Slots</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Zone *</label>
              <input className="glass-input text-sm" value={batchForm.parkingZone} onChange={e => setBatchForm(p => ({...p, parkingZone: e.target.value}))} placeholder="e.g. A" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Floor *</label>
              <input type="number" min="1" className="glass-input text-sm" value={batchForm.floor} onChange={e => setBatchForm(p => ({...p, floor: e.target.value}))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Vehicle Type *</label>
              <select className="glass-input text-sm" value={batchForm.vehicleType} onChange={e => setBatchForm(p => ({...p, vehicleType: e.target.value}))}>
                {vehicleTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Count *</label>
              <input type="number" min="1" max="100" className="glass-input text-sm" value={batchForm.count} onChange={e => setBatchForm(p => ({...p, count: e.target.value}))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Start Number</label>
              <input type="number" min="1" className="glass-input text-sm" value={batchForm.startNumber} onChange={e => setBatchForm(p => ({...p, startNumber: e.target.value}))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Custom Price ($/hr)</label>
              <input type="number" min="0" step="0.5" className="glass-input text-sm" value={batchForm.price} onChange={e => setBatchForm(p => ({...p, price: e.target.value}))} placeholder="Leave blank to use location rate" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-900">
            <button onClick={() => setShowBatchForm(false)} className="btn-secondary py-2 px-4 text-xs rounded-xl"><X size={13} /> Cancel</button>
            <button onClick={handleGenerateBatch} disabled={saving} className="btn-primary py-2 px-4 text-xs rounded-xl"><Layers size={13} />{saving ? 'Generating...' : `Generate ${batchForm.count} Slots`}</button>
          </div>
        </GlassCard>
      )}

      {/* Slot stats */}
      {selectedLocation && !loading && slots.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(slotCounts).map(([key, val]) => (
            <GlassCard key={key} className="p-3 text-center">
              <p className="text-lg font-bold font-display text-slate-100">{val}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest capitalize">{key}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Slots table */}
      {selectedLocation && (
        loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-900/30 border border-slate-900 rounded-xl" />)}
          </div>
        ) : slots.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <Grid size={28} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No slots for this location yet. Use Batch Generate to create them quickly.</p>
          </GlassCard>
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-900/20 border-b border-slate-900">
                  <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Slot No.</th>
                    <th className="text-left px-5 py-3">Zone</th>
                    <th className="text-left px-5 py-3">Floor</th>
                    <th className="text-left px-5 py-3">Type</th>
                    <th className="text-left px-5 py-3">Price</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {slots.map(slot => (
                    <tr key={slot._id} className="hover:bg-slate-800/10 transition-colors group">
                      {editingSlot === slot._id ? (
                        <>
                          <td className="px-5 py-3 font-mono font-bold text-slate-200">{slot.slotNumber}</td>
                          <td className="px-5 py-3">
                            <input className="glass-input py-1 text-xs w-16" value={editForm.parkingZone} onChange={e => setEditForm(p => ({...p, parkingZone: e.target.value}))} />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" min="1" className="glass-input py-1 text-xs w-16" value={editForm.floor} onChange={e => setEditForm(p => ({...p, floor: e.target.value}))} />
                          </td>
                          <td className="px-5 py-3">
                            <select className="glass-input py-1 text-xs" value={editForm.vehicleType} onChange={e => setEditForm(p => ({...p, vehicleType: e.target.value}))}>
                              {vehicleTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" min="0" step="0.5" className="glass-input py-1 text-xs w-20" value={editForm.price || ''} onChange={e => setEditForm(p => ({...p, price: e.target.value}))} placeholder="Default" />
                          </td>
                          <td className="px-5 py-3">
                            <select className="glass-input py-1 text-xs" value={editForm.status} onChange={e => setEditForm(p => ({...p, status: e.target.value}))}>
                              {slotStatuses.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdate(slot._id)} disabled={saving} className="btn-primary py-1 px-2 text-xs rounded-lg"><Check size={12} /></button>
                              <button onClick={() => setEditingSlot(null)} className="btn-secondary py-1 px-2 text-xs rounded-lg"><X size={12} /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3 font-mono font-bold text-slate-200">{slot.slotNumber}</td>
                          <td className="px-5 py-3 text-slate-400">{slot.parkingZone}</td>
                          <td className="px-5 py-3 text-slate-400">{slot.floor}</td>
                          <td className="px-5 py-3 text-slate-400">{slot.vehicleType}</td>
                          <td className="px-5 py-3 text-slate-400">{slot.price ? `$${slot.price}` : <span className="text-slate-600">Default</span>}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColors[slot.status] || ''}`}>
                              {slot.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingSlot(slot._id); setEditForm({ parkingZone: slot.parkingZone, floor: slot.floor, vehicleType: slot.vehicleType, price: slot.price || '', status: slot.status }); }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(slot)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/10 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )
      )}

      {!selectedLocation && (
        <GlassCard className="p-12 text-center">
          <Grid size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Select a parking location to manage its slots.</p>
        </GlassCard>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Slot"
        message={`Delete slot "${confirmDelete?.slotNumber}"? Active bookings may be affected.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete._id)}
        onClose={() => setConfirmDelete(null)}
        isDanger
      />

    </div>
  );
};

export default ManageSlots;

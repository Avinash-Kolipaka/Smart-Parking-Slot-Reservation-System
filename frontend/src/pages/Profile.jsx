import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import {
  User, Phone, Car, Bike, Zap, Plus, Trash2,
  Save, Edit3, Check, Shield, Mail
} from 'lucide-react';

const vehicleTypeIcons = { Car: Car, Bike: Bike, EV: Zap };

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicles: user?.vehicles || []
  });

  const [newVehicle, setNewVehicle] = useState({ plate: '', type: 'Car' });
  const [addingVehicle, setAddingVehicle] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
      setEditMode(false);
    } else {
      showToast(result.message || 'Update failed', 'error');
    }
  };

  const handleAddVehicle = () => {
    const plate = newVehicle.plate.trim().toUpperCase();
    if (!plate) return;
    if (formData.vehicles.some(v => v.plate === plate)) {
      showToast('Vehicle plate already added', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { plate, type: newVehicle.type }]
    }));
    setNewVehicle({ plate: '', type: 'Car' });
    setAddingVehicle(false);
  };

  const handleRemoveVehicle = (plate) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.plate !== plate)
    }));
  };

  const profileScore = (() => {
    let score = 30;
    if (formData.phone) score += 30;
    if (formData.vehicles.length > 0) score += 40;
    return score;
  })();

  return (
    <div className="max-w-3xl mx-auto px-6 w-full flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-100">My Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your account details and registered vehicles.</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => {
              setFormData({ name: user?.name || '', phone: user?.phone || '', vehicles: user?.vehicles || [] });
              setEditMode(true);
            }}
            className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile completion */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
              alt="avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-950">
              <Shield size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-100 font-display">{user?.name}</h2>
            <p className="text-xs text-slate-400 capitalize">{user?.role} Account</p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-slate-400">Profile Completion</span>
                <span className="text-blue-400">{profileScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Account Details */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">Account Details</h3>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User size={10} />
            Full Name
          </label>
          {editMode ? (
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="glass-input text-sm"
              placeholder="Your full name"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={10} />
            Email Address
            <span className="text-[8px] text-slate-600 normal-case tracking-normal ml-1">(Cannot be changed)</span>
          </label>
          <p className="text-sm font-semibold text-slate-400">{user?.email}</p>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={10} />
            Phone Number
          </label>
          {editMode ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="glass-input text-sm"
              placeholder="+1 (555) 000-0000"
            />
          ) : (
            <p className="text-sm font-semibold text-slate-200">
              {user?.phone || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          )}
        </div>
      </GlassCard>

      {/* Registered Vehicles */}
      <GlassCard className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display">Registered Vehicles</h3>
          {editMode && (
            <button
              onClick={() => setAddingVehicle(!addingVehicle)}
              className="btn-secondary py-1.5 px-3 text-xs rounded-lg"
            >
              <Plus size={12} />
              Add Vehicle
            </button>
          )}
        </div>

        {/* Add vehicle form */}
        {addingVehicle && editMode && (
          <div className="flex gap-3 p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
            <input
              type="text"
              value={newVehicle.plate}
              onChange={e => setNewVehicle(p => ({ ...p, plate: e.target.value }))}
              placeholder="License Plate (e.g. ABC-1234)"
              className="glass-input text-sm flex-1"
            />
            <select
              value={newVehicle.type}
              onChange={e => setNewVehicle(p => ({ ...p, type: e.target.value }))}
              className="glass-input text-sm w-28"
            >
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="EV">EV</option>
            </select>
            <button
              onClick={handleAddVehicle}
              className="btn-primary py-2 px-3 text-xs rounded-lg shrink-0"
            >
              <Check size={14} />
            </button>
          </div>
        )}

        {/* Vehicle list */}
        {formData.vehicles.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            <Car size={28} className="mx-auto mb-2 text-slate-700" />
            No vehicles registered. Add your vehicle plates to start booking.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {formData.vehicles.map((vehicle, i) => {
              const Icon = vehicleTypeIcons[vehicle.type] || Car;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-100 font-mono tracking-wide">{vehicle.plate}</p>
                      <p className="text-[10px] text-slate-500">{vehicle.type}</p>
                    </div>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleRemoveVehicle(vehicle.plate)}
                      className="text-rose-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-rose-950/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default Profile;

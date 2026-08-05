import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Users, Search, RefreshCcw, Trash2, Edit3, Shield,
  ShieldOff, User, Mail, Phone, Calendar, ChevronDown
} from 'lucide-react';

const roleColors = {
  admin: 'text-indigo-400 bg-indigo-950/20 border-indigo-500/20',
  customer: 'text-blue-400 bg-blue-950/20 border-blue-500/20'
};

const ManageUsers = () => {
  const { showToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId) => {
    setSavingId(userId);
    try {
      await api.put(`/users/${userId}`, { role: editRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: editRole } : u));
      showToast('User role updated successfully', 'success');
      setEditingId(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
    setConfirmDelete(null);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Manage Users</h1>
          <p className="text-xs text-slate-400 mt-1">View, update roles, and remove user accounts.</p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl">
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="glass-input pl-10 text-sm"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="bg-slate-900/40 border border-slate-800/60 px-3 py-1.5 rounded-lg">
          Total: <strong className="text-slate-200">{users.length}</strong>
        </span>
        <span className="bg-slate-900/40 border border-slate-800/60 px-3 py-1.5 rounded-lg">
          Admins: <strong className="text-indigo-400">{users.filter(u => u.role === 'admin').length}</strong>
        </span>
        <span className="bg-slate-900/40 border border-slate-800/60 px-3 py-1.5 rounded-lg">
          Customers: <strong className="text-blue-400">{users.filter(u => u.role === 'customer').length}</strong>
        </span>
      </div>

      {/* User table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col gap-3 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-900/30 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/20 border-b border-slate-900">
                <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-800/10 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                      {u.phone || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {editingId === u._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={e => setEditRole(e.target.value)}
                            className="glass-input text-xs py-1.5 px-2 w-28"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(u._id)}
                            disabled={savingId === u._id}
                            className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                          >
                            {savingId === u._id ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 hover:text-slate-300 text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${roleColors[u.role] || roleColors.customer}`}>
                          {u.role === 'admin' ? <Shield size={9} /> : <User size={9} />}
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(u._id); setEditRole(u.role); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                          title="Edit role"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the account for "${confirmDelete?.name}" (${confirmDelete?.email})? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete._id)}
        onClose={() => setConfirmDelete(null)}
        isDanger
      />

    </div>
  );
};

export default ManageUsers;

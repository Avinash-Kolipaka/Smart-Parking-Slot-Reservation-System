import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { Lock, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const newPassword = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${resetToken}`, { password: data.password });
      setSuccess(true);
      showToast('Your password has been modified successfully. Please sign in.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Token expired or invalid', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <GlassCard className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-lg border-slate-800/80 shadow-2xl relative animate-fade-in-up">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-950/20 text-blue-500 border border-blue-900/20 flex items-center justify-center mb-3">
            <KeyRound size={20} />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 mb-1.5">Reset Password</h2>
          <p className="text-xs text-slate-400">Choose a new secure password for your account.</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="glass-input pl-10"
                />
              </div>
              {errors.password && (
                <span className="text-[10px] font-semibold text-rose-500 pl-1">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === newPassword || 'Passwords do not match'
                  })}
                  className="glass-input pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] font-semibold text-rose-500 pl-1">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-3 py-3 rounded-xl">
              Reset Password
            </button>

          </form>
        ) : (
          <div className="text-center py-6 animate-fade-in-up flex flex-col gap-5 items-center">
            <CheckCircle className="text-emerald-400" size={48} />
            <p className="text-sm text-slate-300">
              Password changed successfully! You can now log into your account.
            </p>
            <Link to="/login" className="btn-primary w-full py-3 rounded-xl">
              Go to Login
            </Link>
          </div>
        )}

        {!success && (
          <div className="mt-8 pt-6 border-t border-slate-900/60 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        )}

      </GlassCard>
    </div>
  );
};

export default ResetPassword;

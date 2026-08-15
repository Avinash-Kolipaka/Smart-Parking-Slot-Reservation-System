import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';

const Register = () => {
  const { register: signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await signup(data.name, data.email, data.password, data.phone);
    setLoading(false);

    if (result.success) {
      showToast('Account created successfully! Welcome to SpotFlow.', 'success');
      navigate('/dashboard');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <GlassCard className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-lg border-slate-800/80 shadow-2xl relative animate-fade-in-up">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-100 mb-1.5">Get Started</h2>
          <p className="text-xs text-slate-400">Create an account to search and reserve parking slots.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          
          {/* Full Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className="glass-input pl-10"
              />
            </div>
            {errors.name && (
              <span className="text-[10px] font-semibold text-rose-500 pl-1">{errors.name.message}</span>
            )}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="john@gmail.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="glass-input pl-10"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] font-semibold text-rose-500 pl-1">{errors.email.message}</span>
            )}
          </div>

          {/* Phone field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Phone size={16} />
              </span>
              <input
                type="text"
                placeholder="+1 555-0144"
                {...register('phone')}
                className="glass-input pl-10"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
              Choose Password
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
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                className="glass-input pl-10"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] font-semibold text-rose-500 pl-1">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Trigger */}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-3 py-3 rounded-xl">
            <UserPlus size={16} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        {/* Footer toggler */}
        <div className="text-center text-xs text-slate-400 mt-8 pt-6 border-t border-slate-900/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:underline">
            Sign in instead
          </Link>
        </div>

      </GlassCard>
    </div>
  );
};

export default Register;

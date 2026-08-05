import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { Mail, Lock, ShieldAlert, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // If redirect message exists
  const isExpired = searchParams.get('expired') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      showToast('Welcome back to SpotFlow!', 'success');
      
      // Determine redirection (check if admin or user)
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Quick decode to check role and route accordingly
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'admin') {
            navigate('/admin');
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      navigate('/dashboard');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <GlassCard className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-lg border-slate-800/80 shadow-2xl relative">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-100 mb-1.5">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your account to manage slot bookings.</p>
        </div>

        {/* Overdue/Session Expired Alert Banner */}
        {isExpired && (
          <div className="flex items-center gap-2 p-3.5 mb-6 border border-amber-500/20 bg-amber-950/15 text-amber-400 rounded-xl text-xs leading-relaxed animate-fade-in-up">
            <ShieldAlert size={16} className="shrink-0" />
            <span>Your login session has expired. Please sign in again.</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          
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
                placeholder="name@gmail.com"
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

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
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

          {/* Submit Trigger */}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-3 py-3 rounded-xl">
            <LogIn size={16} />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Footer toggler */}
        <div className="text-center text-xs text-slate-400 mt-8 pt-6 border-t border-slate-900/60">
          New to SpotFlow?{' '}
          <Link to="/register" className="font-semibold text-blue-400 hover:underline">
            Create an account
          </Link>
        </div>

      </GlassCard>
    </div>
  );
};

export default Login;

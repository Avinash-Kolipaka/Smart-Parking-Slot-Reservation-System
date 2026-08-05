import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { Mail, HelpCircle, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
      showToast('If the email is registered, a password reset link has been dispatched.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
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
            <HelpCircle size={20} />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 mb-1.5">Forgot Password?</h2>
          <p className="text-xs text-slate-400">
            No worries! Enter your email below to receive a password reset link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Account Email
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

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-3 py-3 rounded-xl">
              <Send size={16} />
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

          </form>
        ) : (
          <div className="text-center py-6 animate-fade-in-up flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              An email has been dispatched to you with reset steps. Please check your inbox (or console server log in development).
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-xs text-blue-400 hover:underline"
            >
              Didn't receive email? Try again
            </button>
          </div>
        )}

        {/* Back control */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>

      </GlassCard>
    </div>
  );
};

export default ForgotPassword;

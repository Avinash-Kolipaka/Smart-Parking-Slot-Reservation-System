import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import GlassCard from '../components/GlassCard';
import { 
  CreditCard, ShieldCheck, Mail, MapPin, 
  Calendar, Clock, Landmark, Smartphone, Lock 
} from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Payment card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data.data);
      } catch (err) {
        showToast('Failed to retrieve reservation details', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        showToast('Please fill in card detail fields', 'warning');
        return;
      }
    }

    setProcessing(true);
    try {
      // Hit processPayment endpoint
      const response = await api.post('/payment', {
        bookingId: id,
        paymentMethod
      });

      showToast('Payment Simulation Completed Successfully!', 'success');
      navigate(`/bookings/${id}/success`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction processing failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 w-full py-12 flex items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-100 mb-1">
          Review Invoice & Pay
        </h1>
        <p className="text-xs text-slate-400">Review your ticket summary and select a simulation method to complete reservation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Invoice details (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Invoice Summary */}
          <GlassCard className="p-6 bg-slate-900/20 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
              Booking Receipt
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
              
              <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">PARKING FACILITY</span>
                <span className="font-bold text-slate-200 text-sm mt-0.5">{booking.locationId?.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-blue-500" />
                  {booking.locationId?.address}
                </span>
              </div>

              <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold">TICKET METADATA</span>
                <span className="font-bold text-slate-200 mt-0.5">Booking Ref: {booking.bookingId}</span>
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar size={10} className="text-blue-500" />
                  Slot: Spot {booking.slotId?.slotNumber} (Floor {booking.slotId?.floor})
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Timing</h4>
                <div className="flex flex-col gap-1.5 text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock size={12} className="text-blue-500" />
                    Start: {new Date(booking.startTime).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock size={12} className="text-blue-500" />
                    End: {new Date(booking.endTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</h4>
                <div className="flex flex-col gap-1.5 text-slate-300">
                  <span>License Plate: <strong>{booking.vehicleNumber}</strong></span>
                  <span className="capitalize">Category: {booking.vehicleType}</span>
                </div>
              </div>

            </div>

          </GlassCard>

          {/* Payment Method Selector */}
          <GlassCard className="p-6 bg-slate-900/20 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
              Payment Method Simulation
            </h3>

            <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
              {[
                { id: 'Card', label: 'Credit Card', icon: CreditCard },
                { id: 'UPI', label: 'UPI QR Pay', icon: Smartphone },
                { id: 'NetBanking', label: 'NetBanking', icon: Landmark }
              ].map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Render method fields */}
            {paymentMethod === 'Card' ? (
              <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-4">
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/60 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/60 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">CVV Code</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    maxLength="3"
                    className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500/60 font-mono"
                  />
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full py-2.5 rounded-xl text-xs font-semibold shadow-none flex items-center justify-center gap-1.5"
                  >
                    <Lock size={12} />
                    {processing ? 'Processing...' : 'Simulate Pay'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-950/40 border border-slate-900 rounded-2xl p-4 gap-4 mt-2">
                <span className="text-xs text-slate-400">
                  Simulating payment check via {paymentMethod} API gateways.
                </span>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={processing}
                  className="btn-primary py-2 px-6 rounded-xl text-xs font-semibold shadow-none"
                >
                  Confirm Mock Payment
                </button>
              </div>
            )}

          </GlassCard>

        </div>

        {/* Right Side: Total Summary */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="p-6 bg-slate-900/20 border-slate-800/80 flex flex-col gap-5 sticky top-28">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
              Checkout Fees
            </h3>

            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Subtotal Reserved</span>
                <span className="font-semibold text-slate-200">${booking.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Service Fee (Mock)</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-900/60 pt-3 mt-1 text-sm font-bold">
                <span className="text-slate-400">Total Payable</span>
                <span className="text-slate-100">${booking.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 p-3 border border-slate-900 bg-slate-950/20 text-slate-500 rounded-xl text-[10px] leading-relaxed">
              <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
              <span>
                Mock Gateway Mode: Clicking Pay updates reservation parameters to Confirmed instantly. No actual currency transaction occurs.
              </span>
            </div>

          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default BookingPage;

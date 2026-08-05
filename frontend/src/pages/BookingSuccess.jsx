import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, Home, History, Calendar, MapPin, Grid } from 'lucide-react';

const BookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data.data);
        
        // Trigger visual confetti explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleDownloadQR = () => {
    if (!booking?.qrUrl) return;
    const link = document.createElement('a');
    link.href = booking.qrUrl;
    link.download = `SpotFlow-Ticket-${booking.bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="max-w-3xl mx-auto px-6 w-full flex flex-col items-center gap-8 text-center animate-fade-in-up">
      
      {/* Icon check circle */}
      <div className="w-16 h-16 rounded-full bg-emerald-950/20 text-emerald-500 border border-emerald-900/30 flex items-center justify-center shadow-lg shadow-emerald-500/5 mt-6">
        <CheckCircle2 size={32} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-display text-slate-100">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-slate-400">Your parking spot has been secured. Your invoice details are recorded.</p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
        
        {/* Ticket receipt info */}
        <GlassCard className="md:col-span-3 p-6 text-left flex flex-col gap-5 bg-slate-900/20 border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-display border-b border-slate-900/60 pb-3">
            Reservation Ticket
          </h3>

          <div className="flex flex-col gap-3.5 text-xs">
            <div className="flex items-start gap-2 text-slate-400 leading-relaxed">
              <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block text-sm">{booking.locationId?.name}</strong>
                <span className="text-[10px] text-slate-500">{booking.locationId?.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 py-1.5 border-t border-b border-slate-900/60 font-mono">
              <Calendar size={14} className="text-blue-500" />
              <span>
                Window: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Grid size={14} className="text-blue-500" />
                <div>
                  <span className="text-[9px] text-slate-500 block">ASSIGNED SPOT</span>
                  <span className="font-semibold text-slate-200">Spot {booking.slotId?.slotNumber} (Floor {booking.slotId?.floor})</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">VEHICLE PLATE</span>
                <span className="font-semibold text-slate-200">{booking.vehicleNumber}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-900/60 pt-4 mt-2">
              <div>
                <span className="text-[9px] text-slate-500 block">AMOUNT CHARGED</span>
                <span className="text-sm font-bold text-slate-200">${booking.amount.toFixed(2)}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 px-3 py-1 bg-emerald-950/20 border border-emerald-900/30 rounded-full">
                PAID & LOCKED
              </span>
            </div>
          </div>
        </GlassCard>

        {/* QR code download visual */}
        <GlassCard className="md:col-span-2 p-6 flex flex-col items-center justify-center gap-4 bg-slate-900/20 border-slate-800/80">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            {booking.qrUrl ? (
              <img
                src={booking.qrUrl}
                alt="ticket qr"
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                Loading Ticket QR...
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadQR}
            className="btn-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            Download Ticket
          </button>
        </GlassCard>

      </div>

      {/* Footer navigation */}
      <div className="flex gap-4 border-t border-slate-900/60 pt-8 mt-4 w-full justify-center">
        <Link
          to="/dashboard"
          className="btn-secondary py-2.5 px-6 text-xs font-semibold rounded-xl"
        >
          <Home size={14} />
          Go to Dashboard
        </Link>
        <Link
          to="/history"
          className="btn-primary py-2.5 px-6 text-xs font-semibold rounded-xl shadow-none"
        >
          <History size={14} />
          My Booking History
        </Link>
      </div>

    </div>
  );
};

export default BookingSuccess;

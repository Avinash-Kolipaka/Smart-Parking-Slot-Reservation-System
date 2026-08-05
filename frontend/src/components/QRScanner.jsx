import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Camera, CheckCircle2, AlertOctagon, ScanLine, ArrowRightLeft, UserCheck, UserMinus } from 'lucide-react';

const QRScanner = ({ onScanSuccess }) => {
  const { showToast } = useState; // Actually useNotifications
  const notifications = useNotifications();
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [scannedResult, setScannedResult] = useState(null);
  
  // List of active bookings available to simulate scanning
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/bookings');
      // Only get Confirmed (ready to check in) or Active (ready to check out)
      const list = response.data.data.filter(b => ['Confirmed', 'Active'].includes(b.bookingStatus));
      setReservations(list);
    } catch (err) {
      console.error('Failed to load active tickets for scanner:', err.message);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleVerify = async (scanPayload) => {
    setLoading(true);
    setScannedResult(null);
    try {
      // payload structure: { bookingId, userId, slotId, token }
      const parsed = typeof scanPayload === 'string' ? JSON.parse(scanPayload) : scanPayload;
      
      const response = await api.post('/bookings/verify-qr', {
        token: parsed.token,
        bookingId: parsed.bookingId,
        slotId: parsed.slotId
      });

      const result = response.data;
      setScannedResult({
        success: true,
        action: result.action,
        message: result.message,
        bookingId: result.data.bookingId,
        checkTime: result.action === 'CHECK_IN' ? result.data.checkInTime : result.data.checkOutTime
      });

      notifications.showToast(result.message, 'success');
      
      // Refresh options list
      fetchReservations();
      if (onScanSuccess) {
        onScanSuccess(result);
      }
    } catch (err) {
      setScannedResult({
        success: false,
        message: err.response?.data?.message || 'Invalid Ticket QR payload'
      });
      notifications.showToast(err.response?.data?.message || 'Scan validation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Simulate scanning a specific booking
  const handleSimulateScan = (booking) => {
    const payload = {
      bookingId: booking.bookingId,
      userId: booking.userId?._id || booking.userId,
      slotId: booking.slotId?._id || booking.slotId,
      token: booking.verificationToken
    };
    handleVerify(payload);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken) return;
    try {
      handleVerify(manualToken);
    } catch (err) {
      notifications.showToast('Please enter a valid JSON QR payload', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Scanner Visual Panel */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-display">
          Ticket Camera Feed
        </h3>
        
        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden flex items-center justify-center shadow-inner">
          {cameraActive ? (
            <>
              {/* Camera Grid Lines */}
              <div className="absolute inset-8 border border-dashed border-blue-500/20 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 border-t-2 border-l-2 border-blue-500 absolute top-0 left-0" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-blue-500 absolute top-0 right-0" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-blue-500 absolute bottom-0 left-0" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-blue-500 absolute bottom-0 right-0" />
              </div>
              
              {/* Scanning Laser Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/50 animate-[bounce_3s_infinite]" />
              
              <div className="flex flex-col items-center gap-3 opacity-60">
                <Camera size={36} className="text-slate-500 animate-pulse" />
                <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                  SIMULATING CAMERA SCAN...
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-600 font-mono">CAMERA FEED STANDBY</span>
          )}
        </div>

        <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Validator Status: Ready</span>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            {cameraActive ? 'Deactivate Lens' : 'Activate Lens'}
          </button>
        </div>
      </div>

      {/* Simulator Actions & Logs */}
      <div className="flex flex-col gap-6">
        
        {/* Ticket Selector Simulator */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-display">
            Simulate QR Scan (Development Testing)
          </h3>
          <p className="text-xs text-slate-400">
            Select an active customer ticket to simulate placing it in front of the barcode scanner:
          </p>

          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
            {reservations.map(res => (
              <button
                key={res._id}
                disabled={loading}
                onClick={() => handleSimulateScan(res)}
                className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-800/80 hover:border-blue-500/30 hover:bg-slate-900/70 rounded-xl text-left transition-all duration-200"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{res.bookingId}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {res.vehicleType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
                    Lot: {res.locationId?.name || 'Loc'} | Slot: {res.slotId?.slotNumber || 'Slot'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {res.bookingStatus === 'Confirmed' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-950/20 border border-emerald-900/30 rounded-full">
                      <UserCheck size={12} />
                      CHECK-IN
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 px-2 py-1 bg-amber-950/20 border border-amber-900/30 rounded-full">
                      <UserMinus size={12} />
                      CHECK-OUT
                    </span>
                  )}
                </div>
              </button>
            ))}

            {reservations.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-900 rounded-xl text-xs text-slate-500 font-mono">
                No active Confirmed or Active reservations found in the database.
              </div>
            )}
          </div>
        </div>

        {/* Scan Status Logger */}
        {scannedResult && (
          <div
            className={`p-4 border rounded-xl animate-fade-in-up flex gap-3 ${
              scannedResult.success
                ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
                : 'border-rose-500/20 bg-rose-950/10 text-rose-300'
            }`}
          >
            <div className="mt-0.5">
              {scannedResult.success ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertOctagon size={20} className="text-rose-400" />}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                {scannedResult.success ? `SCAN SUCCESS (${scannedResult.action})` : 'SCAN EXCEPTION'}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{scannedResult.message}</p>
              {scannedResult.success && (
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  Ticket Ref: {scannedResult.bookingId} | Timestamp: {new Date(scannedResult.checkTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* Manual JSON scan entry */}
      <form onSubmit={handleManualSubmit} className="col-span-1 lg:col-span-2 border-t border-slate-900/60 pt-6 mt-2 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
          Enter Raw Ticket QR String (Alternative Debugging)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder='e.g. {"bookingId": "PRK-...", "token": "...", "slotId": "..."}'
            className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2 px-6 rounded-xl text-xs font-semibold shadow-none"
          >
            Submit Raw String
          </button>
        </div>
      </form>

    </div>
  );
};

export default QRScanner;

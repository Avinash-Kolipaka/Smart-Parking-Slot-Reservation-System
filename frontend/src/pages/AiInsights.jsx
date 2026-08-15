import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AiInsights = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [peakTime, setPeakTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load parking locations for the dropdown
    const fetchLocations = async () => {
      try {
        const res = await api.get('/parking');
        if (res.data.success) {
          setLocations(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedLocation(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    
    const fetchInsights = async () => {
      setLoading(true);
      try {
        // Fetch occupancy predictions
        const occRes = await api.get(`/admin/ai/occupancy/${selectedLocation}`);
        if (occRes.data.success) {
          const formattedData = occRes.data.data.predictions.map(p => ({
            time: new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            occupancy: p.expectedOccupancyRate,
            revenue: p.expectedRevenue
          }));
          setPredictions(formattedData);
          setPeakTime(new Date(occRes.data.data.peakTime).toLocaleTimeString());
        }

        // Fetch anomalies
        const anomRes = await api.get('/admin/ai/anomalies');
        if (anomRes.data.success) {
          setAnomalies(anomRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch insights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedLocation]);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Intelligence Dashboard
        </h1>
        <p className="text-xs text-slate-400">Predictive occupancy, revenue forecasts, and anomaly detection.</p>
      </div>

      <div className="glass-card p-4 flex gap-4 items-center bg-slate-900/40">
        <label className="text-sm font-medium text-slate-300">Select Location:</label>
        <select 
          value={selectedLocation} 
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 min-w-[200px]"
        >
          {locations.map(loc => (
            <option key={loc._id} value={loc._id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 bg-slate-900/20">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">Occupancy Prediction (Next 12 Hours)</h2>
              {predictions.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="occupancy" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Expected Occupancy (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Insufficient historical data to predict occupancy.</p>
              )}
            </div>

            <div className="glass-card p-6 bg-slate-900/20 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Intelligence Insights</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Expected Peak Time</p>
                    <p className="text-2xl font-display font-bold text-indigo-400">{peakTime || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Status Classification</p>
                    <p className="text-2xl font-display font-bold text-emerald-400">Healthy</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Automated Recommendation</h3>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-200">
                  Based on historical Friday demand, occupancy is expected to peak safely below capacity. No immediate pricing intervention is necessary.
                </div>
              </div>
            </div>
          </div>

          {/* Anomalies Row */}
          <div className="glass-card p-6 bg-slate-900/20">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Detected Anomalies
            </h2>
            {anomalies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Severity</th>
                      <th className="px-4 py-3">Metric</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 rounded-tr-lg">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((anom) => (
                      <tr key={anom._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${anom.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {anom.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{anom.anomalyType}</td>
                        <td className="px-4 py-3">{anom.parkingId?.name || 'System Wide'}</td>
                        <td className="px-4 py-3 text-slate-400">{anom.recommendation || 'Investigate manually.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                No active anomalies detected in the system.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AiInsights;

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, MapPin } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center flex flex-col items-center gap-8 relative z-10">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-blue-950/30 border border-blue-900/30 flex items-center justify-center">
          <MapPin size={42} className="text-blue-500" strokeWidth={1.5} />
        </div>

        {/* Error code */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[120px] font-extrabold font-display leading-none text-transparent bg-gradient-to-b from-slate-700 to-slate-900 bg-clip-text select-none">
            404
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-100 -mt-6">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            The parking spot you&apos;re looking for doesn&apos;t exist. It may have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-primary py-3 px-6 text-sm font-semibold rounded-xl">
            <Home size={16} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary py-3 px-6 text-sm font-semibold rounded-xl"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

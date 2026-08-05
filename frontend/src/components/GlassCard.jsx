import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-blue-500/30 hover:bg-slate-900/50 hover:shadow-blue-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;

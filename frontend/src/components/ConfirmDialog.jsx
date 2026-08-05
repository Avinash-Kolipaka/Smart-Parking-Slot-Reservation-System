import React from 'react';
import { ShieldAlert } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onClose, isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative glow-blue animate-fade-in-up">
        
        {/* Warning Icon Banner */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
          isDanger ? 'bg-rose-950/20 text-rose-500 border border-rose-900/30' : 'bg-blue-950/20 text-blue-500 border border-blue-900/30'
        }`}>
          <ShieldAlert size={22} />
        </div>

        {/* Text Details */}
        <h3 className="text-lg font-bold font-display text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {message}
        </p>

        {/* Buttons Action Group */}
        <div className="flex justify-end gap-3 border-t border-slate-900 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-900 hover:border-slate-800 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              isDanger 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;

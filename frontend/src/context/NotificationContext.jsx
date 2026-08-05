import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let Icon = Info;
          let iconColor = 'text-blue-400';
          let borderGlow = 'border-blue-500/20 shadow-blue-500/5';
          
          if (toast.type === 'success') {
            Icon = CheckCircle;
            iconColor = 'text-emerald-400';
            borderGlow = 'border-emerald-500/20 shadow-emerald-500/5';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
            borderGlow = 'border-rose-500/20 shadow-rose-500/5';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
            borderGlow = 'border-amber-500/20 shadow-amber-500/5';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 bg-slate-900/80 backdrop-blur-md border rounded-xl shadow-lg transition-all duration-300 animate-fade-in-up ${borderGlow}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 text-sm font-medium text-slate-200">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

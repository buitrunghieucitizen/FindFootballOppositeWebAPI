import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

const typeConfig = {
  success: {
    icon: FiCheckCircle,
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
    accent: 'bg-emerald-500',
  },
  error: {
    icon: FiAlertCircle,
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    accent: 'bg-red-500',
  },
  warning: {
    icon: FiAlertTriangle,
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    accent: 'bg-amber-500',
  },
  info: {
    icon: FiInfo,
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    accent: 'bg-blue-500',
  },
};

let toastId = 0;

function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 ${config.bg} border ${config.border} rounded-xl px-4 py-3.5 shadow-xl shadow-black/5
 min-w-0 w-[calc(100vw-2rem)] sm:min-w-[320px] max-w-[420px] relative overflow-hidden transition-all duration-300 ease-out
 ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent} rounded-l-xl`} />

      <Icon className={`text-xl ${config.iconColor} shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
      >
        <FiX className="text-sm" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - Top Right */}
      <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

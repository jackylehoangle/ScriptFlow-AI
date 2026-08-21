import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default: success/info = 3500, error/warning = 5500
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Event-based global trigger for non-React contexts if needed
export const dispatchGlobalToast = (options: ToastOptions) => {
  window.dispatchEvent(new CustomEvent('app-global-toast', { detail: options }));
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = options.id || uuidv4();
    const type: ToastType = options.type || 'info';
    const duration = options.duration ?? (type === 'error' ? 6000 : type === 'warning' ? 5000 : 3800);

    const newToast: ToastItem = {
      ...options,
      id,
      type,
      createdAt: Date.now(),
      duration
    };

    setToasts((prev) => {
      // Limit to 5 simultaneous toasts
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered.slice(-4), newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message: string, title: string = 'Thành công', duration?: number) => {
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const error = useCallback((message: string, title: string = 'Lỗi hệ thống', duration?: number) => {
    return showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const warning = useCallback((message: string, title: string = 'Chú ý', duration?: number) => {
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const info = useCallback((message: string, title: string = 'Thông báo', duration?: number) => {
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  // Listen to global events
  useEffect(() => {
    const handleGlobalEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ToastOptions>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };
    window.addEventListener('app-global-toast', handleGlobalEvent);
    return () => window.removeEventListener('app-global-toast', handleGlobalEvent);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// =========================================================================
// TOAST CONTAINER & INDIVIDUAL TOAST CARD
// =========================================================================
const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const { type, title, message, action, duration = 4000 } = toast;

  const styleConfig = {
    success: {
      border: 'border-emerald-500/40',
      bg: 'bg-slate-900/95 backdrop-blur-md',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      titleColor: 'text-emerald-300',
      textColor: 'text-emerald-100/90',
      progressBar: 'bg-emerald-500',
      icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
    },
    error: {
      border: 'border-rose-500/50',
      bg: 'bg-slate-950/95 backdrop-blur-md',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      titleColor: 'text-rose-300',
      textColor: 'text-rose-100/90',
      progressBar: 'bg-rose-500',
      icon: <AlertCircle size={18} className="text-rose-400 shrink-0" />
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-slate-900/95 backdrop-blur-md',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      titleColor: 'text-amber-300',
      textColor: 'text-amber-100/90',
      progressBar: 'bg-amber-500',
      icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />
    },
    info: {
      border: 'border-blue-500/40',
      bg: 'bg-slate-900/95 backdrop-blur-md',
      iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      titleColor: 'text-blue-300',
      textColor: 'text-blue-100/90',
      progressBar: 'bg-blue-500',
      icon: <Info size={18} className="text-blue-400 shrink-0" />
    }
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl shadow-2xl border ${styleConfig.border} ${styleConfig.bg} p-3.5 flex items-start gap-3 w-full text-left`}
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-xl shrink-0 ${styleConfig.iconBg}`}>
        {styleConfig.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className={`text-xs font-bold ${styleConfig.titleColor} flex items-center gap-1.5 leading-tight mb-0.5`}>
            {title}
          </h4>
        )}
        <p className={`text-xs ${styleConfig.textColor} leading-relaxed break-words`}>
          {message}
        </p>

        {action && (
          <div className="mt-2">
            <button
              onClick={() => {
                action.onClick();
                onDismiss();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>{action.label}</span>
              <ExternalLink size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
        aria-label="Đóng thông báo"
      >
        <X size={14} />
      </button>

      {/* Progress Bar indicator */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${styleConfig.progressBar} opacity-70`}
        />
      )}
    </motion.div>
  );
};

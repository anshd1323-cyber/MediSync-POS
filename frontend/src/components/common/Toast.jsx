// ============================================================
// Toast — notification system
// ============================================================
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title || '',
      duration: options.duration ?? 4000,
    };
    setToasts((prev) => [...prev, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, opts) => addToast(msg, { ...opts, type: 'success', title: opts?.title || 'Success' }),
    error: (msg, opts) => addToast(msg, { ...opts, type: 'error', title: opts?.title || 'Error' }),
    warning: (msg, opts) => addToast(msg, { ...opts, type: 'warning', title: opts?.title || 'Warning' }),
    info: (msg, opts) => addToast(msg, { ...opts, type: 'info', title: opts?.title || 'Info' }),
    dismiss,
  }), [addToast, dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" id="toast-container">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`toast toast-${t.type}`} id={`toast-${t.id}`}>
              <Icon size={20} className="toast-icon" />
              <div className="toast-content">
                {t.title && <div className="toast-title">{t.title}</div>}
                <div className="toast-message">{t.message}</div>
              </div>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

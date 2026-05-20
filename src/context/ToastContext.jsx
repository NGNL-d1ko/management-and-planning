import { createContext, useCallback, useContext, useState } from 'react';

let nextId = 0;

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'success', duration = 3000) => {
    const id = ++nextId;
    setToasts((current) => [...current, { id, message, variant, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;

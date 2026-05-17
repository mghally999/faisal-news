'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '@/components/Toast/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    ({ message, variant = 'info', duration = 3500 }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, variant }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      info: (message) => push({ message, variant: 'info' }),
      success: (message) => push({ message, variant: 'success' }),
      error: (message) => push({ message, variant: 'error' }),
      dismiss
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
};

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons: Record<Toast['type'], ReactNode> = {
    success: <IconCheck size={18} />,
    error: <IconX size={18} />,
    info: <IconInfoCircle size={18} />,
  };

  const colors: Record<Toast['type'], string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${colors[toast.type]} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 pointer-events-auto cursor-pointer animate-toast-in min-w-[260px] max-w-[360px]`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span className="flex-shrink-0">{icons[toast.type]}</span>
            <span className="text-sm font-medium leading-snug">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

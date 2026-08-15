'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title?: string; description: string; type?: ToastType; duration?: number }) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = 'info', duration = 4000 }: { title?: string; description: string; type?: ToastType; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 sm:bottom-6 right-0 left-0 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 p-4 sm:p-0 pointer-events-none max-w-md ml-auto">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 animate-fade-in',
                t.type === 'success' && 'border-emerald-200 dark:border-emerald-800/80',
                t.type === 'warning' && 'border-amber-200 dark:border-amber-800/80',
                t.type === 'error' && 'border-rose-200 dark:border-rose-800/80',
                t.type === 'info' && 'border-slate-200 dark:border-slate-800'
              )}
            >
              {icons[t.type || 'info']}
              <div className="flex-1 pr-2">
                {t.title && (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t.title}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  {t.description}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      toast: ({ description }: { description: string }) => console.log('Toast:', description),
    };
  }
  return context;
}

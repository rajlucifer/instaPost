import { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
          classes: 'border-emerald-500/20 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-50 shadow-emerald-500/10'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
          classes: 'border-rose-500/20 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-50 shadow-rose-500/10'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
          classes: 'border-amber-500/20 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-50 shadow-amber-500/10'
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
          classes: 'border-sky-500/20 bg-sky-50/95 dark:bg-sky-950/90 text-sky-900 dark:text-sky-50 shadow-sky-500/10'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full sm:w-80">
        {toasts.map(toast => {
          const { icon, classes } = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-slide-in cursor-pointer hover:scale-[1.02] ${classes}`}
              onClick={() => removeToast(toast.id)}
            >
              {icon}
              <div className="flex-1 text-sm font-semibold pr-2 leading-snug">
                {toast.message}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
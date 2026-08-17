import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
        isSuccess
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        )}
        <p className="text-sm font-medium leading-tight">{message}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;

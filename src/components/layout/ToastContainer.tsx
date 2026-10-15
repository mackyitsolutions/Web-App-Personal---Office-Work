import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useWorkOS } from '../../context/WorkOSContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWorkOS();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200
              ${
                isSuccess
                  ? 'bg-slate-900 border-teal-500/50 text-white'
                  : isError
                  ? 'bg-rose-950 border-rose-500/60 text-white'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

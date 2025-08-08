import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { Toast, toastManager } from '../../utils/toastManager';

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const getIcon = (type: Toast['type']) => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-orange-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getBackgroundClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-orange-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getBackgroundClass(toast.type)}
            border rounded-lg p-4 shadow-lg animate-fade-in
            transform transition-all duration-300 ease-in-out
          `}
        >
          <div className="flex items-start">
            {getIcon(toast.type)}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${getTextClass(toast.type)}`}>
                  {toast.title}
                </p>
                <button
                  onClick={() => toastManager.remove(toast.id)}
                  className={`ml-2 ${getTextClass(toast.type)} hover:opacity-70`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {toast.message && (
                <p className={`text-sm ${getTextClass(toast.type)} opacity-90 mt-1`}>
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className={`mt-2 text-sm font-medium ${getTextClass(toast.type)} underline hover:no-underline`}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
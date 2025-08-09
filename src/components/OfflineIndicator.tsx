import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessage('Connexion rétablie');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setMessage('Mode hors-ligne activé');
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Bannière permanente en mode hors-ligne
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Mode hors-ligne - Certaines fonctionnalités sont limitées
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Toast de notification pour changement d'état
  if (showToast && isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-slideUp">
        <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;

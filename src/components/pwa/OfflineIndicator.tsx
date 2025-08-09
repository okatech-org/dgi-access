/**
 * Indicateur de mode hors-ligne pour PWA
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (wasOffline && !isOffline) {
      // Vient de revenir en ligne
      setShowBackOnline(true);
      const timer = setTimeout(() => {
        setShowBackOnline(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isOffline) {
      setWasOffline(true);
    }
  }, [isOffline, wasOffline]);

  // Notification de retour en ligne
  if (showBackOnline) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connexion rétablie</span>
        </div>
      </div>
    );
  }

  // Bandeau mode hors-ligne
  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              Mode hors-ligne - Certaines fonctionnalités peuvent être limitées
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

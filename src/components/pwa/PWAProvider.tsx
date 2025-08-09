/**
 * Provider pour gérer l'état global de la PWA
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { InstallPrompt } from './InstallPrompt';
import { UpdatePrompt } from './UpdatePrompt';
import { OfflineIndicator } from './OfflineIndicator';

type PWAContextType = ReturnType<typeof usePWA>;

const PWAContext = createContext<PWAContextType | null>(null);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const pwaState = usePWA();

  return (
    <PWAContext.Provider value={pwaState}>
      {children}
      <InstallPrompt />
      <UpdatePrompt />
      <OfflineIndicator />
    </PWAContext.Provider>
  );
};

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider');
  }
  return context;
};

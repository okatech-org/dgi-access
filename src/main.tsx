import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApp } from './utils/initializeApp';
import { initializePWAEnhancements } from './utils/pwaHelpers';

// Initialiser l'application au démarrage
initializeApp();

// Initialiser les améliorations PWA
initializePWAEnhancements();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

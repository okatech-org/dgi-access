import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    isOffline: !navigator.onLine,
    registration: null
  });

  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // Enregistrer le Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker non supporté');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker enregistré avec succès:', registration);
      
      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration
      }));

      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
              setShowUpdatePrompt(true);
            }
          });
        }
      });

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  }, []);

  // Mettre à jour le Service Worker
  const updateServiceWorker = useCallback(() => {
    if (state.registration?.waiting) {
      // Envoyer message au SW pour qu'il prenne le contrôle
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recharger la page quand le nouveau SW prend le contrôle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, [state.registration]);

  // Nettoyer le cache
  const clearCache = useCallback(async () => {
    if (!state.registration) return;

    const messageChannel = new MessageChannel();
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          console.log('Cache nettoyé avec succès');
          resolve(true);
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }, [state.registration]);

  // Synchroniser les données en arrière-plan
  const syncData = useCallback(async () => {
    if (!state.registration || !('sync' in state.registration)) {
      console.log('Background Sync non supporté');
      return;
    }

    try {
      await (state.registration as any).sync.register('sync-visitors');
      console.log('Synchronisation en arrière-plan enregistrée');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la synchronisation:', error);
    }
  }, [state.registration]);

  // Gérer l'état online/offline
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      // Synchroniser automatiquement quand on revient en ligne
      syncData();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  // Enregistrer le SW au montage
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  // Gérer les messages du Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        console.log('Synchronisation terminée:', event.data.message);
        // Vous pouvez afficher une notification ici
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    ...state,
    showUpdatePrompt,
    setShowUpdatePrompt,
    updateServiceWorker,
    clearCache,
    syncData
  };
};

export default useServiceWorker;

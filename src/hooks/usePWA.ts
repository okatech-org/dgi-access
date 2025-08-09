/**
 * Hook React pour gérer l'installation et les fonctionnalités PWA
 */

import { useState, useEffect, useCallback } from 'react';
import { platformDetector, getPlatformInfo } from '../utils/platformDetection';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: ReturnType<typeof getPlatformInfo>;
  showInstallPrompt: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  isOffline: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    platform: getPlatformInfo(),
    showInstallPrompt: false,
    isUpdating: false,
    updateAvailable: false,
    isOffline: !navigator.onLine
  });

  // Vérifier si l'app est déjà installée
  const checkIfInstalled = useCallback(() => {
    const isInstalled = platformDetector.isStandalone() ||
                       window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       window.matchMedia('(display-mode: minimal-ui)').matches;
    
    setState(prev => ({ ...prev, isInstalled }));
    return isInstalled;
  }, []);

  // Gérer l'événement beforeinstallprompt (Android/Desktop)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        showInstallPrompt: shouldShowPrompt()
      }));
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setState(prev => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
        showInstallPrompt: false
      }));
      
      // Sauvegarder l'état d'installation
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-date', new Date().toISOString());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Vérifier l'état initial
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIfInstalled]);

  // Gérer l'état en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gérer les mises à jour du Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        setState(prev => ({ ...prev, updateAvailable: true }));
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Vérifier les mises à jour
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });
      });

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // Décider si on doit montrer le prompt d'installation
  const shouldShowPrompt = (): boolean => {
    // Ne pas montrer si déjà installé
    if (checkIfInstalled()) return false;
    
    // Ne pas montrer si l'utilisateur a déjà refusé récemment
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false; // Attendre 7 jours avant de re-proposer
    }
    
    // Vérifier le nombre de visites
    const visits = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1;
    localStorage.setItem('pwa-visit-count', visits.toString());
    
    // Montrer après 3 visites ou 5 minutes sur le site
    const sessionStart = parseInt(sessionStorage.getItem('session-start') || Date.now().toString());
    const sessionDuration = Date.now() - sessionStart;
    
    return visits >= 3 || sessionDuration > 5 * 60 * 1000;
  };

  // Installer l'application
  const installApp = async (): Promise<boolean> => {
    const platform = state.platform.platform;
    
    // Pour iOS, on ne peut que montrer les instructions
    if (platform === 'ios') {
      return false; // iOS nécessite une installation manuelle
    }
    
    // Pour Android/Desktop avec le prompt natif
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA installée avec succès');
          return true;
        } else {
          console.log('Installation PWA annulée');
          localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
          return false;
        }
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
        return false;
      } finally {
        deferredPrompt = null;
        setState(prev => ({ ...prev, isInstallable: false, showInstallPrompt: false }));
      }
    }
    
    return false;
  };

  // Fermer le prompt d'installation
  const dismissInstallPrompt = () => {
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    setState(prev => ({ ...prev, showInstallPrompt: false }));
  };

  // Reporter l'installation à plus tard
  const postponeInstall = () => {
    const visits = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    localStorage.setItem('pwa-postpone-until-visit', (visits + 3).toString());
    setState(prev => ({ ...prev, showInstallPrompt: false }));
  };

  // Mettre à jour l'application
  const updateApp = async () => {
    setState(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Forcer la mise à jour
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Recharger la page après mise à jour
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  };

  // Vérifier si on peut installer sur cette plateforme
  const canInstall = (): boolean => {
    const platform = state.platform;
    
    // iOS peut toujours "installer" via "Ajouter à l'écran d'accueil"
    if (platform.platform === 'ios' && platform.browser === 'safari') {
      return !state.isInstalled;
    }
    
    // Autres plateformes nécessitent le support PWA et l'événement beforeinstallprompt
    return platform.supportsPWA && state.isInstallable && !state.isInstalled;
  };

  // Obtenir le statut d'installation détaillé
  const getInstallStatus = () => {
    if (state.isInstalled) {
      return {
        status: 'installed' as const,
        message: 'Application installée',
        canInstall: false
      };
    }
    
    if (!state.platform.supportsPWA) {
      return {
        status: 'unsupported' as const,
        message: 'Installation non supportée sur cette plateforme',
        canInstall: false
      };
    }
    
    if (state.platform.platform === 'ios') {
      return {
        status: 'manual' as const,
        message: 'Installation manuelle disponible',
        canInstall: true
      };
    }
    
    if (state.isInstallable) {
      return {
        status: 'ready' as const,
        message: 'Prêt à installer',
        canInstall: true
      };
    }
    
    return {
      status: 'waiting' as const,
      message: 'En attente de disponibilité',
      canInstall: false
    };
  };

  // Obtenir les statistiques d'utilisation
  const getUsageStats = () => {
    const installDate = localStorage.getItem('pwa-install-date');
    const visits = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    const lastVisit = localStorage.getItem('pwa-last-visit');
    
    return {
      installed: state.isInstalled,
      installDate: installDate ? new Date(installDate) : null,
      visits,
      lastVisit: lastVisit ? new Date(lastVisit) : null,
      isFrequentUser: visits > 10,
      daysSinceInstall: installDate 
        ? Math.floor((Date.now() - new Date(installDate).getTime()) / (1000 * 60 * 60 * 24))
        : null
    };
  };

  // Sauvegarder la visite actuelle
  useEffect(() => {
    localStorage.setItem('pwa-last-visit', new Date().toISOString());
    
    if (!sessionStorage.getItem('session-start')) {
      sessionStorage.setItem('session-start', Date.now().toString());
    }
  }, []);

  return {
    // État
    ...state,
    canInstall: canInstall(),
    installStatus: getInstallStatus(),
    usageStats: getUsageStats(),
    
    // Actions
    installApp,
    dismissInstallPrompt,
    postponeInstall,
    updateApp,
    checkIfInstalled,
    
    // Utilitaires
    getInstallInstructions: () => platformDetector.getInstallInstructions(),
    getBrowserRecommendation: () => platformDetector.getBrowserRecommendation()
  };
};

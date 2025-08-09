/**
 * Utilitaires pour améliorer l'expérience PWA
 */

// Types pour les événements PWA
export interface PWAEvent {
  type: 'install' | 'update' | 'offline' | 'online' | 'beforeinstallprompt';
  data?: any;
}

// Gestionnaire d'événements PWA
class PWAEventManager {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const pwaEvents = new PWAEventManager();

// Fonction pour optimiser les performances de l'app
export const optimizePerformance = () => {
  // Précharger les ressources critiques
  const criticalResources = [
    '/logo-dgi.png',
    '/favicon.ico'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });

  // Optimiser les images lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }
};

// Fonction pour gérer la navigation hors-ligne
export const setupOfflineNavigation = () => {
  // Écouter les changements de connectivité
  window.addEventListener('online', () => {
    pwaEvents.emit('online');
    console.log('📶 Connexion rétablie');
  });

  window.addEventListener('offline', () => {
    pwaEvents.emit('offline');
    console.log('📵 Mode hors-ligne activé');
  });
};

// Fonction pour améliorer l'UX mobile
export const enhanceMobileUX = () => {
  // Désactiver le zoom sur les inputs pour iOS
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        }
      }
    });

    input.addEventListener('blur', () => {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
          );
        }
      }
    });
  });

  // Gérer le viewport pour les écrans avec notch
  if (CSS.supports('padding: env(safe-area-inset-top)')) {
    document.documentElement.style.setProperty(
      '--safe-area-inset-top', 
      'env(safe-area-inset-top)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-bottom', 
      'env(safe-area-inset-bottom)'
    );
  }
};

// Fonction pour setup les raccourcis clavier
export const setupKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Raccourci pour installer l'app (Ctrl/Cmd + I)
    if ((e.ctrlKey || e.metaKey) && e.key === 'i' && e.shiftKey) {
      e.preventDefault();
      pwaEvents.emit('shortcut-install');
    }

    // Raccourci pour actualiser (Ctrl/Cmd + R)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      // Laisser le comportement par défaut, mais émettre un événement
      pwaEvents.emit('shortcut-refresh');
    }
  });
};

// Fonction pour tracker les métriques PWA
export const trackPWAMetrics = () => {
  // Web Vitals basiques
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log(`📊 ${entry.name}: ${Math.round(entry.duration)}ms`);
    });
  });

  observer.observe({ entryTypes: ['navigation', 'paint'] });

  // Tracker le temps de première interaction
  let firstInteraction = false;
  const trackFirstInteraction = () => {
    if (!firstInteraction) {
      firstInteraction = true;
      const interactionTime = performance.now();
      console.log(`👆 Première interaction: ${Math.round(interactionTime)}ms`);
      
      // Sauvegarder pour analytics
      localStorage.setItem('pwa-first-interaction', interactionTime.toString());
    }
  };

  ['click', 'keydown', 'touchstart'].forEach(event => {
    document.addEventListener(event, trackFirstInteraction, { once: true });
  });
};

// Fonction pour gérer les mises à jour automatiques
export const setupAutoUpdate = () => {
  // Vérifier les mises à jour toutes les 30 minutes
  setInterval(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.update();
      } catch (error) {
        console.error('Erreur lors de la vérification de mise à jour:', error);
      }
    }
  }, 30 * 60 * 1000); // 30 minutes
};

// Fonction pour améliorer l'accessibilité
export const enhanceAccessibility = () => {
  // Ajouter des labels ARIA manquants
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  buttons.forEach(button => {
    const text = button.textContent?.trim();
    if (text && text.length < 50) {
      button.setAttribute('aria-label', text);
    }
  });

  // Améliorer la navigation au clavier
  const focusableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach(element => {
    element.addEventListener('focus', () => {
      element.classList.add('keyboard-focused');
    });

    element.addEventListener('blur', () => {
      element.classList.remove('keyboard-focused');
    });
  });
};

// Fonction pour setup toutes les améliorations PWA
export const initializePWAEnhancements = () => {
  console.log('🚀 Initialisation des améliorations PWA');
  
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupEnhancements();
    });
  } else {
    setupEnhancements();
  }
};

function setupEnhancements() {
  optimizePerformance();
  setupOfflineNavigation();
  enhanceMobileUX();
  setupKeyboardShortcuts();
  trackPWAMetrics();
  setupAutoUpdate();
  enhanceAccessibility();
  
  console.log('✅ Améliorations PWA initialisées');
}

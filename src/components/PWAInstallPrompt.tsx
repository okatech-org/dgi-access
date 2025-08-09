import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone, Monitor, Share2 } from 'lucide-react';
import { 
  getDeviceInfo, 
  getInstallInstructions, 
  Platform,
  Browser 
} from '../utils/platformDetection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [installInstructions, setInstallInstructions] = useState(getInstallInstructions());
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');

  // Vérifier si l'installation a déjà été proposée
  const hasPromptBeenShown = () => {
    const lastPrompt = localStorage.getItem('pwa-install-prompt-shown');
    if (!lastPrompt) return false;
    
    const daysSinceLastPrompt = (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24);
    return daysSinceLastPrompt < 7; // Ne pas montrer plus d'une fois par semaine
  };

  // Vérifier si l'utilisateur a refusé définitivement
  const hasUserDeclined = () => {
    return localStorage.getItem('pwa-install-declined') === 'true';
  };

  // Gérer l'événement beforeinstallprompt (Chrome/Edge/Samsung)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Afficher le prompt après un délai et quelques interactions
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0');
      localStorage.setItem('visit-count', (visitCount + 1).toString());
      
      if (visitCount >= 2 && !hasPromptBeenShown() && !hasUserDeclined()) {
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('pwa-install-prompt-shown', Date.now().toString());
        }, 5000); // Attendre 5 secondes après le chargement
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Pour iOS, vérifier si on peut proposer l'installation
    const info = getDeviceInfo();
    if (info.platform === 'ios' && info.browser === 'safari' && !info.isStandalone) {
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0');
      localStorage.setItem('visit-count', (visitCount + 1).toString());
      
      if (visitCount >= 2 && !hasPromptBeenShown() && !hasUserDeclined()) {
        setTimeout(() => {
          setShowInstructions(true);
          localStorage.setItem('pwa-install-prompt-shown', Date.now().toString());
        }, 5000);
      }
    }

    // Détecter si l'app a été installée
    window.addEventListener('appinstalled', () => {
      setInstallStatus('installed');
      setShowPrompt(false);
      setShowInstructions(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  // Gérer l'installation pour Chrome/Edge
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }

    setInstallStatus('installing');
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installée avec succès');
        setInstallStatus('installed');
        localStorage.setItem('pwa-installed', 'true');
      } else {
        console.log('Installation PWA refusée');
        setInstallStatus('idle');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      setInstallStatus('idle');
      setShowInstructions(true);
    }
  };

  // Fermer le prompt
  const handleClose = () => {
    setShowPrompt(false);
    setShowInstructions(false);
  };

  // Ne plus afficher le prompt
  const handleNeverShow = () => {
    localStorage.setItem('pwa-install-declined', 'true');
    handleClose();
  };

  // Obtenir l'icône selon la plateforme
  const getPlatformIcon = () => {
    if (deviceInfo.isMobile || deviceInfo.isTablet) {
      return <Smartphone className="w-12 h-12 text-blue-600" />;
    }
    return <Monitor className="w-12 h-12 text-blue-600" />;
  };

  // Obtenir le message personnalisé
  const getCustomMessage = () => {
    const { platform, browser } = deviceInfo;
    
    if (platform === 'ios') {
      return {
        title: 'Installer DGI Access',
        subtitle: 'Accédez rapidement à l\'application depuis votre écran d\'accueil',
        action: 'Voir les instructions'
      };
    }
    
    if (platform === 'android') {
      return {
        title: 'Installer DGI Access',
        subtitle: 'Profitez d\'une expérience native sur votre appareil Android',
        action: 'Installer maintenant'
      };
    }
    
    return {
      title: 'Installer DGI Access',
      subtitle: 'Utilisez l\'application comme une app native sur votre ordinateur',
      action: 'Installer'
    };
  };

  const message = getCustomMessage();

  // Prompt principal pour installation directe
  if (showPrompt && !showInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {getPlatformIcon()}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{message.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{message.subtitle}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Avantages */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Avantages de l'installation :</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Accès rapide depuis l'écran d'accueil
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Fonctionnement hors-ligne
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Notifications en temps réel
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Expérience plein écran
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleInstallClick}
                disabled={installStatus === 'installing'}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>
                  {installStatus === 'installing' ? 'Installation...' : message.action}
                </span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleNeverShow}
                  className="flex-1 py-2 px-4 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ne plus afficher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instructions manuelles pour iOS ou navigateurs non supportés
  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                {deviceInfo.platform === 'ios' ? (
                  <Share2 className="w-10 h-10 text-blue-600" />
                ) : (
                  <Download className="w-10 h-10 text-blue-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">{installInstructions.title}</h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Instructions étape par étape */}
            <div className="space-y-4 mb-6">
              {installInstructions.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm pt-1">{step}</p>
                </div>
              ))}
            </div>

            {/* Image d'aide si iOS */}
            {deviceInfo.platform === 'ios' && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-600 text-center">
                  Recherchez cette icône dans Safari :
                </p>
                <div className="flex justify-center mt-2">
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                J'ai compris
              </button>
              <button
                onClick={handleNeverShow}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ne plus afficher
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Message de succès après installation
  if (installStatus === 'installed') {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Application installée avec succès !</span>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;

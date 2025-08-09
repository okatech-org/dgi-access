/**
 * Composant de notification d'installation PWA
 * Adapté pour iOS, Android et Desktop
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const {
    showInstallPrompt,
    canInstall,
    platform,
    installApp,
    dismissInstallPrompt,
    postponeInstall,
    getInstallInstructions,
    getBrowserRecommendation
  } = usePWA();

  const [isAnimating, setIsAnimating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installStep, setInstallStep] = useState<'prompt' | 'instructions' | 'installing' | 'success'>('prompt');

  useEffect(() => {
    if (showInstallPrompt) {
      setIsAnimating(true);
      setInstallStep('prompt');
    }
  }, [showInstallPrompt]);

  // Ne rien afficher si le prompt ne doit pas être montré
  if (!showInstallPrompt || !canInstall) {
    return null;
  }

  const instructions = getInstallInstructions();
  const browserRecommendation = getBrowserRecommendation();

  // Gérer l'installation
  const handleInstall = async () => {
    // Pour iOS, montrer les instructions
    if (platform.platform === 'ios') {
      setShowInstructions(true);
      setInstallStep('instructions');
      return;
    }

    // Pour Android/Desktop, utiliser l'API native
    setInstallStep('installing');
    const success = await installApp();
    
    if (success) {
      setInstallStep('success');
      setTimeout(() => {
        dismissInstallPrompt();
      }, 3000);
    } else {
      setInstallStep('prompt');
    }
  };

  // Rendu pour iOS - Instructions manuelles
  if (platform.platform === 'ios' && showInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={dismissInstallPrompt}
        />
        
        <div className={`
          relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}>
          {/* Header iOS */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <Share className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Installer DGI Access</h3>
                  <p className="text-sm text-white/80">Sur votre {platform.platform === 'ios' ? 'iPhone/iPad' : 'appareil'}</p>
                </div>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instructions iOS */}
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm pt-1">{step}</p>
                </div>
              ))}
            </div>

            {/* Image d'aide pour iOS */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Astuce</span>
              </div>
              <p className="text-xs text-gray-500">
                L'icône de partage ressemble à une boîte avec une flèche vers le haut et se trouve généralement en bas de Safari.
              </p>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendu pour Android/Desktop - Installation native
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={dismissInstallPrompt}
      />
      
      <div className={`
        relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md
        transform transition-all duration-500 ease-out
        ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'}
      `}>
        {/* État: Installation en cours */}
        {installStep === 'installing' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center animate-pulse">
              <Download className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Installation en cours...</h3>
            <p className="text-sm text-gray-600">Veuillez patienter quelques secondes</p>
          </div>
        )}

        {/* État: Succès */}
        {installStep === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Installation réussie !</h3>
            <p className="text-sm text-gray-600">DGI Access a été ajoutée à votre écran d'accueil</p>
          </div>
        )}

        {/* État: Prompt initial */}
        {installStep === 'prompt' && (
          <>
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-t-3xl sm:rounded-t-2xl relative overflow-hidden">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-full animate-shimmer" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <img 
                        src="/logo-dgi.png" 
                        alt="DGI Logo" 
                        className="w-10 h-10"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">DGI Access</h3>
                      <p className="text-sm text-white/90">Application officielle</p>
                    </div>
                  </div>
                  <button
                    onClick={dismissInstallPrompt}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Message principal */}
                <div className="space-y-2">
                  <p className="text-white/90 text-sm">
                    Installez l'application pour un accès rapide et une meilleure expérience
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6 space-y-4">
              {/* Recommandation de navigateur si nécessaire */}
              {browserRecommendation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{browserRecommendation}</p>
                  </div>
                </div>
              )}

              {/* Avantages */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Accès depuis l'écran d'accueil</p>
                    <p className="text-xs text-gray-600">Lancez l'application comme une app native</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Fonctionnement hors-ligne</p>
                    <p className="text-xs text-gray-600">Consultez vos données sans connexion</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Expérience plein écran</p>
                    <p className="text-xs text-gray-600">Interface optimisée sans barre de navigation</p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleInstall}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    <span>Installer maintenant</span>
                  </div>
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={postponeInstall}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Non merci
                  </button>
                </div>
              </div>

              {/* Note de confidentialité */}
              <p className="text-xs text-center text-gray-500 pt-2">
                Installation sécurisée • Aucune donnée partagée
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Ajout des styles d'animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
`;
document.head.appendChild(style);

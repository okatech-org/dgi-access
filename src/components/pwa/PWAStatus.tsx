/**
 * Composant de débogage et statut PWA
 * Utile pour le développement et les tests
 */

import React, { useState } from 'react';
import { Info, Smartphone, Wifi, Download, Settings, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface PWAStatusProps {
  showDebug?: boolean;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({ showDebug = false }) => {
  const {
    platform,
    isInstalled,
    canInstall,
    isOffline,
    installStatus,
    usageStats,
    installApp,
    updateApp,
    updateAvailable,
    getInstallInstructions,
    getBrowserRecommendation
  } = usePWA();

  const [showDetails, setShowDetails] = useState(false);

  if (!showDebug) {
    return null;
  }

  const instructions = getInstallInstructions();
  const browserRec = getBrowserRecommendation();

  return (
    <>
      {/* Bouton flottant pour ouvrir le debug */}
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 z-30 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Informations PWA"
      >
        <Info className="w-5 h-5" />
      </button>

      {/* Modal de détails */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Statut PWA</h3>
                    <p className="text-sm text-white/80">Informations de développement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* État général */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="font-semibold">Installation</span>
                  </div>
                  <p className="text-sm text-gray-600">{installStatus.message}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className={`w-4 h-4 ${isOffline ? 'text-red-500' : 'text-green-500'}`} />
                    <span className="font-semibold">Connexion</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isOffline ? 'Hors ligne' : 'En ligne'}
                  </p>
                </div>
              </div>

              {/* Informations plateforme */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Plateforme détectée
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">OS:</span>
                    <span className="ml-2 font-medium capitalize">{platform.platform}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Navigateur:</span>
                    <span className="ml-2 font-medium capitalize">{platform.browser}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">
                      {platform.isMobile ? 'Mobile' : platform.isTablet ? 'Tablette' : 'Desktop'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Support PWA:</span>
                    <span className={`ml-2 font-medium ${platform.supportsPWA ? 'text-green-600' : 'text-red-600'}`}>
                      {platform.supportsPWA ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Standalone:</span>
                    <span className={`ml-2 font-medium ${platform.isPWA ? 'text-green-600' : 'text-orange-600'}`}>
                      {platform.isPWA ? 'Mode app' : 'Mode navigateur'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques d'utilisation */}
              {usageStats.visits > 0 && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-3">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Visites:</span>
                      <span className="ml-2 font-medium">{usageStats.visits}</span>
                    </div>
                    {usageStats.installDate && (
                      <div>
                        <span className="text-gray-500">Installé depuis:</span>
                        <span className="ml-2 font-medium">{usageStats.daysSinceInstall} jours</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommandation navigateur */}
              {browserRec && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Recommandation</h4>
                  <p className="text-sm text-amber-700">{browserRec}</p>
                </div>
              )}

              {/* Instructions d'installation */}
              {canInstall && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-3">{instructions.title}</h4>
                  <ol className="text-sm space-y-2">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {canInstall && (
                  <button
                    onClick={installApp}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Installer
                  </button>
                )}
                
                {updateAvailable && (
                  <button
                    onClick={updateApp}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Mettre à jour
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Recharger
                </button>
              </div>

              {/* User Agent pour débogage */}
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  User Agent (technique)
                </summary>
                <p className="mt-2 p-3 bg-gray-100 rounded-lg text-gray-600 break-all">
                  {navigator.userAgent}
                </p>
              </details>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

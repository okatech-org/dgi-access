/**
 * Composant de notification de mise à jour PWA
 */

import React, { useState } from 'react';
import { RefreshCw, X, AlertCircle } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const UpdatePrompt: React.FC = () => {
  const { updateAvailable, isUpdating, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Mise à jour disponible</h4>
                <p className="text-xs text-white/80">Nouvelles fonctionnalités disponibles</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Une nouvelle version de DGI Access est disponible. 
              Mettez à jour pour bénéficier des dernières améliorations.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={updateApp}
              disabled={isUpdating}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mise à jour...</span>
                </div>
              ) : (
                'Mettre à jour maintenant'
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { RefreshCw, X } from 'lucide-react';

interface ServiceWorkerUpdatePromptProps {
  show: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

const ServiceWorkerUpdatePrompt: React.FC<ServiceWorkerUpdatePromptProps> = ({
  show,
  onUpdate,
  onDismiss
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slideUp">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1"></div>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin-slow" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Nouvelle version disponible
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Une mise à jour de DGI Access est disponible. Actualisez pour bénéficier des dernières fonctionnalités et améliorations.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={onUpdate}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Actualiser
                </button>
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdatePrompt;

import React, { useState, useCallback } from 'react';
import { Camera, User, Upload, Check, AlertCircle } from 'lucide-react';
import { VisitorRegistrationData, RegistrationMethod, IdType, AIExtractionResult } from '../../types/visitor-process';

interface StepIdentityProps {
  data: VisitorRegistrationData;
  onUpdate: (updates: Partial<VisitorRegistrationData>) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ data, onUpdate }) => {
  const [scanMode, setScanMode] = useState<RegistrationMethod>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIExtractionResult | null>(null);
  const [scanError, setScanError] = useState<string>('');

  const handleAIScan = async (file: File) => {
    setIsScanning(true);
    setScanError('');
    
    try {
      // Simulation de l'extraction IA - à remplacer par un vrai service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultat simulé
      const result: AIExtractionResult = {
        firstName: 'Jean',
        lastName: 'NGUEMA',
        documentType: 'CNI',
        documentNumber: '123456789',
        confidence: 0.95
      };
      
      setScanResult(result);
      
      // Mettre à jour les données avec les résultats du scan
      onUpdate({
        ...data,
        identity: {
          ...data.identity,
          method: 'ai-scan',
          firstName: result.firstName || '',
          lastName: result.lastName || '',
          idType: result.documentType || 'CNI',
          idNumber: result.documentNumber || '',
          idScanUrl: URL.createObjectURL(file),
          extractedData: result
        }
      });
    } catch (error) {
      setScanError('Erreur lors de l\'analyse du document. Veuillez réessayer.');
      console.error('Erreur scan IA:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const updateIdentity = useCallback((field: string, value: string) => {
    onUpdate({
      ...data,
      identity: {
        ...data.identity,
        [field]: value
      }
    });
  }, [data, onUpdate]);

  const handleMethodChange = (method: RegistrationMethod) => {
    setScanMode(method);
    setScanResult(null);
    setScanError('');
    
    onUpdate({
      ...data,
      identity: {
        ...data.identity,
        method
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 1: Identification du visiteur
        </h2>
        <p className="text-gray-600">
          Saisissez les informations du visiteur manuellement ou utilisez le scan automatique
        </p>
      </div>
      
      {/* Choix de la méthode */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleMethodChange('manual')}
          className={`p-4 border-2 rounded-lg transition-all ${
            scanMode === 'manual' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <User className="w-8 h-8 mx-auto mb-2" />
          <div className="font-medium">Saisie manuelle</div>
          <div className="text-sm text-gray-500 mt-1">
            Remplir les champs manuellement
          </div>
        </button>
        
        <button
          onClick={() => handleMethodChange('ai-scan')}
          className={`p-4 border-2 rounded-lg transition-all ${
            scanMode === 'ai-scan' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <div className="font-medium">Scan automatique</div>
          <div className="text-sm text-gray-500 mt-1">
            Photo de la pièce d'identité
          </div>
        </button>
      </div>

      {scanMode === 'ai-scan' ? (
        <div className="space-y-4">
          {/* Zone de capture/upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            {isScanning ? (
              <div className="animate-pulse">
                <Camera className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <p className="text-lg font-medium text-gray-700">Analyse en cours...</p>
                <p className="text-sm text-gray-500">Extraction des données de la pièce d'identité</p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files && handleAIScan(e.target.files[0])}
                  className="hidden"
                  id="id-scan"
                />
                <label htmlFor="id-scan" className="cursor-pointer">
                  <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Cliquez pour capturer ou télécharger
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    CNI, Passeport ou Permis de conduire
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats acceptés: JPG, PNG, WebP
                  </p>
                </label>
              </>
            )}
          </div>

          {/* Erreur de scan */}
          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Erreur de scan</h3>
                <p className="text-sm text-red-600 mt-1">{scanError}</p>
              </div>
            </div>
          )}

          {/* Résultats du scan */}
          {scanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">
                  Données extraites (Confiance: {Math.round(scanResult.confidence * 100)}%)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={data.identity?.firstName || ''}
                    onChange={(e) => updateIdentity('firstName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={data.identity?.lastName || ''}
                    onChange={(e) => updateIdentity('lastName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de document *
                  </label>
                  <select
                    value={data.identity?.idType || 'CNI'}
                    onChange={(e) => updateIdentity('idType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CNI">CNI</option>
                    <option value="Passeport">Passeport</option>
                    <option value="Permis">Permis de conduire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° Document *
                  </label>
                  <input
                    type="text"
                    value={data.identity?.idNumber || ''}
                    onChange={(e) => updateIdentity('idNumber', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              placeholder="Jean"
              value={data.identity?.firstName || ''}
              onChange={(e) => updateIdentity('firstName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              placeholder="NGUEMA"
              value={data.identity?.lastName || ''}
              onChange={(e) => updateIdentity('lastName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              placeholder="077 00 00 00"
              value={data.identity?.phone || ''}
              onChange={(e) => updateIdentity('phone', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="jean@example.com"
              value={data.identity?.email || ''}
              onChange={(e) => updateIdentity('email', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Société
            </label>
            <input
              type="text"
              placeholder="Entreprise XYZ"
              value={data.identity?.company || ''}
              onChange={(e) => updateIdentity('company', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de pièce *
            </label>
            <select
              value={data.identity?.idType || 'CNI'}
              onChange={(e) => updateIdentity('idType', e.target.value as IdType)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CNI">CNI</option>
              <option value="Passeport">Passeport</option>
              <option value="Permis">Permis de conduire</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Document *
            </label>
            <input
              type="text"
              placeholder="123456789"
              value={data.identity?.idNumber || ''}
              onChange={(e) => updateIdentity('idNumber', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      )}

      {/* Informations obligatoires */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Informations obligatoires</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Prénom et nom complets</li>
          <li>• Numéro de téléphone valide</li>
          <li>• Type et numéro de pièce d'identité</li>
        </ul>
      </div>
    </div>
  );
};

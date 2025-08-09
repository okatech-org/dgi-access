import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Upload, Check, AlertCircle, Scan, RefreshCw, Building } from 'lucide-react';
import { VisitorRegistrationData, RegistrationMethod, IdType } from '../../../types/visitor-process';
import { db } from '../../../services/database';

interface StepIdentityProps {
  data: VisitorRegistrationData;
  onUpdate: (data: Partial<VisitorRegistrationData>) => void;
}

interface AIExtractionResult {
  firstName: string;
  lastName: string;
  idNumber: string;
  idType: IdType;
  nationality?: string;
  confidence: number;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ data, onUpdate }) => {
  const [scanMode, setScanMode] = useState<RegistrationMethod>(data.identity.method || 'manual');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIExtractionResult | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // États pour l'auto-complétion des sociétés
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showOtherCompany, setShowOtherCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Simulation de l'extraction IA
  const handleAIScan = async (file: File) => {
    setIsScanning(true);
    setScanPreview(URL.createObjectURL(file));
    
    try {
      // Simulation d'un délai d'analyse IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Résultat simulé (en production, appel à l'API d'extraction)
      const simulatedResult: AIExtractionResult = {
        firstName: 'Jean-Pierre',
        lastName: 'NGUEMA',
        idNumber: '1234567890123',
        idType: 'CNI',
        nationality: 'Gabonaise',
        confidence: 0.95
      };
      
      setScanResult(simulatedResult);
      
      // Mettre à jour les données
      onUpdate({
        identity: {
          ...data.identity,
          method: 'ai-scan',
          firstName: simulatedResult.firstName,
          lastName: simulatedResult.lastName,
          idType: simulatedResult.idType,
          idNumber: simulatedResult.idNumber,
          nationality: simulatedResult.nationality,
          idScanUrl: URL.createObjectURL(file)
        }
      });
      
    } catch (error) {
      console.error('Erreur scan IA:', error);
      alert('Erreur lors de l\'analyse du document. Veuillez réessayer ou passer en mode manuel.');
    } finally {
      setIsScanning(false);
    }
  };

  // Capture depuis la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'environment' // Caméra arrière
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('Impossible d\'accéder à la caméra. Utilisez l\'upload de fichier.');
    }
  };

  // Capturer une photo depuis la caméra
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            handleAIScan(file);
          }
        }, 'image/jpeg', 0.9);
      }
      
      // Arrêter la caméra
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Mise à jour des champs d'identité
  const updateIdentity = (field: string, value: string) => {
    onUpdate({
      identity: {
        ...data.identity,
        [field]: value
      }
    });
  };

  // Auto-complétion pour les sociétés
  useEffect(() => {
    const companyValue = data.identity.company || '';
    if (companyValue.length > 2) {
      const companyResults = db.searchCompanies(companyValue);
      setCompanySuggestions([...companyResults.slice(0, 5), 'Autre']);
    } else {
      setCompanySuggestions([]);
    }
  }, [data.identity.company]);

  const handleCompanySelect = (company: string) => {
    if (company === 'Autre') {
      setShowOtherCompany(true);
      updateIdentity('company', '');
    } else {
      updateIdentity('company', company);
      setShowOtherCompany(false);
    }
    setCompanySuggestions([]);
  };

  const handleSaveNewCompany = async () => {
    if (newCompanyName.trim()) {
      await db.saveCompany(newCompanyName.trim());
      updateIdentity('company', newCompanyName.trim());
      setNewCompanyName('');
      setShowOtherCompany(false);
    }
  };

  const handleCancelNewCompany = () => {
    setNewCompanyName('');
    setShowOtherCompany(false);
    updateIdentity('company', '');
  };

  // Recommencer le scan
  const resetScan = () => {
    setScanResult(null);
    setScanPreview(null);
    setIsScanning(false);
    stopCamera();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 1: Identification du visiteur
        </h2>
        <p className="text-gray-600">
          Saisissez les informations d'identité du visiteur manuellement ou utilisez l'extraction automatique par IA.
        </p>
      </div>
      
      {/* Choix de la méthode */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Méthode d'enregistrement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setScanMode('manual');
              onUpdate({ identity: { ...data.identity, method: 'manual' }});
              resetScan();
            }}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              scanMode === 'manual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="font-medium">Saisie manuelle</div>
            <div className="text-sm text-gray-500">Remplir les champs à la main</div>
          </button>
          
          <button
            onClick={() => {
              setScanMode('ai-scan');
              onUpdate({ identity: { ...data.identity, method: 'ai-scan' }});
            }}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              scanMode === 'ai-scan' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Camera className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="font-medium">Scan IA</div>
            <div className="text-sm text-gray-500">Extraction automatique</div>
          </button>
        </div>
      </div>

      {scanMode === 'ai-scan' ? (
        <div className="space-y-4">
          {/* Interface de scan IA */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {isScanning ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Analyse en cours...</p>
                <p className="text-sm text-gray-500">Extraction des données de la pièce d'identité</p>
              </div>
            ) : scanResult ? (
              <div className="text-center">
                <Check className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <p className="text-lg font-medium text-green-800">Document analysé avec succès !</p>
                <p className="text-sm text-gray-600">Confiance: {Math.round(scanResult.confidence * 100)}%</p>
                
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={resetScan}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Recommencer
                  </button>
                </div>
              </div>
            ) : cameraStream ? (
              <div className="text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="max-w-full rounded-lg mb-4"
                />
                <div className="flex justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Capturer
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Scan className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-4">Scanner une pièce d'identité</p>
                <p className="text-sm text-gray-500 mb-6">
                  CNI, Passeport ou Permis de conduire
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Prendre une photo
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Télécharger fichier
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleAIScan(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Aperçu du scan */}
          {scanPreview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Document scanné :</h4>
              <img 
                src={scanPreview} 
                alt="Document scanné" 
                className="max-w-sm rounded border"
              />
            </div>
          )}

          {/* Résultats de l'extraction */}
          {scanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Données extraites automatiquement</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={data.identity.firstName}
                      onChange={(e) => updateIdentity('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Prénom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={data.identity.lastName}
                      onChange={(e) => updateIdentity('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de pièce *
                    </label>
                    <select
                      value={data.identity.idType}
                      onChange={(e) => updateIdentity('idType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CNI">Carte Nationale d'Identité</option>
                      <option value="Passeport">Passeport</option>
                      <option value="Permis">Permis de conduire</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de document *
                    </label>
                    <input
                      type="text"
                      value={data.identity.idNumber}
                      onChange={(e) => updateIdentity('idNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Numéro de la pièce"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center mb-1">
                    <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Vérification requise</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Veuillez vérifier et corriger les informations extraites si nécessaire.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Formulaire manuel */
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Informations d'identité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={data.identity.firstName}
                onChange={(e) => updateIdentity('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Jean-Pierre"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={data.identity.lastName}
                onChange={(e) => updateIdentity('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="NGUEMA"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={data.identity.phone}
                onChange={(e) => updateIdentity('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+241 XX XX XX XX"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={data.identity.email || ''}
                onChange={(e) => updateIdentity('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="nom@example.com"
              />
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Société/Organisation
              </label>
              <input
                type="text"
                value={data.identity.company || ''}
                onChange={(e) => updateIdentity('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ex: SOGARA, BGFI Bank, Total Gabon..."
              />
              
              {/* Suggestions entreprises */}
              {companySuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-2 border-b bg-blue-50">
                    <p className="text-xs text-blue-700 font-medium">Entreprises gabonaises</p>
                  </div>
                  {companySuggestions.map((company, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCompanySelect(company)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 ${
                        company === 'Autre' ? 'bg-orange-50 text-orange-700 font-medium' : ''
                      }`}
                    >
                      <Building className="w-4 h-4 inline mr-2 text-gray-400" />
                      {company}
                    </button>
                  ))}
                </div>
              )}

              {/* Interface pour ajouter une nouvelle société */}
              {showOtherCompany && (
                <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">
                    Ajouter une nouvelle société
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Nom de la nouvelle société..."
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNewCompany}
                        className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNewCompany}
                        className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pièce d'identité *
              </label>
              <select
                value={data.identity.idType}
                onChange={(e) => updateIdentity('idType', e.target.value as IdType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="CNI">Carte Nationale d'Identité</option>
                <option value="Passeport">Passeport</option>
                <option value="Permis">Permis de conduire</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de document *
              </label>
              <input
                type="text"
                value={data.identity.idNumber}
                onChange={(e) => updateIdentity('idNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationalité
              </label>
              <input
                type="text"
                value={data.identity.nationality || ''}
                onChange={(e) => updateIdentity('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Gabonaise"
              />
            </div>
          </div>
        </div>
      )}

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• L'extraction IA fonctionne mieux avec des photos bien éclairées et nettes</li>
          <li>• Assurez-vous que tous les textes du document sont visibles</li>
          <li>• Les champs marqués d'un * sont obligatoires</li>
          <li>• Vous pouvez corriger les informations extraites automatiquement</li>
        </ul>
      </div>
    </div>
  );
};

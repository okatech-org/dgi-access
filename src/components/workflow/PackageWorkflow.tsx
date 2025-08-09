import React, { useState, useEffect, useRef } from 'react';
import { Camera, Package, User, Building, Upload, Check, X, AlertTriangle, Scan, Mail, Phone } from 'lucide-react';
import { PackageRegistrationData, PackageType } from '../../types/visitor-process';
import { Employee, Service } from '../../types/personnel';
import { useAuth } from '../../contexts/AuthContext';
import { visitorPackageService } from '../../services/visitor-package-service';
import { db } from '../../services/database';

interface PackageWorkflowProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

interface EmployeeServiceSelectorProps {
  onSelect: (type: 'employee' | 'service', id: string, name: string) => void;
  selectedType?: 'employee' | 'service';
  selectedId?: string;
}

const PACKAGE_TYPES = [
  { value: 'document' as PackageType, label: 'Document', icon: '📄', description: 'Lettres, factures, contrats' },
  { value: 'colis' as PackageType, label: 'Colis', icon: '📦', description: 'Boîtes, emballages' },
  { value: 'courrier' as PackageType, label: 'Courrier', icon: '✉️', description: 'Lettres simples' },
  { value: 'recommande' as PackageType, label: 'Recommandé', icon: '🔒', description: 'Courrier sécurisé' }
];

const CARRIERS = [
  'DHL', 'FedEx', 'UPS', 'La Poste Gabon', 'Chronopost', 'TNT', 'Autre'
];

const EmployeeServiceSelector: React.FC<EmployeeServiceSelectorProps> = ({ onSelect, selectedType, selectedId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'employee' | 'service'>('employee');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await db.initializeDGIEmployees();
    await db.initializeDefaultData();
    
    setEmployees(db.getEmployees());
    setServices(db.getServices());
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.service.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('employee')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'employee' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👤 Employé spécifique
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'service' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🏢 Service DGI
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={`Rechercher ${activeTab === 'employee' ? 'un employé' : 'un service'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="max-h-48 overflow-y-auto border rounded-lg">
        {activeTab === 'employee' ? (
          <div className="divide-y">
            {filteredEmployees.map(employee => (
              <button
                key={employee.id}
                onClick={() => onSelect('employee', employee.id, `${employee.firstName} ${employee.lastName}`)}
                className={`w-full p-3 text-left hover:bg-gray-50 ${
                  selectedType === 'employee' && selectedId === employee.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                <div className="text-sm text-gray-600">{employee.service.name} - {employee.position}</div>
                <div className="text-xs text-gray-500">Bureau {employee.office}, {employee.floor}</div>
              </button>
            ))}
            {filteredEmployees.length === 0 && searchQuery && (
              <div className="p-3 text-center text-gray-500">Aucun employé trouvé</div>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredServices.map(service => (
              <button
                key={service.id}
                onClick={() => onSelect('service', service.id, service.name)}
                className={`w-full p-3 text-left hover:bg-gray-50 ${
                  selectedType === 'service' && selectedId === service.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="font-medium">{service.name}</div>
                <div className="text-sm text-gray-600">({service.code}) - {service.location}</div>
              </button>
            ))}
            {filteredServices.length === 0 && searchQuery && (
              <div className="p-3 text-center text-gray-500">Aucun service trouvé</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PackageWorkflow: React.FC<PackageWorkflowProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [packagePhoto, setPackagePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [packageData, setPackageData] = useState<PackageRegistrationData>({
    package: {
      trackingNumber: '',
      carrier: '',
      type: 'colis',
      fragile: false,
      urgent: false,
      confidential: false
    },
    recipient: {
      type: 'employee',
      notificationSent: false,
      notificationMethod: 'email'
    },
    sender: {
      name: '',
      company: '',
      phone: ''
    },
    status: {
      received: new Date(),
      receivedBy: user?.id || 'unknown',
      attempts: 0,
      location: 'Réception principale'
    },
    metadata: {
      id: '',
      registrationNumber: '',
      storageLocation: '',
      securityChecked: false,
      requiresId: false
    }
  });

  // Capture photo du colis
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPackagePhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPackagePhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePackageData = (updates: Partial<PackageRegistrationData>) => {
    setPackageData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleRecipientSelect = (type: 'employee' | 'service', id: string, name: string) => {
    updatePackageData({
      recipient: {
        ...packageData.recipient,
        type,
        [type === 'employee' ? 'employeeId' : 'serviceId']: id,
        [type === 'employee' ? 'employeeName' : 'serviceName']: name
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!packageData.package.trackingNumber.trim()) {
      alert('Le numéro de suivi est requis');
      return;
    }
    if (!packageData.sender.name.trim()) {
      alert('Le nom de l\'expéditeur est requis');
      return;
    }
    if (!packageData.recipient.employeeId && !packageData.recipient.serviceId) {
      alert('Le destinataire doit être sélectionné');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Ajouter la photo si disponible
      if (packagePhoto) {
        packageData.package.photo = packagePhoto;
      }

      const result = await visitorPackageService.registerPackage(packageData);
      
      if (onComplete) {
        onComplete(result);
      }
      
      alert(`✅ Colis enregistré avec succès !\nN° d'enregistrement: ${result.registrationNumber}`);
      
    } catch (error) {
      console.error('Erreur enregistrement colis:', error);
      alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Enregistrement de Colis/Courrier
            </h1>
            <p className="text-gray-600">
              Système de gestion des livraisons - Direction Générale des Impôts
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Photo du colis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Documentation visuelle
          </h2>
          
          <div className="space-y-4">
            {!packagePhoto && !cameraStream ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Prendre une photo du colis</p>
                <p className="text-sm text-gray-600 mb-4">
                  Documenter l'état du colis à la réception
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
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
                <img 
                  src={packagePhoto!} 
                  alt="Photo du colis" 
                  className="max-w-sm rounded-lg mx-auto mb-4"
                />
                <button
                  onClick={() => setPackagePhoto(null)}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Reprendre la photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Informations du colis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Informations du colis
          </h2>
          
          <div className="space-y-4">
            {/* Type de colis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de colis/courrier</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PACKAGE_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => updatePackageData({
                      package: { ...packageData.package, type: type.value }
                    })}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      packageData.package.type === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de suivi *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={packageData.package.trackingNumber}
                    onChange={(e) => updatePackageData({
                      package: { ...packageData.package, trackingNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro de suivi ou référence"
                    required
                  />
                  <Scan className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transporteur
                </label>
                <select
                  value={packageData.package.carrier}
                  onChange={(e) => updatePackageData({
                    package: { ...packageData.package, carrier: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {CARRIERS.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={packageData.package.weight || ''}
                  onChange={(e) => updatePackageData({
                    package: { ...packageData.package, weight: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optionnel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={packageData.package.dimensions || ''}
                  onChange={(e) => updatePackageData({
                    package: { ...packageData.package, dimensions: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="L x l x h (cm)"
                />
              </div>
            </div>

            {/* Options spéciales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options spéciales</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageData.package.fragile}
                    onChange={(e) => updatePackageData({
                      package: { ...packageData.package, fragile: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">⚠️ Fragile</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageData.package.urgent}
                    onChange={(e) => updatePackageData({
                      package: { ...packageData.package, urgent: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">🚨 Urgent</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageData.package.confidential}
                    onChange={(e) => updatePackageData({
                      package: { ...packageData.package, confidential: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">🔒 Confidentiel</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description du contenu
              </label>
              <textarea
                value={packageData.package.description || ''}
                onChange={(e) => updatePackageData({
                  package: { ...packageData.package, description: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Description du contenu (optionnel)"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Destinataire */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Destinataire DGI
          </h2>
          
          <EmployeeServiceSelector
            onSelect={handleRecipientSelect}
            selectedType={packageData.recipient.type}
            selectedId={packageData.recipient.employeeId || packageData.recipient.serviceId}
          />

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions de livraison
              </label>
              <input
                type="text"
                value={packageData.recipient.deliveryInstructions || ''}
                onChange={(e) => updatePackageData({
                  recipient: { ...packageData.recipient, deliveryInstructions: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions spéciales pour la livraison"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageData.recipient.notificationSent}
                    onChange={(e) => updatePackageData({
                      recipient: { ...packageData.recipient, notificationSent: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="font-medium">Notifier le destinataire</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">
                  Envoyer un email/SMS d'arrivée du colis
                </p>
              </div>
              
              {packageData.recipient.notificationSent && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePackageData({
                      recipient: { ...packageData.recipient, notificationMethod: 'email' }
                    })}
                    className={`px-3 py-1 text-xs rounded-full ${
                      packageData.recipient.notificationMethod === 'email'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Mail className="w-3 h-3 inline mr-1" />
                    Email
                  </button>
                  <button
                    onClick={() => updatePackageData({
                      recipient: { ...packageData.recipient, notificationMethod: 'sms' }
                    })}
                    className={`px-3 py-1 text-xs rounded-full ${
                      packageData.recipient.notificationMethod === 'sms'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Phone className="w-3 h-3 inline mr-1" />
                    SMS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Expéditeur */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Expéditeur
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom/Société *
              </label>
              <input
                type="text"
                value={packageData.sender.name}
                onChange={(e) => updatePackageData({
                  sender: { ...packageData.sender, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'expéditeur"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={packageData.sender.phone || ''}
                onChange={(e) => updatePackageData({
                  sender: { ...packageData.sender, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contact de l'expéditeur"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={packageData.sender.address || ''}
                onChange={(e) => updatePackageData({
                  sender: { ...packageData.sender, address: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse de l'expéditeur"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>✅ Le colis sera stocké en sécurité à la réception</p>
              <p>📧 Le destinataire sera notifié automatiquement</p>
              <p>📋 Un récépissé sera généré pour suivi</p>
            </div>
            
            <div className="flex gap-4">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enregistrer et Notifier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { Camera, Package, User, Building, Truck, AlertTriangle, Check, X } from 'lucide-react';
import { PackageRegistrationData, PackageType, RecipientType } from '../../types/visitor-process';
import { Employee, Service } from '../../types/personnel';

interface PackageWorkflowProps {
  onComplete?: (data: PackageRegistrationData) => void;
  onCancel?: () => void;
}

const packageTypes = [
  { value: 'document' as PackageType, label: 'Document', icon: '📄' },
  { value: 'colis' as PackageType, label: 'Colis', icon: '📦' },
  { value: 'courrier' as PackageType, label: 'Courrier', icon: '📮' },
  { value: 'recommande' as PackageType, label: 'Recommandé', icon: '📨' }
];

const carriers = [
  'DHL', 'FedEx', 'UPS', 'La Poste Gabon', 'Chronopost', 'TNT', 'Autre'
];

export const PackageWorkflow: React.FC<PackageWorkflowProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const [packageData, setPackageData] = useState<PackageRegistrationData>({
    package: {
      trackingNumber: '',
      carrier: '',
      type: 'colis',
      fragile: false,
      urgent: false
    },
    recipient: {
      type: 'employee',
      notificationSent: false
    },
    sender: {
      name: ''
    },
    status: {
      received: new Date(),
      receivedBy: 'current-user', // À remplacer par l'utilisateur connecté
      status: 'received'
    }
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    loadEmployeesAndServices();
  }, []);

  const loadEmployeesAndServices = async () => {
    // Simulation des données - à remplacer par de vraies données
    const mockEmployees: Employee[] = [
      {
        id: 'emp1',
        matricule: 'DGI001',
        firstName: 'Jean',
        lastName: 'MARTIN',
        email: 'jean.martin@dgi.gov.ga',
        phone: '077 10 10 10',
        service: {
          id: 'svc1',
          code: 'FISCALITE',
          name: 'Service Fiscalité',
          description: 'Gestion des impôts et taxes',
          responsable: 'emp1',
          location: 'Bâtiment A',
          employees: ['emp1']
        },
        position: 'Inspecteur principal',
        office: 'A-205',
        floor: '2ème étage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // Ajouter d'autres employés...
    ];

    const mockServices: Service[] = [
      {
        id: 'svc1',
        code: 'FISCALITE',
        name: 'Service Fiscalité',
        description: 'Gestion des impôts et taxes',
        responsable: 'emp1',
        location: 'Bâtiment A - 2ème étage',
        employees: ['emp1']
      }
      // Ajouter d'autres services...
    ];

    setEmployees(mockEmployees);
    setServices(mockServices);
  };

  const updatePackageData = useCallback((updates: Partial<PackageRegistrationData>) => {
    setPackageData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const updatePackageInfo = useCallback((field: string, value: any) => {
    updatePackageData({
      package: {
        ...packageData.package,
        [field]: value
      }
    });
  }, [packageData.package, updatePackageData]);

  const updateRecipient = useCallback((updates: any) => {
    updatePackageData({
      recipient: {
        ...packageData.recipient,
        ...updates
      }
    });
  }, [packageData.recipient, updatePackageData]);

  const updateSender = useCallback((field: string, value: string) => {
    updatePackageData({
      sender: {
        ...packageData.sender,
        [field]: value
      }
    });
  }, [packageData.sender, updatePackageData]);

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        updatePackageInfo('photo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecipientTypeChange = (type: RecipientType) => {
    setSelectedEmployee(null);
    setSelectedService(null);
    setSearchQuery('');
    
    updateRecipient({
      type,
      employeeId: undefined,
      employee: undefined,
      serviceId: undefined,
      service: undefined
    });
  };

  const handleEmployeeSelection = (employee: Employee) => {
    setSelectedEmployee(employee);
    updateRecipient({
      type: 'employee',
      employeeId: employee.id,
      employee,
      serviceId: undefined,
      service: undefined
    });
  };

  const handleServiceSelection = (service: Service) => {
    setSelectedService(service);
    updateRecipient({
      type: 'service',
      serviceId: service.id,
      service,
      employeeId: undefined,
      employee: undefined
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Générer un ID unique pour le colis
      const packageId = `PKG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const finalData: PackageRegistrationData = {
        ...packageData,
        id: packageId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Simuler l'enregistrement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onComplete) {
        await onComplete(finalData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du colis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = () => {
    return !!(
      packageData.package.type &&
      packageData.package.carrier &&
      packageData.sender.name &&
      (selectedEmployee || selectedService)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Enregistrement de Colis/Courrier
        </h1>
        <p className="text-gray-600">
          Enregistrer la réception d'un colis ou courrier
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        {/* Section 1: Informations du colis */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Informations du colis
          </h2>
          
          {/* Photo du colis */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo du colis (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Aperçu du colis" 
                    className="max-w-xs max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPhotoPreview('');
                      updatePackageInfo('photo', '');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                    id="package-photo"
                  />
                  <label htmlFor="package-photo" className="cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-lg font-medium text-gray-700">
                      Prendre une photo du colis
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliquez pour capturer ou télécharger une image
                    </p>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type de colis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {packageTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => updatePackageInfo('type', type.value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      packageData.package.type === type.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transporteur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporteur *
              </label>
              <select
                value={packageData.package.carrier}
                onChange={(e) => updatePackageInfo('carrier', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>

            {/* Numéro de suivi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                N° de suivi
              </label>
              <input
                type="text"
                placeholder="Scan ou saisie manuelle"
                value={packageData.package.trackingNumber}
                onChange={(e) => updatePackageInfo('trackingNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Poids */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Optionnel"
                value={packageData.package.weight || ''}
                onChange={(e) => updatePackageInfo('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="flex gap-6 mt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={packageData.package.fragile}
                onChange={(e) => updatePackageInfo('fragile', e.target.checked)}
                className="mr-2"
              />
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Fragile
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={packageData.package.urgent}
                onChange={(e) => updatePackageInfo('urgent', e.target.checked)}
                className="mr-2"
              />
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                Urgent
              </span>
            </label>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du contenu
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Description du contenu (optionnel)"
              value={packageData.package.description || ''}
              onChange={(e) => updatePackageInfo('description', e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Destinataire */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Destinataire
          </h2>
          
          {/* Type de destinataire */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleRecipientTypeChange('employee')}
              className={`p-4 border-2 rounded-lg transition-all ${
                packageData.recipient.type === 'employee'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <User className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">Employé</div>
            </button>
            
            <button
              onClick={() => handleRecipientTypeChange('service')}
              className={`p-4 border-2 rounded-lg transition-all ${
                packageData.recipient.type === 'service'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Building className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">Service</div>
            </button>
          </div>

          {/* Sélection employé */}
          {packageData.recipient.type === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un employé
              </label>
              <input
                type="text"
                placeholder="Nom, prénom ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              />
              
              {searchQuery && (
                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeSelection(emp)}
                      className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedEmployee?.id === emp.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                      <div className="text-sm text-gray-600">
                        {emp.service.name} - {emp.position}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sélection service */}
          {packageData.recipient.type === 'service' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un service
              </label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value);
                  if (service) handleServiceSelection(service);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choisir un service...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notification */}
          <label className="flex items-center mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={packageData.recipient.notificationSent}
              onChange={(e) => updateRecipient({ notificationSent: e.target.checked })}
              className="mr-3"
            />
            <span>Envoyer une notification au destinataire</span>
          </label>
        </div>

        {/* Section 3: Expéditeur */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Expéditeur
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom/Société *
              </label>
              <input
                type="text"
                placeholder="Nom de l'expéditeur"
                value={packageData.sender.name}
                onChange={(e) => updateSender('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="Contact"
                value={packageData.sender.phone || ''}
                onChange={(e) => updateSender('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                placeholder="Adresse de l'expéditeur"
                value={packageData.sender.address || ''}
                onChange={(e) => updateSender('address', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enregistrer et Notifier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

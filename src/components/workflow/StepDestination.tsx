import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Building, Search, MapPin, Phone, Mail, Users } from 'lucide-react';
import { VisitorRegistrationData, DestinationType } from '../../types/visitor-process';
import { Employee, Service } from '../../types/personnel';

interface StepDestinationProps {
  data: VisitorRegistrationData;
  onUpdate: (updates: Partial<VisitorRegistrationData>) => void;
}

export const StepDestination: React.FC<StepDestinationProps> = ({ data, onUpdate }) => {
  const [destinationType, setDestinationType] = useState<DestinationType>('employee');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [specificLocation, setSpecificLocation] = useState('');

  useEffect(() => {
    loadEmployees();
    loadServices();
  }, []);

  const loadEmployees = async () => {
    // Simulation des employés
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
          employees: ['emp1', 'emp2']
        },
        position: 'Inspecteur principal',
        office: 'A-205',
        floor: '2ème étage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp2',
        matricule: 'DGI002',
        firstName: 'Sophie',
        lastName: 'DURAND',
        email: 'sophie.durand@dgi.gov.ga',
        phone: '077 20 20 20',
        service: {
          id: 'svc2',
          code: 'CONTENTIEUX',
          name: 'Service Contentieux',
          description: 'Gestion des litiges fiscaux',
          responsable: 'emp2',
          location: 'Bâtiment B',
          employees: ['emp2', 'emp3']
        },
        position: 'Chef de service',
        office: 'B-105',
        floor: '1er étage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp3',
        matricule: 'DGI003',
        firstName: 'Pierre',
        lastName: 'LEROY',
        email: 'pierre.leroy@dgi.gov.ga',
        phone: '077 30 30 30',
        service: {
          id: 'svc3',
          code: 'RENSEIGNEMENTS',
          name: 'Service Renseignements',
          description: 'Information et assistance aux contribuables',
          responsable: 'emp3',
          location: 'Bâtiment A',
          employees: ['emp3', 'emp4']
        },
        position: 'Conseiller fiscal',
        office: 'A-101',
        floor: 'RDC',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp4',
        matricule: 'DGI004',
        firstName: 'Marie',
        lastName: 'NGOMO',
        email: 'marie.ngomo@dgi.gov.ga',
        phone: '077 40 40 40',
        service: {
          id: 'svc4',
          code: 'RH',
          name: 'Ressources Humaines',
          description: 'Gestion du personnel',
          responsable: 'emp4',
          location: 'Bâtiment C',
          employees: ['emp4', 'emp5']
        },
        position: 'Responsable RH',
        office: 'C-301',
        floor: '3ème étage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setEmployees(mockEmployees);
  };

  const loadServices = async () => {
    // Simulation des services
    const mockServices: Service[] = [
      {
        id: 'svc1',
        code: 'FISCALITE',
        name: 'Service Fiscalité',
        description: 'Gestion des impôts et taxes',
        responsable: 'emp1',
        location: 'Bâtiment A - 2ème étage',
        employees: ['emp1', 'emp2']
      },
      {
        id: 'svc2',
        code: 'CONTENTIEUX',
        name: 'Service Contentieux',
        description: 'Gestion des litiges fiscaux',
        responsable: 'emp2',
        location: 'Bâtiment B - 1er étage',
        employees: ['emp2', 'emp3']
      },
      {
        id: 'svc3',
        code: 'RENSEIGNEMENTS',
        name: 'Service Renseignements',
        description: 'Information et assistance aux contribuables',
        responsable: 'emp3',
        location: 'Bâtiment A - RDC',
        employees: ['emp3', 'emp4']
      },
      {
        id: 'svc4',
        code: 'RH',
        name: 'Ressources Humaines',
        description: 'Gestion du personnel',
        responsable: 'emp4',
        location: 'Bâtiment C - 3ème étage',
        employees: ['emp4', 'emp5']
      },
      {
        id: 'svc5',
        code: 'COMPTABILITE',
        name: 'Service Comptabilité',
        description: 'Gestion comptable et financière',
        responsable: 'emp5',
        location: 'Bâtiment A - 1er étage',
        employees: ['emp5', 'emp6']
      }
    ];
    setServices(mockServices);
  };

  // Recherche d'employés en temps réel
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.matricule.toLowerCase().includes(query) ||
      emp.service.name.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const updateDestination = useCallback((updates: any) => {
    onUpdate({
      ...data,
      destination: {
        ...data.destination,
        ...updates
      }
    });
  }, [data, onUpdate]);

  const handleDestinationTypeChange = (type: DestinationType) => {
    setDestinationType(type);
    setSelectedEmployee(null);
    setSelectedService(null);
    setSearchQuery('');
    setSpecificLocation('');
    
    updateDestination({
      type,
      employeeId: undefined,
      employee: undefined,
      serviceId: undefined,
      service: undefined,
      specificLocation: ''
    });
  };

  const handleEmployeeSelection = (employee: Employee) => {
    setSelectedEmployee(employee);
    updateDestination({
      type: 'employee',
      employeeId: employee.id,
      employee,
      serviceId: undefined,
      service: undefined
    });
  };

  const handleServiceSelection = (service: Service) => {
    setSelectedService(service);
    updateDestination({
      type: 'service',
      serviceId: service.id,
      service,
      employeeId: undefined,
      employee: undefined
    });
  };

  const handleLocationUpdate = (location: string) => {
    setSpecificLocation(location);
    updateDestination({ specificLocation: location });
  };

  const responsableEmployee = selectedService ? 
    employees.find(emp => emp.id === selectedService.responsable) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 4: Destination
        </h2>
        <p className="text-gray-600">
          Sélectionnez la personne ou le service à visiter
        </p>
      </div>
      
      {/* Type de destination */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleDestinationTypeChange('employee')}
          className={`p-4 border-2 rounded-lg transition-all ${
            destinationType === 'employee' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <User className="w-8 h-8 mx-auto mb-2" />
          <div className="font-medium">Personne spécifique</div>
          <div className="text-sm text-gray-500 mt-1">
            Rendez-vous avec un employé précis
          </div>
        </button>
        
        <button
          onClick={() => handleDestinationTypeChange('service')}
          className={`p-4 border-2 rounded-lg transition-all ${
            destinationType === 'service' 
              ? 'border-blue-600 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Building className="w-8 h-8 mx-auto mb-2" />
          <div className="font-medium">Service</div>
          <div className="text-sm text-gray-500 mt-1">
            Visite d'un service sans personne précise
          </div>
        </button>
      </div>

      {destinationType === 'employee' ? (
        <>
          {/* Recherche d'employé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un employé
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom, prénom, matricule ou service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => handleEmployeeSelection(emp)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedEmployee?.id === emp.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {emp.position} - {emp.service.name}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Bureau {emp.office}, {emp.floor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {emp.phone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Mat. {emp.matricule}</div>
                        <div>{emp.service.location}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Aucun employé trouvé pour "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Employé sélectionné */}
          {selectedEmployee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Employé sélectionné
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Nom:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Matricule:</span> {selectedEmployee.matricule}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Service:</span> {selectedEmployee.service.name}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Poste:</span> {selectedEmployee.position}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Bureau:</span> {selectedEmployee.office}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Étage:</span> {selectedEmployee.floor}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">{selectedEmployee.email}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Sélection de service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un service
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedService?.id || ''}
              onChange={(e) => {
                const service = services.find(s => s.id === e.target.value);
                if (service) handleServiceSelection(service);
              }}
            >
              <option value="">Choisir un service...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.location}
                </option>
              ))}
            </select>
          </div>

          {/* Service sélectionné */}
          {selectedService && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Service sélectionné
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <span className="text-blue-600 font-medium">Service:</span> {selectedService.name}
                </div>
                <div className="col-span-2">
                  <span className="text-blue-600 font-medium">Description:</span> {selectedService.description}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Code:</span> {selectedService.code}
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Localisation:</span> {selectedService.location}
                </div>
                {responsableEmployee && (
                  <>
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Responsable:</span> {responsableEmployee.firstName} {responsableEmployee.lastName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{responsableEmployee.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{selectedService.employees.length} employés</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Localisation spécifique */}
      {(selectedEmployee || selectedService) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localisation spécifique (optionnel)
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Salle de réunion A, Bureau du directeur, Accueil du service..."
            value={specificLocation}
            onChange={(e) => handleLocationUpdate(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Précisez un lieu spécifique si nécessaire (salle de réunion, bureau particulier, etc.)
          </p>
        </div>
      )}

      {/* Instructions pour la notification */}
      {(selectedEmployee || selectedService) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Notification automatique</h3>
          <p className="text-sm text-yellow-700">
            {destinationType === 'employee' && selectedEmployee ? (
              <>Une notification sera automatiquement envoyée à <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong> pour l'informer de l'arrivée du visiteur.</>
            ) : selectedService && responsableEmployee ? (
              <>Une notification sera automatiquement envoyée au responsable du service <strong>{responsableEmployee.firstName} {responsableEmployee.lastName}</strong> et aux membres du service.</>
            ) : (
              'Une notification sera envoyée au service sélectionné.'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

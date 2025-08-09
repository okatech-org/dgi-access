import React, { useState, useEffect } from 'react';
import { User, Building, Search, MapPin, Phone, Mail } from 'lucide-react';
import { VisitorRegistrationData, DestinationType } from '../../../types/visitor-process';
import { Employee, Service } from '../../../types/personnel';
import { db } from '../../../services/database';

interface StepDestinationProps {
  data: VisitorRegistrationData;
  onUpdate: (data: Partial<VisitorRegistrationData>) => void;
}

export const StepDestination: React.FC<StepDestinationProps> = ({ data, onUpdate }) => {
  const [destinationType, setDestinationType] = useState<DestinationType>(data.destination.type);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEmployeeGrid, setShowEmployeeGrid] = useState(false);
  const [showServiceGrid, setShowServiceGrid] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data.destination.employeeId) {
      const emp = employees.find(e => e.id === data.destination.employeeId);
      setSelectedEmployee(emp || null);
    }
    if (data.destination.serviceId) {
      const srv = services.find(s => s.id === data.destination.serviceId);
      setSelectedService(srv || null);
    }
  }, [employees, services, data.destination]);

  const loadData = async () => {
    await db.initializeDGIEmployees();
    await db.initializeDefaultData();
    
    const employeesData = db.getEmployees();
    const servicesData = db.getServices();
    
    setEmployees(employeesData);
    setServices(servicesData);
  };

  const handleDestinationTypeChange = (type: DestinationType) => {
    setDestinationType(type);
    setSelectedEmployee(null);
    setSelectedService(null);
    setShowEmployeeGrid(false);
    setShowServiceGrid(false);
    
    onUpdate({
      destination: {
        type,
        employeeId: undefined,
        employeeName: undefined,
        serviceId: undefined,
        serviceName: undefined
      }
    });
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeGrid(false);
    
    onUpdate({
      destination: {
        ...data.destination,
        type: 'employee',
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        serviceId: employee.service.id,
        serviceName: employee.service.name,
        specificLocation: `Bureau ${employee.office}, ${employee.floor}`,
        floor: employee.floor,
        building: employee.service.location
      }
    });
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowServiceGrid(false);
    
    onUpdate({
      destination: {
        ...data.destination,
        type: 'service',
        serviceId: service.id,
        serviceName: service.name,
        employeeId: undefined,
        employeeName: undefined,
        specificLocation: service.location,
        building: service.location
      }
    });
  };

  // Recherche d'employés
  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Employés populaires (Direction et Responsables)
  const popularEmployees = employees.filter(emp => 
    emp.position.toLowerCase().includes('directeur') ||
    emp.position.toLowerCase().includes('responsable') ||
    emp.position.toLowerCase().includes('chef')
  ).slice(0, 6);

  // Services populaires
  const popularServices = services.filter(service => 
    ['DG', 'DLIF', 'DGEF', 'DRF'].includes(service.code)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 4: Destination de la visite
        </h2>
        <p className="text-gray-600">
          Sélectionnez la personne ou le service que le visiteur souhaite rencontrer.
        </p>
      </div>

      {/* Type de destination */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Type de destination</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleDestinationTypeChange('employee')}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              destinationType === 'employee' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="font-medium">Personne spécifique</div>
            <div className="text-sm text-gray-600">Rendez-vous avec un employé DGI</div>
          </button>
          
          <button
            onClick={() => handleDestinationTypeChange('service')}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              destinationType === 'service' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <div className="font-medium">Service DGI</div>
            <div className="text-sm text-gray-600">Visite d'un département</div>
          </button>
        </div>
      </div>

      {destinationType === 'employee' && (
        <div className="space-y-4">
          {/* Sélection d'employé */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Sélectionner un employé DGI</h3>
              <button
                onClick={() => setShowEmployeeGrid(!showEmployeeGrid)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {showEmployeeGrid ? 'Masquer' : 'Grille Personnel'}
              </button>
            </div>

            {/* Recherche rapide */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Employés populaires */}
            {!searchQuery && !showEmployeeGrid && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">👥 Direction et Responsables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {popularEmployees.map(employee => (
                    <button
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className="p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-medium text-sm">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {employee.service.code} • {employee.position}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grille complète d'employés */}
            {(showEmployeeGrid || searchQuery) && (
              <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-3">
                  Personnel DGI ({filteredEmployees.length} employés)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {filteredEmployees.slice(0, 12).map(employee => (
                    <button
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className="p-3 bg-white border rounded-lg text-left hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {employee.firstName} {employee.lastName}
                          </h4>
                          <p className="text-xs text-blue-600 font-medium">{employee.matricule}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">{employee.position}</p>
                        <p className="text-xs text-green-600 font-medium">{employee.service.code}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Bureau {employee.office}</span>
                          <span>{employee.floor}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {filteredEmployees.length > 12 && (
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Affichage de 12 sur {filteredEmployees.length} employés. Affinez votre recherche.
                  </p>
                )}
              </div>
            )}

            {/* Employé sélectionné */}
            {selectedEmployee && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3">✅ Employé sélectionné</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-700">Nom :</span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Matricule :</span>
                      <span className="ml-2 font-medium">{selectedEmployee.matricule}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Position :</span>
                      <span className="ml-2 font-medium">{selectedEmployee.position}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-700">Service :</span>
                      <span className="ml-2 font-medium">{selectedEmployee.service.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Bureau :</span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.office}, {selectedEmployee.floor}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {selectedEmployee.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span>{selectedEmployee.phone}</span>
                        </div>
                      )}
                      {selectedEmployee.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-green-600" />
                          <span>{selectedEmployee.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {destinationType === 'service' && (
        <div className="space-y-4">
          {/* Sélection de service */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Sélectionner un service DGI</h3>
              <button
                onClick={() => setShowServiceGrid(!showServiceGrid)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                {showServiceGrid ? 'Masquer' : 'Grille Services'}
              </button>
            </div>

            {/* Services populaires */}
            {!showServiceGrid && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 Services les plus demandés</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {popularServices.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-medium text-sm">{service.code}</div>
                      <div className="text-xs text-gray-600 truncate">{service.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grille complète de services */}
            {showServiceGrid && (
              <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-3">
                  Services DGI ({services.length} directions)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 bg-white border rounded-lg text-left hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                          <p className="text-xs text-blue-600 font-medium">({service.code})</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                      <div className="text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {service.location}
                        </p>
                        <p className="mt-1">
                          👥 {employees.filter(emp => emp.service.id === service.id).length} employés
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service sélectionné */}
            {selectedService && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3">✅ Service sélectionné</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-700">Service :</span>
                      <span className="ml-2 font-medium">{selectedService.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Code :</span>
                      <span className="ml-2 font-medium">{selectedService.code}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Description :</span>
                      <span className="ml-2">{selectedService.description}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-700">Localisation :</span>
                      <span className="ml-2 font-medium">{selectedService.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700">Employés :</span>
                      <span className="ml-2 font-medium">
                        {employees.filter(emp => emp.service.id === selectedService.id).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
      {(selectedEmployee || selectedService) && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Informations supplémentaires</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de rendez-vous spécifique (optionnel)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Salle de réunion, bureau spécifique..."
                onChange={(e) => onUpdate({
                  destination: {
                    ...data.destination,
                    meetingRoom: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistiques DGI */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">📊 Données DGI intégrées</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{employees.length}</div>
            <div className="text-blue-600">Employés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{services.length}</div>
            <div className="text-blue-600">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">
              {employees.filter(emp => emp.isActive).length}
            </div>
            <div className="text-blue-600">Actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">
              {popularEmployees.length}
            </div>
            <div className="text-blue-600">Direction</div>
          </div>
        </div>
      </div>

      {/* Informations d'aide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Utilisez la recherche pour trouver rapidement un employé</li>
          <li>• Les services populaires (DG, DLIF, DGEF, DRF) sont affichés en priorité</li>
          <li>• La sélection d'un employé assigne automatiquement son service</li>
          <li>• Précisez le lieu de rendez-vous pour faciliter l'orientation</li>
        </ul>
      </div>
    </div>
  );
};

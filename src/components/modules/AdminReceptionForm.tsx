import React, { useState, useEffect } from 'react';
import { 
  Search, User, Building, MapPin, Clock, UserPlus, CheckCircle, 
  Users, ChevronDown, Grid3X3, Filter, Badge, Phone, Mail,
  Building2, FileText, AlertCircle
} from 'lucide-react';
import { Employee, Service } from '../../types/personnel';
import { Visitor } from '../../types/visitor';
import { db } from '../../services/database';
import { TYPICAL_COMPANIES, TYPICAL_VISIT_PURPOSES } from '../../data/dgi-sample-visitors';

interface AdminReceptionFormProps {
  onSubmit: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'>) => void;
}

// Composant grille de sélection employés
const EmployeeGrid: React.FC<{
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  selectedEmployee?: Employee;
  searchTerm: string;
}> = ({ employees, onSelect, selectedEmployee, searchTerm }) => {
  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
      {filteredEmployees.slice(0, 12).map(employee => (
        <div
          key={employee.id}
          onClick={() => onSelect(employee)}
          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedEmployee?.id === employee.id
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">
                {employee.firstName} {employee.lastName}
              </h4>
              <p className="text-xs text-blue-600 font-medium">{employee.matricule}</p>
            </div>
            {selectedEmployee?.id === employee.id && (
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-600">{employee.position}</p>
            <p className="text-xs text-green-600 font-medium">{employee.service.code}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Bureau {employee.office}</span>
              <span>{employee.floor}</span>
            </div>
          </div>
        </div>
      ))}
      
      {filteredEmployees.length === 0 && (
        <div className="col-span-full text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucun employé trouvé</p>
        </div>
      )}
      
      {filteredEmployees.length > 12 && (
        <div className="col-span-full text-center text-sm text-gray-500">
          Affichage de 12 sur {filteredEmployees.length} employés. Affinez votre recherche.
        </div>
      )}
    </div>
  );
};

// Composant grille de sélection services
const ServiceGrid: React.FC<{
  services: Service[];
  onSelect: (service: Service) => void;
  selectedService?: Service;
}> = ({ services, onSelect, selectedService }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {services.map(service => (
        <div
          key={service.id}
          onClick={() => onSelect(service)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedService?.id === service.id
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
              <p className="text-xs text-blue-600 font-medium">({service.code})</p>
            </div>
            {selectedService?.id === service.id && (
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{service.description}</p>
          <div className="text-xs text-gray-500">
            <p>📍 {service.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant grille d'entreprises
const CompanyGrid: React.FC<{
  companies: string[];
  onSelect: (company: string) => void;
  selectedCompany: string;
  searchTerm: string;
}> = ({ companies, onSelect, selectedCompany, searchTerm }) => {
  const filteredCompanies = companies.filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
      {filteredCompanies.map(company => (
        <div
          key={company}
          onClick={() => onSelect(company)}
          className={`p-2 border rounded-lg cursor-pointer transition-all text-sm ${
            selectedCompany === company
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{company}</span>
            {selectedCompany === company && (
              <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0 ml-auto" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant grille de motifs
const PurposeGrid: React.FC<{
  purposes: string[];
  onSelect: (purpose: string) => void;
  selectedPurpose: string;
}> = ({ purposes, onSelect, selectedPurpose }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
      {purposes.map(purpose => (
        <div
          key={purpose}
          onClick={() => onSelect(purpose)}
          className={`p-3 border rounded-lg cursor-pointer transition-all text-sm ${
            selectedPurpose === purpose
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{purpose}</span>
            {selectedPurpose === purpose && (
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminReceptionForm: React.FC<AdminReceptionFormProps> = ({ onSubmit }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // États de sélection
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  
  // États de recherche
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  
  // États des grilles
  const [showEmployeeGrid, setShowEmployeeGrid] = useState(false);
  const [showServiceGrid, setShowServiceGrid] = useState(false);
  const [showCompanyGrid, setShowCompanyGrid] = useState(false);
  const [showPurposeGrid, setShowPurposeGrid] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    idType: 'CNI' as const,
    idNumber: '',
    expectedDuration: '30 minutes'
  });

  // Charger les données DGI
  useEffect(() => {
    const loadData = async () => {
      await db.initializeDefaultData();
      await db.initializeDGIEmployees();
      
      const employeesData = db.getEmployees();
      const servicesData = db.getServices();
      
      setEmployees(employeesData);
      setServices(servicesData);
    };
    
    loadData();
  }, []);

  // Sélection automatique du service selon l'employé
  useEffect(() => {
    if (selectedEmployee) {
      setSelectedService(selectedEmployee.service);
      setShowServiceGrid(false);
    }
  }, [selectedEmployee]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchTerm(`${employee.firstName} ${employee.lastName} - ${employee.service.name}`);
    setShowEmployeeGrid(false);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowServiceGrid(false);
  };

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company);
    setShowCompanyGrid(false);
  };

  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
    setShowPurposeGrid(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert('⚠️ Veuillez sélectionner un employé DGI à visiter');
      return;
    }

    if (!selectedPurpose) {
      alert('⚠️ Veuillez sélectionner un motif de visite');
      return;
    }

    const visitor: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: selectedCompany || undefined,
      phone: formData.phone,
      email: formData.email || undefined,
      idType: formData.idType,
      idNumber: formData.idNumber,
      purpose: selectedPurpose,
      employeeToVisit: selectedEmployee.id,
      serviceToVisit: selectedEmployee.service.id,
      status: 'checked-in',
      expectedDuration: formData.expectedDuration
    };

    onSubmit(visitor);
    
    // Reset du formulaire
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      idType: 'CNI',
      idNumber: '',
      expectedDuration: '30 minutes'
    });
    setSelectedEmployee(null);
    setSelectedService(null);
    setSelectedCompany('');
    setSelectedPurpose('');
    setEmployeeSearchTerm('');
    setCompanySearchTerm('');
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-blue-600" />
          Enregistrement Visiteur DGI - Mode Administrateur
        </h2>
        <p className="text-gray-600 mt-1">
          Sélection intelligente avec grilles de données réelles DGI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations visiteur */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations du Visiteur
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="+241 XX XX XX XX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pièce *
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                className={inputClass}
                required
              >
                <option value="CNI">Carte Nationale d'Identité</option>
                <option value="Passeport">Passeport</option>
                <option value="Permis">Permis de conduire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de pièce *
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* Grille Société */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Société / Organisation ({TYPICAL_COMPANIES.length} entreprises gabonaises)
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={companySearchTerm}
                  onChange={(e) => setCompanySearchTerm(e.target.value)}
                  placeholder="Rechercher ou saisir une entreprise..."
                  className={inputClass}
                  onFocus={() => setShowCompanyGrid(true)}
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowCompanyGrid(!showCompanyGrid)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grille
              </button>
            </div>
            
            {selectedCompany && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Entreprise sélectionnée: {selectedCompany}</span>
                </div>
              </div>
            )}
            
            {showCompanyGrid && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <CompanyGrid
                  companies={TYPICAL_COMPANIES}
                  onSelect={handleCompanySelect}
                  selectedCompany={selectedCompany}
                  searchTerm={companySearchTerm}
                />
              </div>
            )}
          </div>
        </div>

        {/* Grille Personnel DGI */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            Personnel DGI à Rencontrer * ({employees.length} employés)
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, matricule, service, poste..."
                  className={inputClass}
                  onFocus={() => setShowEmployeeGrid(true)}
                  required
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowEmployeeGrid(!showEmployeeGrid)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grille Personnel
              </button>
            </div>
            
            {selectedEmployee && (
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Employé DGI sélectionné
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700"><strong>Nom complet:</strong></p>
                    <p className="text-blue-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Matricule:</strong></p>
                    <p className="text-blue-900">{selectedEmployee.matricule}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Poste:</strong></p>
                    <p className="text-blue-900">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Service:</strong></p>
                    <p className="text-blue-900">{selectedEmployee.service.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Bureau:</strong></p>
                    <p className="text-blue-900">Bureau {selectedEmployee.office}, {selectedEmployee.floor}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>Email:</strong></p>
                    <p className="text-blue-900">{selectedEmployee.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {showEmployeeGrid && (
              <div className="border border-blue-300 rounded-lg p-4 bg-white">
                <EmployeeGrid
                  employees={employees}
                  onSelect={handleEmployeeSelect}
                  selectedEmployee={selectedEmployee}
                  searchTerm={employeeSearchTerm}
                />
              </div>
            )}
          </div>
        </div>

        {/* Grille Services (pré-sélectionné automatiquement) */}
        {selectedService && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-green-700" />
              Service DGI (Pré-sélectionné automatiquement)
            </h3>
            
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700"><strong>Service:</strong></p>
                  <p className="text-green-900">{selectedService.name}</p>
                </div>
                <div>
                  <p className="text-green-700"><strong>Code:</strong></p>
                  <p className="text-green-900">{selectedService.code}</p>
                </div>
                <div>
                  <p className="text-green-700"><strong>Description:</strong></p>
                  <p className="text-green-900">{selectedService.description}</p>
                </div>
                <div>
                  <p className="text-green-700"><strong>Localisation:</strong></p>
                  <p className="text-green-900">{selectedService.location}</p>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowServiceGrid(!showServiceGrid)}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Voir tous les services ({services.length})
            </button>
            
            {showServiceGrid && (
              <div className="mt-4 border border-green-300 rounded-lg p-4 bg-white">
                <ServiceGrid
                  services={services}
                  onSelect={handleServiceSelect}
                  selectedService={selectedService}
                />
              </div>
            )}
          </div>
        )}

        {/* Grille Motifs DGI */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            Motif de la Visite DGI * ({TYPICAL_VISIT_PURPOSES.length} motifs spécifiques)
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedPurpose}
                  readOnly
                  placeholder="Sélectionnez un motif de visite DGI..."
                  className={`${inputClass} cursor-pointer`}
                  onClick={() => setShowPurposeGrid(true)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPurposeGrid(!showPurposeGrid)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grille Motifs
              </button>
            </div>
            
            {selectedPurpose && (
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Motif sélectionné: {selectedPurpose}</span>
                </div>
              </div>
            )}
            
            {showPurposeGrid && (
              <div className="border border-purple-300 rounded-lg p-4 bg-white">
                <PurposeGrid
                  purposes={TYPICAL_VISIT_PURPOSES}
                  onSelect={handlePurposeSelect}
                  selectedPurpose={selectedPurpose}
                />
              </div>
            )}
          </div>
        </div>

        {/* Durée et validation */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Durée de la Visite
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée estimée
              </label>
              <select
                name="expectedDuration"
                value={formData.expectedDuration}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 heure">1 heure</option>
                <option value="2 heures">2 heures</option>
                <option value="Demi-journée">Demi-journée</option>
                <option value="Journée complète">Journée complète</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 text-lg"
          >
            <UserPlus className="w-6 h-6" />
            Enregistrer Visiteur et Générer Badge DGI
          </button>
          
          {!selectedEmployee && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Veuillez sélectionner un employé DGI avant de valider</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Statistiques en bas */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-bold text-xl text-blue-600">{employees.length}</div>
            <div className="text-blue-800">Employés DGI</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-bold text-xl text-green-600">{services.length}</div>
            <div className="text-green-800">Services DGI</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-bold text-xl text-purple-600">{TYPICAL_COMPANIES.length}</div>
            <div className="text-purple-800">Entreprises</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="font-bold text-xl text-orange-600">{TYPICAL_VISIT_PURPOSES.length}</div>
            <div className="text-orange-800">Motifs DGI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, User, Building, MapPin, Clock, UserPlus, CheckCircle } from 'lucide-react';
import { Employee, Service } from '../../types/personnel';
import { Visitor } from '../../types/visitor';
import { db } from '../../services/database';
import { TYPICAL_COMPANIES, TYPICAL_VISIT_PURPOSES } from '../../data/dgi-sample-visitors';

interface ReceptionVisitorFormProps {
  onSubmit: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'>) => void;
}

export const ReceptionVisitorForm: React.FC<ReceptionVisitorFormProps> = ({ onSubmit }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // État de recherche pour employé
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [employeeSuggestions, setEmployeeSuggestions] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // État de recherche pour entreprise
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
    idType: 'CNI' as const,
    idNumber: '',
    purpose: '',
    expectedDuration: '30 minutes'
  });

  // Charger les données DGI au montage
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

  // Auto-complétion pour employés DGI
  useEffect(() => {
    if (employeeSearchQuery.length > 2) {
      const results = db.searchEmployee(employeeSearchQuery);
      setEmployeeSuggestions(results.slice(0, 8));
    } else {
      setEmployeeSuggestions([]);
    }
  }, [employeeSearchQuery]);

  // Auto-complétion pour entreprises gabonaises
  useEffect(() => {
    if (formData.company.length > 2) {
      const companyResults = TYPICAL_COMPANIES.filter(company =>
        company.toLowerCase().includes(formData.company.toLowerCase())
      );
      setCompanySuggestions(companyResults.slice(0, 5));
    } else {
      setCompanySuggestions([]);
    }
  }, [formData.company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearchQuery(`${employee.firstName} ${employee.lastName} - ${employee.service.name}`);
    setEmployeeSuggestions([]);
  };

  const handleCompanySelect = (company: string) => {
    setFormData(prev => ({ ...prev, company }));
    setCompanySuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert('Veuillez sélectionner un employé DGI à visiter');
      return;
    }

    const visitor: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || undefined,
      phone: formData.phone,
      email: formData.email || undefined,
      idType: formData.idType,
      idNumber: formData.idNumber,
      purpose: formData.purpose,
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
      company: '',
      phone: '',
      email: '',
      idType: 'CNI',
      idNumber: '',
      purpose: '',
      expectedDuration: '30 minutes'
    });
    setSelectedEmployee(null);
    setEmployeeSearchQuery('');
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-blue-600" />
          Enregistrement Visiteur DGI
        </h2>
        <p className="text-gray-600 mt-1">
          Système de traçabilité avec recherche intelligente du personnel DGI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations visiteur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Société avec auto-complétion */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Société / Organisation
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className={inputClass}
            placeholder="ex: SOGARA, BGFI Bank, Total Gabon..."
          />
          
          {/* Suggestions entreprises gabonaises */}
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
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                >
                  <Building className="w-4 h-4 inline mr-2 text-gray-400" />
                  {company}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recherche d'employé DGI avec pré-sélection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Personne à rencontrer * (Personnel DGI)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
              placeholder="Tapez le nom, matricule ou service d'un employé DGI..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Suggestions employés DGI */}
          {employeeSuggestions.length > 0 && (
            <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="p-3 border-b bg-blue-50">
                <p className="text-xs text-blue-700 font-medium">
                  Personnel DGI ({employeeSuggestions.length} résultats)
                </p>
              </div>
              {employeeSuggestions.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleEmployeeSelect(emp)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {emp.position} • {emp.matricule}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {emp.service.name}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>Bureau {emp.office}</div>
                      <div>{emp.floor}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Affichage de l'employé sélectionné */}
        {selectedEmployee && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                <p className="text-blue-700"><strong>Poste:</strong></p>
                <p className="text-blue-900">{selectedEmployee.position}</p>
              </div>
              <div>
                <p className="text-blue-700"><strong>Service:</strong></p>
                <p className="text-blue-900">{selectedEmployee.service.name} ({selectedEmployee.service.code})</p>
              </div>
              <div>
                <p className="text-blue-700"><strong>Bureau:</strong></p>
                <p className="text-blue-900">Bureau {selectedEmployee.office}, {selectedEmployee.floor}</p>
              </div>
              <div>
                <p className="text-blue-700"><strong>Email:</strong></p>
                <p className="text-blue-900">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-blue-700"><strong>Localisation:</strong></p>
                <p className="text-blue-900">{selectedEmployee.service.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Motif et durée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de la visite *
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className={inputClass}
              required
            >
              <option value="">Sélectionner un motif</option>
              {TYPICAL_VISIT_PURPOSES.map((purpose, index) => (
                <option key={index} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
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

        {/* Informations pièce d'identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Bouton de soumission */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Enregistrer et Générer Badge DGI
          </button>
        </div>
      </form>

      {/* Statistiques en bas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500">Personnel DGI</p>
            <p className="text-lg font-bold text-blue-600">{employees.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Services</p>
            <p className="text-lg font-bold text-green-600">{services.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Entreprises</p>
            <p className="text-lg font-bold text-purple-600">{TYPICAL_COMPANIES.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

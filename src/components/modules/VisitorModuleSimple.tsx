import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, UserPlus, Search, Download, Eye } from 'lucide-react';
import { Visitor } from '../../types/visitor';
import { Employee, Service } from '../../types/personnel';
import { db } from '../../services/database';

import { ReceptionVisitorForm } from './ReceptionVisitorForm';
import { AdminReceptionForm } from './AdminReceptionForm';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

interface VisitorRegistrationFormProps {
  employees: Employee[];
  services: Service[];
  onSubmit: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'>) => void;
}

const VisitorRegistrationForm: React.FC<VisitorRegistrationFormProps> = ({
  employees,
  services,
  onSubmit
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showOtherCompany, setShowOtherCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
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

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = db.searchEmployee(searchQuery);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Auto-complétion pour les entreprises
  useEffect(() => {
    if (formData.company.length > 2) {
      const companyResults = db.searchCompanies(formData.company);
      setCompanySuggestions([...companyResults.slice(0, 5), 'Autre']);
    } else {
      setCompanySuggestions([]);
    }
  }, [formData.company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert('Veuillez sélectionner un employé à visiter');
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
    
    // Reset form
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
    setSearchQuery('');
    setShowOtherCompany(false);
    setNewCompanyName('');
  };

  const handleCompanySelect = (company: string) => {
    if (company === 'Autre') {
      setShowOtherCompany(true);
      setFormData(prev => ({ ...prev, company: '' }));
    } else {
      setFormData(prev => ({ ...prev, company }));
      setShowOtherCompany(false);
    }
    setCompanySuggestions([]);
  };

  const handleSaveNewCompany = async () => {
    if (newCompanyName.trim()) {
      await db.saveCompany(newCompanyName.trim());
      setFormData(prev => ({ ...prev, company: newCompanyName.trim() }));
      setNewCompanyName('');
      setShowOtherCompany(false);
    }
  };

  const handleCancelNewCompany = () => {
    setNewCompanyName('');
    setShowOtherCompany(false);
    setFormData(prev => ({ ...prev, company: '' }));
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Enregistrement Visiteur</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
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
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={inputClass}
            required
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Société
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            className={inputClass}
            placeholder="ex: SOGARA, BGFI Bank..."
          />
          
          {/* Suggestions entreprises */}
          {companySuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {companySuggestions.map((company, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCompanySelect(company)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm ${
                    company === 'Autre' ? 'bg-orange-50 text-orange-700 font-medium hover:bg-orange-100' : ''
                  }`}
                >
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
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de pièce *
          </label>
          <select
            value={formData.idType}
            onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value as any }))}
            className={inputClass}
            required
          >
            <option value="CNI">Carte Nationale d'Identité</option>
            <option value="Passeport">Passeport</option>
            <option value="Permis">Permis de conduire</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de pièce *
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employé à visiter *
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tapez le nom, matricule ou service..."
          className={inputClass}
          required
        />
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map(emp => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  setSelectedEmployee(emp);
                  setSearchQuery(`${emp.firstName} ${emp.lastName} - ${emp.service.name}`);
                  setSuggestions([]);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                  <div className="text-sm text-gray-500">{emp.matricule}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{emp.service.name}</div>
                  <div className="text-xs text-gray-500">
                    {emp.office && `Bureau ${emp.office}`} {emp.floor}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Détails de l'employé sélectionné</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Service:</strong> {selectedEmployee.service.name}
            </div>
            <div>
              <strong>Poste:</strong> {selectedEmployee.position}
            </div>
            <div>
              <strong>Bureau:</strong> {selectedEmployee.office || 'Non spécifié'}
            </div>
            <div>
              <strong>Étage:</strong> {selectedEmployee.floor || 'Non spécifié'}
            </div>
            <div className="col-span-2">
              <strong>Email:</strong> {selectedEmployee.email}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motif de la visite *
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Sélectionner un motif</option>
            <option value="Déclaration fiscale annuelle">Déclaration fiscale annuelle</option>
            <option value="Déclaration TVA trimestrielle">Déclaration TVA trimestrielle</option>
            <option value="Contrôle fiscal - Vérification comptable">Contrôle fiscal - Vérification</option>
            <option value="Recouvrement amiable">Recouvrement amiable</option>
            <option value="Demande d'exonération fiscale">Demande d'exonération fiscale</option>
            <option value="Formation SYDONIA">Formation SYDONIA</option>
            <option value="Coordination politique fiscale">Coordination politique fiscale</option>
            <option value="Réclamation impôt sur le revenu">Réclamation impôt sur le revenu</option>
            <option value="Dépôt de dossier fiscal">Dépôt de dossier fiscal</option>
            <option value="Consultation juridique fiscale">Consultation juridique fiscale</option>
            <option value="Audit fiscal">Audit fiscal</option>
            <option value="Mise en conformité fiscale">Mise en conformité fiscale</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée estimée
          </label>
          <select
            value={formData.expectedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedDuration: e.target.value }))}
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

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <UserPlus className="w-5 h-5 inline mr-2" />
        Enregistrer et Imprimer Badge
      </button>
    </form>
  );
};

interface TodayVisitorsProps {
  visitors: Visitor[];
  employees: Employee[];
  onCheckOut: (visitorId: string) => void;
  onViewDetails: (visitor: Visitor) => void;
}

const TodayVisitors: React.FC<TodayVisitorsProps> = ({ 
  visitors, 
  employees, 
  onCheckOut, 
  onViewDetails 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employé non trouvé';
  };

  const exportToCSV = () => {
    const headers = ['Visiteur', 'Société', 'Téléphone', 'Employé visité', 'Motif', 'Heure d\'arrivée', 'Statut'];
    const csvData = [
      headers.join(','),
      ...filteredVisitors.map(visitor => [
        `${visitor.firstName} ${visitor.lastName}`,
        visitor.company || '',
        visitor.phone,
        getEmployeeName(visitor.employeeToVisit),
        visitor.purpose,
        new Date(visitor.checkInTime).toLocaleString('fr-FR'),
        visitor.status === 'checked-in' ? 'Présent' : 'Parti'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visiteurs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Visiteurs du Jour</h3>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un visiteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="checked-in">Présents</option>
            <option value="checked-out">Partis</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Visiteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employé visité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Motif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Heure d'arrivée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVisitors.map((visitor) => {
              const employee = employees.find(e => e.id === visitor.employeeToVisit);
              return (
                <tr key={visitor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {visitor.firstName} {visitor.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {visitor.company && `${visitor.company} • `}
                        {visitor.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getEmployeeName(visitor.employeeToVisit)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee?.service.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visitor.purpose}</div>
                    <div className="text-sm text-gray-500">
                      Durée: {visitor.expectedDuration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(visitor.checkInTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      visitor.status === 'checked-in'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {visitor.status === 'checked-in' ? 'Présent' : 'Parti'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDetails(visitor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {visitor.status === 'checked-in' && (
                        <button
                          onClick={() => onCheckOut(visitor.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Marquer comme parti"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredVisitors.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun visiteur trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun visiteur ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const VisitorModuleSimple: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Détermine si on est sur la route réception
  const isReceptionRoute = location.pathname.includes('/reception');
  const isReception = user?.role === 'RECEPTION' || isReceptionRoute;
  
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [stats, setStats] = useState({
    today: 0,
    checkedIn: 0,
    checkedOut: 0,
    thisWeek: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await db.initializeDefaultData();
    await db.initializeDGIEmployees();
    
    const visitorsData = db.getTodayVisitors();
    const employeesData = db.getEmployees();
    const servicesData = db.getServices();
    const visitorStats = db.getVisitorStats();
    
    setVisitors(visitorsData);
    setEmployees(employeesData);
    setServices(servicesData);
    setStats({
      today: visitorStats.today,
      checkedIn: visitorStats.checkedIn,
      checkedOut: visitorStats.checkedOut,
      thisWeek: visitorStats.thisWeek
    });
  };

  const handleRegisterVisitor = async (visitorData: Omit<Visitor, 'id' | 'checkInTime' | 'badgeNumber'>) => {
    const visitor: Visitor = {
      ...visitorData,
      id: `visitor-${Date.now()}`,
      checkInTime: new Date(),
      badgeNumber: `BADGE-${Date.now().toString().slice(-6)}`
    };

    await db.saveVisitor(visitor);
    loadData();
    
    // Confirmation avec détails de l'employé DGI
    const employee = employees.find(e => e.id === visitor.employeeToVisit);
    const service = services.find(s => s.id === visitor.serviceToVisit);
    
    alert(`✅ Visiteur enregistré avec succès !
    
Badge: ${visitor.badgeNumber}
Visiteur: ${visitor.firstName} ${visitor.lastName}
À rencontrer: ${employee ? `${employee.firstName} ${employee.lastName}` : 'Employé non trouvé'}
Service: ${service ? service.name : 'Service non trouvé'}
Bureau: ${employee ? `Bureau ${employee.office}, ${employee.floor}` : 'N/A'}

🖨️ Badge prêt pour impression`);
  };

  const handleCheckOut = async (visitorId: string) => {
    await db.checkOutVisitor(visitorId);
    loadData();
  };

  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Visiteurs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Aujourd'hui"
          value={stats.today}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Présents"
          value={stats.checkedIn}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Partis"
          value={stats.checkedOut}
          icon={XCircle}
          color="bg-gray-500"
        />
        <StatCard
          title="Cette semaine"
          value={stats.thisWeek}
          icon={Clock}
          color="bg-purple-500"
        />
      </div>

      {user?.role === 'ADMIN' ? (
        <AdminReceptionForm onSubmit={handleRegisterVisitor} />
      ) : isReception ? (
        <ReceptionVisitorForm onSubmit={handleRegisterVisitor} />
      ) : (
        <VisitorRegistrationForm
          employees={employees}
          services={services}
          onSubmit={handleRegisterVisitor}
        />
      )}

      <TodayVisitors
        visitors={visitors}
        employees={employees}
        onCheckOut={handleCheckOut}
        onViewDetails={handleViewDetails}
      />

      {selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Détails du Visiteur</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Nom:</strong> {selectedVisitor.firstName} {selectedVisitor.lastName}</div>
              <div><strong>Société:</strong> {selectedVisitor.company || 'Non spécifiée'}</div>
              <div><strong>Téléphone:</strong> {selectedVisitor.phone}</div>
              <div><strong>Badge:</strong> {selectedVisitor.badgeNumber}</div>
              <div><strong>Motif:</strong> {selectedVisitor.purpose}</div>
              <div><strong>Durée estimée:</strong> {selectedVisitor.expectedDuration}</div>
              <div><strong>Arrivée:</strong> {new Date(selectedVisitor.checkInTime).toLocaleString('fr-FR')}</div>
              {selectedVisitor.checkOutTime && (
                <div><strong>Départ:</strong> {new Date(selectedVisitor.checkOutTime).toLocaleString('fr-FR')}</div>
              )}
            </div>
            <button
              onClick={() => setSelectedVisitor(null)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

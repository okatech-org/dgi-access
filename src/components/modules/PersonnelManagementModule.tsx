import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Users, Building, UserCheck, UserX, Edit, Trash2, 
  Download, Upload, Save, X, Eye, Phone, Mail, MapPin, Badge,
  Filter, Grid3X3, List
} from 'lucide-react';
import { Employee, Service } from '../../types/personnel';
import { db } from '../../services/database';

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

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  editingEmployee?: Employee | null;
  onSubmit: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  services,
  editingEmployee,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceId: '',
    position: '',
    office: '',
    floor: '',
    isActive: true,
    photo: ''
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        matricule: editingEmployee.matricule,
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        serviceId: editingEmployee.service.id,
        position: editingEmployee.position,
        office: editingEmployee.office,
        floor: editingEmployee.floor,
        isActive: editingEmployee.isActive,
        photo: editingEmployee.photo || ''
      });
    } else {
      setFormData({
        matricule: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        serviceId: '',
        position: '',
        office: '',
        floor: '',
        isActive: true,
        photo: ''
      });
    }
  }, [editingEmployee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedService = services.find(s => s.id === formData.serviceId);
    if (!selectedService) {
      alert('Veuillez sélectionner un service');
      return;
    }

    const employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
      matricule: formData.matricule,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      service: selectedService,
      position: formData.position,
      office: formData.office,
      floor: formData.floor,
      isActive: formData.isActive,
      photo: formData.photo || undefined
    };

    onSubmit(employee);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule *
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className={inputClass}
                placeholder="DGI0001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Sélectionner un service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.code} - {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
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
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                onChange={handleChange}
                className={inputClass}
                placeholder="+241 XX XX XX XX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste/Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={inputClass}
                placeholder="Directeur, Chef de service, Agent..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bureau
              </label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className={inputClass}
                placeholder="101, 201A, 305..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Étage
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className={inputClass}
                placeholder="RDC, 1er étage, 2ème étage..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Employé actif
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingEmployee ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EmployeeGridViewProps {
  employees: Employee[];
  services: Service[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
}

const EmployeeGridView: React.FC<EmployeeGridViewProps> = ({
  employees,
  services,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === '' || emp.service.id === selectedService;
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.code} - {service.name}
                </option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des employés */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Personnel DGI ({filteredEmployees.length} employés)
          </h3>
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h4>
                      <p className="text-sm text-blue-600">{employee.matricule}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="w-4 h-4 text-gray-400" />
                    <span>{employee.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{employee.service.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Bureau {employee.office}, {employee.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => onToggleStatus(employee)}
                    className={`text-sm px-2 py-1 rounded ${
                      employee.isActive 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {employee.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(employee)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(employee)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{employee.matricule}</span>
                        <span>{employee.position}</span>
                        <span>{employee.service.code}</span>
                        <span>Bureau {employee.office}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </div>
                    
                    <button
                      onClick={() => onEdit(employee)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(employee)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun employé trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PersonnelManagementModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    services: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await db.initializeDefaultData();
    await db.initializeDGIEmployees();
    
    const employeesData = db.getEmployees();
    const servicesData = db.getServices();
    
    setEmployees(employeesData);
    setServices(servicesData);
    
    setStats({
      total: employeesData.length,
      active: employeesData.filter(emp => emp.isActive).length,
      inactive: employeesData.filter(emp => !emp.isActive).length,
      services: servicesData.length
    });
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    await db.saveEmployee({
      ...employeeData,
      id: `emp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    loadData();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleUpdateEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEmployee) {
      await db.saveEmployee({
        ...employeeData,
        id: editingEmployee.id,
        createdAt: editingEmployee.createdAt,
        updatedAt: new Date()
      });
      setEditingEmployee(null);
      loadData();
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${employee.firstName} ${employee.lastName} ?`)) {
      await db.deleteEmployee(employee.id);
      loadData();
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    await db.saveEmployee({
      ...employee,
      isActive: !employee.isActive,
      updatedAt: new Date()
    });
    loadData();
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion du Personnel DGI</h1>
            <p className="text-blue-100 mt-1">
              Administration complète des employés et services
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter Employé
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Employés"
          value={stats.total}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Employés Actifs"
          value={stats.active}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Employés Inactifs"
          value={stats.inactive}
          icon={UserX}
          color="bg-red-500"
        />
        <StatCard
          title="Services DGI"
          value={stats.services}
          icon={Building}
          color="bg-purple-500"
        />
      </div>

      {/* Gestion des employés */}
      <EmployeeGridView
        employees={employees}
        services={services}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modal d'ajout/modification */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        services={services}
        editingEmployee={editingEmployee}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
      />
    </div>
  );
};

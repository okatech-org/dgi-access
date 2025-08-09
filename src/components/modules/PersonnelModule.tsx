import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Building, UserCheck, UserX, Edit, Trash2, Download } from 'lucide-react';
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

interface AddEmployeeFormProps {
  services: Service[];
  onSubmit: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingEmployee?: Employee | null;
  onCancel?: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ 
  services, 
  onSubmit, 
  editingEmployee, 
  onCancel 
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
    }
  }, [editingEmployee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedService = services.find(s => s.id === formData.serviceId);
    if (!selectedService) return;

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
    
    if (!editingEmployee) {
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
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">
          {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
        </h3>
        {editingEmployee && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matricule *
          </label>
          <input
            type="text"
            value={formData.matricule}
            onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service *
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
            className={inputClass}
            required
          >
            <option value="">Sélectionner un service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
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
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poste *
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bureau
          </label>
          <input
            type="text"
            value={formData.office}
            onChange={(e) => setFormData(prev => ({ ...prev, office: e.target.value }))}
            className={inputClass}
            placeholder="ex: 203"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Étage
          </label>
          <input
            type="text"
            value={formData.floor}
            onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
            className={inputClass}
            placeholder="ex: 2ème étage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
            className={inputClass}
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {editingEmployee ? 'Mettre à jour' : 'Ajouter l\'employé'}
      </button>
    </form>
  );
};

interface EmployeesByServiceProps {
  services: Service[];
  employees: Employee[];
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const EmployeesByService: React.FC<EmployeesByServiceProps> = ({ 
  services, 
  employees, 
  onEditEmployee, 
  onDeleteEmployee 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === '' || employee.service.id === selectedService;
    
    return matchesSearch && matchesService;
  });

  const exportToCSV = () => {
    const headers = ['Matricule', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Service', 'Poste', 'Bureau', 'Étage', 'Statut'];
    const csvData = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        emp.matricule,
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.phone,
        emp.service.name,
        emp.position,
        emp.office,
        emp.floor,
        emp.isActive ? 'Actif' : 'Inactif'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personnel_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Personnel par Service</h3>
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
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les services</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poste
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bureau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.matricule} • {employee.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.service.name}</div>
                  <div className="text-sm text-gray-500">{employee.service.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {employee.office && `Bureau ${employee.office}`}
                  </div>
                  <div className="text-sm text-gray-500">{employee.floor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditEmployee(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Modifiez vos critères de recherche ou ajoutez un nouvel employé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PersonnelModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    servicesCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await db.initializeDefaultData();
    const employeesData = db.getEmployees();
    const servicesData = db.getServices();
    const employeeStats = db.getEmployeeStats();
    
    setEmployees(employeesData);
    setServices(servicesData);
    setStats({
      total: employeeStats.total,
      active: employeeStats.active,
      inactive: employeeStats.inactive,
      servicesCount: servicesData.length
    });
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const employee: Employee = {
      ...employeeData,
      id: editingEmployee?.id || `emp-${Date.now()}`,
      createdAt: editingEmployee?.createdAt || new Date(),
      updatedAt: new Date()
    };

    await db.saveEmployee(employee);
    setEditingEmployee(null);
    loadData();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      await db.deleteEmployee(employeeId);
      loadData();
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Personnel"
          value={stats.total}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Services"
          value={stats.servicesCount}
          icon={Building}
          color="bg-green-500"
        />
        <StatCard
          title="Actifs"
          value={stats.active}
          icon={UserCheck}
          color="bg-emerald-500"
        />
        <StatCard
          title="Inactifs"
          value={stats.inactive}
          icon={UserX}
          color="bg-red-500"
        />
      </div>

      <AddEmployeeForm
        services={services}
        onSubmit={handleAddEmployee}
        editingEmployee={editingEmployee}
        onCancel={handleCancelEdit}
      />

      <EmployeesByService
        services={services}
        employees={employees}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />
    </div>
  );
};

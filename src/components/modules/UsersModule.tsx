import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Download
} from 'lucide-react';
import { UserModal, UserData } from '../modals/UserModal';
import { showToast } from '../../utils/toastManager';

export const UsersModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState<UserData[]>([
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'NGUEMA',
      email: 'jean.nguema@dgi.ga',
      role: 'CSD',
      department: 'Centre des Impôts – Akanda (CIPEP)',
      location: 'Akanda',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00',
      createdAt: '2023-06-15'
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'AKUE',
      email: 'marie.akue@dgi.ga',
      role: 'AG',
      department: 'Services aux Contribuables',
      location: 'Port-Gentil',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00',
      createdAt: '2023-08-20'
    },
    {
      id: 3,
      firstName: 'Paul',
      lastName: 'OBIANG',
      email: 'paul.obiang@dgi.ga',
      role: 'CSI',
      department: 'Contrôle Fiscal & Vérification',
      location: 'Libreville',
      status: 'inactive',
      lastLogin: '2024-01-10T14:45:00',
      createdAt: '2023-05-10'
    },
    {
      id: 4,
      firstName: 'Sylvie',
      lastName: 'MBOUMBA',
      email: 'sylvie.mboumba@dgi.ga',
      role: 'ACF',
      department: 'Recouvrement & Contentieux',
      location: 'Libreville',
      status: 'active',
      lastLogin: '2024-01-15T11:20:00',
      createdAt: '2023-09-05'
    },
    {
      id: 5,
      firstName: 'André',
      lastName: 'MOUNGOUNGOU',
      email: 'andre.moungoungou@dgi.ga',
      role: 'SR',
      department: 'Chef de Centre Régional',
      location: 'Franceville',
      status: 'suspended',
      lastLogin: '2024-01-12T16:30:00',
      createdAt: '2023-07-12'
    }
  ]);

  const getRoleLabel = (role: string) => {
    const labels = {
      ADMIN: 'Administrateur Système',
      DG: 'Direction Générale',
      CSD: 'Chef de Centre des Impôts',
      CSI: 'Inspecteur Principal (Contrôle Fiscal)',
      AG: 'Agent Accueil Contribuables',
      ACF: 'Agent de Recouvrement',
      SR: 'Chef de Centre Régional',
      AC: 'Auditeur Fiscal'
    } as const;
    return (labels as Record<string, string>)[role] || role;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Gestionnaires d'événements
  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: UserData) => {
    setModalMode('view');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: UserData) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Simuler une suppression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast.userDeleted(`${user.firstName} ${user.lastName}`);
    } catch (error) {
      showToast.error('Erreur de suppression', 'Impossible de supprimer l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = (userData: UserData) => {
    if (modalMode === 'create') {
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id || 0)) + 1,
        createdAt: new Date().toISOString(),
        lastLogin: undefined
      };
      setUsers(prev => [...prev, newUser]);
    } else if (modalMode === 'edit') {
      setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    }
  };

  const handleExportUsers = () => {
    try {
      const csv = [
        ['ID', 'Prénom', 'Nom', 'Email', 'Rôle', 'Département', 'Localisation', 'Statut', 'Dernière connexion'].join(','),
        ...users.map(user => [
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          getRoleLabel(user.role),
          user.department,
          user.location,
          getStatusLabel(user.status),
          user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `utilisateurs-dgi-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.dataExported('des utilisateurs');
    } catch (error) {
      showToast.error('Erreur d\'export', 'Impossible d\'exporter les utilisateurs');
    }
  };

  const roleStats = [
    { role: 'Administrateurs', count: 3, color: 'bg-red-500' },
    { role: 'Chefs de Centre', count: 8, color: 'bg-blue-500' },
    { role: 'Inspecteurs/Agents', count: 45, color: 'bg-green-500' },
    { role: 'Chefs Régionaux', count: 12, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Administration des comptes et permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportUsers}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
          <button 
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.role}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="DG">Direction Générale</option>
            <option value="CSD">Chef de Centre des Impôts</option>
            <option value="CSI">Inspecteur Principal (Contrôle Fiscal)</option>
            <option value="AG">Agent Accueil Contribuables</option>
            <option value="ACF">Agent de Recouvrement</option>
            <option value="SR">Chef de Centre Régional</option>
            <option value="AC">Auditeur Fiscal</option>
          </select>
          <button 
            onClick={() => showToast.info('Filtres avancés', 'Filtres avancés en développement')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{getRoleLabel(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className="text-sm text-gray-700">{getStatusLabel(user.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                      >
                        {isLoading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Utilisateur */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
};
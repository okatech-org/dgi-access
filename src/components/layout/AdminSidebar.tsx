import React from 'react';
import { Home, Users, Shield, Tag, Search, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, activeModule, onModuleChange }) => {
  const { user } = useAuth();

  const adminModules = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, color: 'text-blue-600', description: "Vue d'ensemble" },
    { id: 'personnel', label: 'Personnel', icon: Users, color: 'text-purple-600', description: 'Gestion du personnel' },
    { id: 'visitors', label: 'Visiteurs', icon: Users, color: 'text-blue-600', description: 'Enregistrements visiteurs' },
    { id: 'badges', label: 'Badges', icon: Tag, color: 'text-teal-600', description: 'Badges actifs' },
    { id: 'dgi-personnel', label: 'DGI Personnel', icon: Users, color: 'text-indigo-600', description: 'Personnel DGI Gabon' },
    { id: 'reports', label: 'Rapports', icon: Home, color: 'text-gray-600', description: 'Exports & synthèse' },
  ];

  const quickActions: { id: string; label: string; icon: any; action: () => void }[] = [];

  // Sections groupées
  const sidebarSections = [
    { title: 'Général', modules: ['dashboard'] },
    { title: 'Opérations', modules: ['personnel', 'visitors', 'badges'] },
    { title: 'DGI Gabon', modules: ['dgi-personnel'] },
    { title: 'Rapports', modules: ['reports'] },
  ];

  // Rechercher un module par son ID
  const getModuleByID = (id: string) => {
    return adminModules.find(module => module.id === id);
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 h-screen overflow-y-auto flex flex-col`}>
      {/* Header Admin */}
      <div className="p-4 border-b border-gray-200">
        {isOpen ? (
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin IMPOTS</h2>
            <p className="text-sm text-gray-600">Panneau d'administration</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        )}
      </div>

      {/* Navigation principale */}
      <div className="flex-1 p-4">
        {isOpen && (
          <div className="relative mx-1 mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        )}

        <div className="space-y-4">
          {sidebarSections.map((section, index) => (
            <div key={index} className="space-y-1">
              {isOpen && (
                <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 mb-2">
                  {section.title}
                </h3>
              )}
              
              <nav className="space-y-1">
                {section.modules.map(moduleId => {
                  const module = getModuleByID(moduleId);
                  if (!module) return null;
                  
                  const Icon = module.icon;
                  const isActive = activeModule === module.id;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => onModuleChange(module.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title={!isOpen ? module.label : ''}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : module.color} group-hover:scale-110 transition-transform`} />
                      {isOpen && (
                        <div className="flex-1 text-left min-w-0">
                          <span className="font-medium text-sm block truncate">{module.label}</span>
                          <p className="text-xs text-gray-500 mt-1 hidden lg:block leading-tight">
                            {module.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Indicateur d'activité */}
                      {isActive && !isOpen && (
                        <div className="absolute right-0 w-1 h-8 bg-blue-600 rounded-l"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions Rapides</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-700 text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Informations système en bas */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-900">IMPOTS Access Admin</div>
            <div className="text-xs text-blue-700">v2024.01.15</div>
            <div className="text-xs text-blue-600 mt-1">
              Utilisateur: {user?.firstName} {user?.lastName}
            </div>
            <div className="flex justify-center mt-2">
              <Clock className="h-3 w-3 text-blue-600 mr-1" />
              <div className="text-xs text-blue-700">
                Dernière synchro: {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
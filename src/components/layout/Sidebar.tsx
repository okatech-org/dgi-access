import React from 'react';
import { Home, Users, User, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';

interface SidebarProps {
  isOpen: boolean;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeModule, onModuleChange }) => {
  const { user } = useAuth();

  // Si c'est un admin, utiliser la sidebar admin
  if (user?.role === 'ADMIN') {
    return (
      <AdminSidebar 
        isOpen={isOpen}
        activeModule={activeModule}
        onModuleChange={onModuleChange}
      />
    );
  }

  

  const getMenuItems = () => {
    const baseItems = [{ id: 'dashboard', label: 'Tableau de bord', icon: Home, color: 'text-blue-600' }];
    
    // Items spécifiques aux rôles - seuls les rôles actifs sont conservés
    const roleItems: Record<string, { id: string; label: string; icon: any; color: string; description?: string }[]> = {
      ADMIN: [
        { id: 'personnel', label: 'Personnel', icon: Users, color: 'text-purple-600' },
        { id: 'visitors', label: 'Visiteurs', icon: Users, color: 'text-blue-600' },
        { id: 'badges', label: 'Badges', icon: Tag, color: 'text-teal-600' },
        { id: 'dgi-personnel', label: 'DGI Personnel', icon: Users, color: 'text-indigo-600' },
        { id: 'reports', label: 'Rapports', icon: Home, color: 'text-gray-600' },
      ],
      RECEPTION: [
        { id: 'personnel', label: 'Personnel', icon: Users, color: 'text-purple-600' },
        { id: 'visitors', label: 'Visiteurs', icon: Users, color: 'text-blue-600' },
        { id: 'badges', label: 'Badges', icon: Tag, color: 'text-teal-600' },
        { id: 'dgi-personnel', label: 'DGI Personnel', icon: Users, color: 'text-indigo-600' },
        { id: 'reports', label: 'Rapports', icon: Home, color: 'text-gray-600' },
      ],
    };

    // Ajouter l'option profil pour tous les utilisateurs
    const profileItem = { id: 'profile', label: 'Mon Profil', icon: User, color: 'text-indigo-600', description: 'Gestion du profil personnel' };

    return [...baseItems, ...(roleItems[user?.role as keyof typeof roleItems] || []), profileItem];
  };

  // Gestionnaire amélioré pour le changement de module avec navigation
  const handleModuleChange = (moduleId: string) => onModuleChange(moduleId);

  return (
    <div 
      data-component="sidebar"
      className={`${isOpen ? 'w-64' : 'w-16'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300 h-screen overflow-y-auto flex flex-col`}
    >
      <div className="p-3 md:p-4 flex-1">
        <nav className="space-y-0.5 md:space-y-1">
          <div className="flex items-center gap-2 w-full">
            <img 
              src="/logo IMPOTS.PNG" 
              alt="Logo DGI" 
              className="h-11 w-auto" 
            />
            <div className="flex-1 min-w-0 pl-1">
              <h2 className="text-sm font-bold text-gray-900 truncate">IMPOTS Access</h2>
            </div>
          </div>
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleModuleChange(item.id)}
                data-module-navigation={item.id}
                className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-3 md:py-3 rounded-lg transition-colors group relative min-h-[48px] ${
                  activeModule === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <Icon className={`h-5 w-5 ${item.color} ${activeModule === item.id ? 'text-blue-700' : ''} group-hover:scale-110 transition-transform flex-shrink-0`} />
                {isOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-medium text-sm md:text-base block truncate">{item.label}</span>
                    {item.description && user?.role === 'RECEPTION' && item.id !== 'profile' && (
                      <p className="text-xs text-gray-500 mt-1 hidden md:block leading-tight">{item.description}</p>
                    )}
                    {item.id === 'profile' && (
                      <p className="text-xs text-gray-500 mt-1 hidden md:block">Informations personnelles</p>
                    )}
                  </div>
                )}
                
                {/* Indicateur de profil */}
                {item.id === 'profile' && activeModule === item.id && (
                  <div className="absolute right-2 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                )}
              </button>
            );
          })}
          <div className="mx-auto">
            <img 
              src="/logo IMPOTS.PNG" 
              alt="Logo IMPOTS" 
              className="h-14 w-auto" 
            />
          </div>
        </nav>
      </div>

      {false && <div />}
    </div>
  );
};
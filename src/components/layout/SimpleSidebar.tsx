import React from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Badge, 
  BarChart3,
  Calendar,
  Package,
  ArrowRightLeft,
  UserCheck,
  ClipboardList,
  User,
  Home,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  adminOnly?: boolean;
  description?: string;
}

interface SimpleSidebarProps {
  isOpen: boolean;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  isOpen,
  activeModule,
  onModuleChange
}) => {
  const { user } = useAuth();
  
  const sidebarItems: SidebarItem[] = [
    { icon: Zap, label: 'Accueil Réception', path: 'reception', description: 'Accès rapide aux fonctions principales' },
    { icon: Home, label: 'Tableau de bord', path: 'dashboard', description: 'Vue d\'ensemble' },
    { icon: UserPlus, label: 'Gestion des Visiteurs', path: 'visitors', description: 'Enregistrement, historique & badges' },
    { icon: Calendar, label: 'Rendez-vous', path: 'appointments', description: 'Planification des visites' },
    { icon: Package, label: 'Courrier & Colis', path: 'packages', description: 'Réception et suivi' },
    { icon: Badge, label: 'Badges', path: 'badges', description: 'Création & révocation' },
    { icon: BarChart3, label: 'Statistiques', path: 'statistics', description: 'Métriques d\'accueil' },
    { icon: User, label: 'Mon Profil', path: 'profile', description: 'Informations personnelles' },
    { icon: Users, label: 'Personnel', path: 'personnel', description: 'Gestion du personnel', adminOnly: true },
    { icon: FileText, label: 'Rapports', path: 'reports', description: 'Rapports détaillés', adminOnly: true }
  ];

  const filteredItems = sidebarItems.filter(item => 
    !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className={`
      w-64 bg-white border-r border-gray-200 shadow-sm h-full flex flex-col
      ${isOpen ? 'block' : 'hidden lg:block'}
    `}>
      {/* Header avec logo */}
      <div className="flex-shrink-0 p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs sm:text-sm">DGI</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Access</h2>
            <p className="text-xs text-gray-500 truncate">Version simplifiée</p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 sm:px-4 pb-4 overflow-y-auto">
        <div className="space-y-1 sm:space-y-2">
          {filteredItems.map((item) => {
            const isActive = activeModule === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => onModuleChange(item.path)}
                className={`
                  w-full flex items-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 
                  rounded-lg text-left transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }
                `}
              >
                <Icon className={`
                  w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 transition-colors
                  ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                `} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${isActive ? 'text-blue-900' : ''}`}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div className={`
                      text-xs mt-0.5 truncate transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                    `}>
                      {item.description}
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer intégré dans le flux normal */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-medium text-gray-600">DGI Access</p>
          </div>
          <p className="text-xs text-gray-500">v2.0 · Simplifié</p>
          <p className="text-xs text-gray-400 mt-1">© 2024 ORGANEUS</p>
        </div>
      </div>
    </div>
  );
};

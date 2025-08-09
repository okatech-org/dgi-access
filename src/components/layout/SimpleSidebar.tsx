import React from 'react';
import { Users, UserPlus, FileText, Badge } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  adminOnly?: boolean;
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
    { icon: Users, label: 'Personnel', path: 'personnel', adminOnly: true },
    { icon: UserPlus, label: 'Visiteurs', path: 'visitors' },
    { icon: UserPlus, label: 'Réception', path: 'reception' },
    { icon: Badge, label: 'Badges', path: 'badges' },
    { icon: FileText, label: 'Rapports', path: 'reports', adminOnly: true }
  ];

  const filteredItems = sidebarItems.filter(item => 
    !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className={`
      w-64 bg-white border-r border-gray-200 shadow-sm h-full
      ${isOpen ? 'block' : 'hidden lg:block'}
    `}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DGI</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access</h2>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = activeModule === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => onModuleChange(item.path)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">Version simplifiée</p>
          <p className="text-xs text-gray-400">DGI Access v2.0</p>
        </div>
      </div>
    </div>
  );
};

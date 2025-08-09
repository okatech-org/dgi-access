import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './layout/Header';
import { SimpleSidebar } from './layout/SimpleSidebar';
import { SimpleMainContent } from './layout/SimpleMainContent';
import { useAuth } from '../contexts/AuthContext';

export const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    const prefix = user?.role === 'ADMIN' ? '/admin' : '/reception';
    
    if (path.startsWith(prefix)) {
      const module = path.slice(prefix.length + 1) || 'dashboard';
      setActiveModule(module);
    }
  }, [location.pathname, user?.role]);

  const handleNavigateToProfile = () => {
    handleModuleChange('profile');
  };

  const handleModuleChange = (module: string) => {
    const prefix = user?.role === 'ADMIN' ? '/admin' : '/reception';
    navigate(`${prefix}/${module}`);
    
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onMenuClick={handleMenuClick} 
        onNavigateToProfile={handleNavigateToProfile}
      />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Overlay pour mobile quand sidebar est ouverte */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar avec animation responsive */}
        <div className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex-shrink-0
        `}>
          <SimpleSidebar 
            isOpen={sidebarOpen || window.innerWidth >= 1024} 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          />
        </div>
        
        {/* Contenu principal responsive */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SimpleMainContent 
            activeModule={activeModule}
            sidebarOpen={sidebarOpen && window.innerWidth >= 1024}
          />
          
          {/* Footer optionnel seulement sur desktop et en bas du contenu */}
          <div className="hidden lg:block mt-auto border-t border-gray-100 bg-white">
            <div className="px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>DGI Access v2.0</span>
                  <span className="text-gray-300">|</span>
                  <span>Version Simplifiée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>© {new Date().getFullYear()} ORGANEUS Gabon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

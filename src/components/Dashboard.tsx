import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { MainContent } from './layout/MainContent';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Extraire le module actuel depuis l'URL
  useEffect(() => {
    const path = location.pathname;
    const prefix = user?.role === 'ADMIN' ? '/admin' : '/reception';
    
    if (path.startsWith(prefix)) {
      const module = path.slice(prefix.length + 1) || (user?.role === 'ADMIN' ? 'dashboard' : 'reception');
      setActiveModule(module);
    }
  }, [location.pathname, user?.role]);

  // Écouteur d'événements pour la navigation entre modules (rétrocompatibilité)
  useEffect(() => {
    const handleNavigateModule = (e: CustomEvent) => {
      const { module } = e.detail;
      console.log('🧭 Navigation vers module:', module);
      
      if (module) {
        handleModuleChange(module);
      }
    };
    
    window.addEventListener('navigate-module', handleNavigateModule as EventListener);
    
    // Écouter les événements de mise à jour forcée
    const handleForceUpdate = () => {
      setForceUpdate(prev => prev + 1);
      console.log('🔄 Dashboard rechargé');
    };
    
    window.addEventListener('force-update', handleForceUpdate);
    
    return () => {
      window.removeEventListener('navigate-module', handleNavigateModule as EventListener);
      window.removeEventListener('force-update', handleForceUpdate);
    };
  }, []);
  const handleNavigateToProfile = () => {
    console.log('🎯 Navigation vers profil...');
    handleModuleChange('profile');
  };

  const handleModuleChange = (module: string) => {
    console.log('🔄 Changement de module vers:', module);
    const prefix = user?.role === 'ADMIN' ? '/admin' : '/reception';
    navigate(`${prefix}/${module}`);
    
    // Fermer le sidebar sur mobile après sélection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col" 
      key={`dashboard-${forceUpdate}`}
      data-component="dashboard"
    >
      <Header 
        onMenuClick={handleMenuClick} 
        onNavigateToProfile={handleNavigateToProfile}
      />
      
      <div className="flex flex-1 relative">
        {/* Overlay pour mobile quand sidebar ouvert */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar avec positionnement mobile */}
        <div className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar 
            isOpen={sidebarOpen || window.innerWidth >= 1024} 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          />
        </div>
        
        {/* Contenu principal avec margin responsive */}
        <div className={`
          flex-1 transition-all duration-300 bg-gray-50 min-h-screen overflow-auto
          ${sidebarOpen && window.innerWidth >= 1024 ? 'lg:ml-0' : ''}
        `}>
          <MainContent 
            activeModule={activeModule}
            sidebarOpen={sidebarOpen && window.innerWidth >= 1024}
          />
        </div>
      </div>
      {/* Footer */}
      <div className="mt-auto text-center text-xs text-gray-500 py-3 border-t border-gray-200">
        <p>Développé et conçu par ORGANEUS Gabon | © {new Date().getFullYear()} Tous droits réservés</p>
      </div>
    </div>
  );
};
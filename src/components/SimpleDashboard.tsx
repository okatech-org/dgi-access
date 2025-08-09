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
      
      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <SimpleSidebar 
            isOpen={sidebarOpen || window.innerWidth >= 1024} 
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
          />
        </div>
        
        <SimpleMainContent 
          activeModule={activeModule}
          sidebarOpen={sidebarOpen && window.innerWidth >= 1024}
        />
      </div>
      
      <div className="mt-auto text-center text-xs text-gray-500 py-3 border-t border-gray-200">
        <p>DGI Access - Version Simplifiée | © {new Date().getFullYear()} ORGANEUS Gabon</p>
      </div>
    </div>
  );
};

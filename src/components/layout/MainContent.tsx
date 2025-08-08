import React, { useState, useEffect } from 'react';
import { DashboardHome } from '../modules/DashboardHome';
import { PersonnelModule } from '../modules/PersonnelModule';
import { VisitorModule } from '../modules/VisitorModule';
import { BadgeModule } from '../modules/BadgeModule';
import { ReportsModule } from '../modules/ReportsModule';
import { DGIModule } from '../modules/DGIModule';
import { UserProfile } from '../UserProfile';
import { AdminDashboardModule } from '../modules/AdminDashboardModule';
import { useAuth } from '../../contexts/AuthContext';

// Ajout d'un compteur pour forcer le rechargement des composants
let componentCounter = 0;

interface MainContentProps {
  activeModule: string;
  sidebarOpen: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({ activeModule, sidebarOpen }) => {
  console.log('🎯 MainContent - Module actif:', activeModule);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { user } = useAuth();

  const allowedByRole: Record<'ADMIN' | 'RECEPTION', string[]> = {
    ADMIN: ['dashboard', 'personnel', 'visitors', 'badges', 'reports', 'dgi-personnel', 'profile'],
    RECEPTION: ['dashboard', 'personnel', 'visitors', 'badges', 'reports', 'dgi-personnel', 'profile']
  };

  const effectiveModule = (() => {
    const role = (user?.role || 'RECEPTION') as 'ADMIN' | 'RECEPTION';
    const allowed = allowedByRole[role];
    return allowed.includes(activeModule) ? activeModule : 'dashboard';
  })();

  // Écouteur d'événements pour forcer le rechargement du composant
  useEffect(() => {
    const handleForceUpdate = () => {
      componentCounter++;
      setForceUpdate(componentCounter);
      console.log('🔄 MainContent rechargé, module actif:', activeModule);
    };
    
    window.addEventListener('force-update', handleForceUpdate);
    window.addEventListener('navigate-module', handleForceUpdate);
    
    return () => {
      window.removeEventListener('force-update', handleForceUpdate);
      window.removeEventListener('navigate-module', handleForceUpdate);
    };
  }, [activeModule]);
  
  const renderModule = () => {
    switch (effectiveModule) {
      case 'dashboard':
        return user?.role === 'ADMIN' ? <AdminDashboardModule /> : <DashboardHome />;
      case 'personnel':
        return <PersonnelModule />;
      case 'visitors':
        return <VisitorModule />;
      case 'badges':
        return <BadgeModule />;
      case 'reports':
        return <ReportsModule />;
      case 'dgi-personnel':
        return <DGIModule />;
      case 'profile':
        console.log('🔄 Chargement UserProfile...');
        return <UserProfile key={Date.now()} />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <main 
      className="flex-1 transition-all duration-300 bg-gray-50 min-h-screen overflow-auto" 
      data-component="main-content"
      data-active-module={activeModule}
      key={`main-${activeModule}-${forceUpdate}`}
    >
      {renderModule()}
    </main>
  );
};
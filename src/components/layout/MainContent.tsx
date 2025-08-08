import React, { useState, useEffect } from 'react';
import { DashboardHome } from '../modules/DashboardHome';
import { DocumentationModule } from '../modules/DocumentationModule';
import { ImmigrationModule } from '../modules/ImmigrationModule';
import { StatisticsModule } from '../modules/StatisticsModule';
import { UsersModule } from '../modules/UsersModule';
import { AuditModule } from '../modules/AuditModule';
import { ReceptionModule } from '../modules/ReceptionModule';
import { AppointmentsModule } from '../modules/AppointmentsModule';
import { PackagesModule } from '../modules/PackagesModule';
import { VisitorStatsModule } from '../modules/VisitorStatsModule';
import { ImageManagementModule } from '../modules/ImageManagementModule';
import { LogoManagementModule } from '../modules/LogoManagementModule';
import { BadgeManagementModule } from '../modules/BadgeManagementModule';
import { VisitorManagementModule } from '../modules/VisitorManagementModule';
import { StaffManagementModule } from '../modules/StaffManagementModule';
import { UserProfile } from '../UserProfile';
import { SystemSettingsModule } from '../modules/SystemSettingsModule';
import { NotificationsModule } from '../modules/NotificationsModule';
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

  const allowedByRole: Record<'ADMIN' | 'RECEP', string[]> = {
    ADMIN: [
      'dashboard','users','reception','visitors','appointments','packages','badges','visitor-stats','audit','system-settings','notifications','profile'
    ],
    RECEP: [
      'dashboard','reception','visitors','appointments','packages','badges','visitor-stats','profile'
    ]
  };

  const effectiveModule = (() => {
    const role = (user?.role || 'RECEP') as 'ADMIN' | 'RECEP';
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
      case 'documentation':
        return <DocumentationModule />;
      case 'immigration':
        return <ImmigrationModule />;
      case 'statistics':
        return <StatisticsModule />;
      case 'users':
        return <UsersModule />;
      case 'audit':
        return <AuditModule />;
      case 'reception':
        return <ReceptionModule />;
      case 'appointments':
        return <AppointmentsModule />;
      case 'packages':
        return <PackagesModule />;
      case 'visitor-stats':
        return <VisitorStatsModule />;
      case 'badges':
        return <BadgeManagementModule />;
      case 'visitors':
        return <VisitorManagementModule />;
      case 'staff':
        return <StaffManagementModule />;
      case 'image-management':
        return <ImageManagementModule />;
      case 'logo-management':
        return <LogoManagementModule />;
      case 'system-settings':
        return <SystemSettingsModule />;
      case 'notifications':
        return <NotificationsModule />;
      case 'profile':
        console.log('🔄 Chargement UserProfile...');
        return <UserProfile key={Date.now()} />;
      default:
        return user?.role === 'ADMIN' ? <AdminDashboardModule /> : <DashboardHome />;
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
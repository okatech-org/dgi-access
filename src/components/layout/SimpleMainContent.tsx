import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PersonnelModule } from '../modules/PersonnelModule';
import { VisitorModuleSimple } from '../modules/VisitorModuleSimple';
import { ReportsModule } from '../modules/ReportsModule';
import { BadgeManagementModule } from '../modules/BadgeManagementModule';
import { useAuth } from '../../contexts/AuthContext';

interface SimpleMainContentProps {
  activeModule: string;
  sidebarOpen: boolean;
}

const SimpleHome: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue dans DGI Access
          </h1>
          <p className="text-gray-600">
            Système simplifié de gestion des visiteurs et du personnel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === 'ADMIN' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">👥</span>
                </div>
                <h3 className="text-lg font-bold text-blue-900 ml-4">Personnel</h3>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                Gérez les employés par service et suivez leur activité
              </p>
              <div className="text-xs text-blue-600">
                ✓ Ajout/modification d'employés<br/>
                ✓ Organisation par service<br/>
                ✓ Export des données
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎫</span>
              </div>
              <h3 className="text-lg font-bold text-green-900 ml-4">Visiteurs</h3>
            </div>
            <p className="text-green-700 text-sm mb-4">
              Enregistrez les visiteurs avec traçabilité complète
            </p>
            <div className="text-xs text-green-600">
              ✓ Recherche d'employés<br/>
              ✓ Impression de badges<br/>
              ✓ Suivi en temps réel
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <h3 className="text-lg font-bold text-purple-900 ml-4">Rapports</h3>
            </div>
            <p className="text-purple-700 text-sm mb-4">
              Consultez les statistiques et exportez les données
            </p>
            <div className="text-xs text-purple-600">
              ✓ Rapports quotidiens<br/>
              ✓ Statistiques par service<br/>
              ✓ Export CSV
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Guide d'utilisation rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pour enregistrer un visiteur :</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Allez dans la section "Visiteurs"</li>
                <li>Remplissez les informations du visiteur</li>
                <li>Recherchez l'employé à visiter</li>
                <li>Sélectionnez le motif de visite</li>
                <li>Validez pour imprimer le badge</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pour gérer le personnel :</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Accédez au module "Personnel"</li>
                <li>Ajoutez ou modifiez les employés</li>
                <li>Organisez par service</li>
                <li>Exportez les listes si nécessaire</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SimpleMainContent: React.FC<SimpleMainContentProps> = ({
  activeModule,
  sidebarOpen
}) => {
  const { user } = useAuth();

  return (
    <main className={`
      flex-1 bg-gray-50 min-h-screen overflow-auto transition-all duration-300
      ${sidebarOpen ? 'lg:ml-0' : ''}
    `}>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        
        {user?.role === 'ADMIN' && (
          <Route path="/personnel" element={<PersonnelModule />} />
        )}
        
        <Route path="/visitors" element={<VisitorModuleSimple />} />
        <Route path="/badges" element={<BadgeManagementModule />} />
        
        {user?.role === 'ADMIN' && (
          <Route path="/reports" element={<ReportsModule />} />
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

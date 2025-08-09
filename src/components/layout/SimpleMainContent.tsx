import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PersonnelModule } from '../modules/PersonnelModule';
import { PersonnelManagementModule } from '../modules/PersonnelManagementModule';
import { VisitorModuleSimple } from '../modules/VisitorModuleSimple';
import { ReportsModule } from '../modules/ReportsModule';
import { BadgeManagementModule } from '../modules/BadgeManagementModule';
import { ReceptionHome } from '../ReceptionHome';

import { VisitorWorkflow } from '../workflow/VisitorWorkflow';
import { PackageWorkflow } from '../workflow/PackageWorkflow';
import { AppointmentsModule } from '../modules/AppointmentsModule';
import { PackagesModule } from '../modules/PackagesModule';
import { StatisticsModule } from '../modules/StatisticsModule';
import { ProfileModule } from '../modules/ProfileModule';
import { DashboardModule } from '../modules/DashboardModule';
import { useAuth } from '../../contexts/AuthContext';

interface SimpleMainContentProps {
  activeModule: string;
  sidebarOpen: boolean;
}

const SimpleHome: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header responsive */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg mb-4">
              <span className="text-white font-bold text-xl">DGI</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Bienvenue dans DGI Access
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Système simplifié de gestion des visiteurs et du personnel pour la Direction Générale des Impôts
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            Version Simplifiée v2.0
          </div>
        </div>

        {/* Grille de modules responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {user?.role === 'ADMIN' && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg sm:text-xl">👥</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-blue-900 ml-3 sm:ml-4">Personnel</h3>
              </div>
              <p className="text-blue-700 text-xs sm:text-sm mb-3 sm:mb-4">
                Gérez les employés par service et suivez leur activité
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <div>✓ Ajout/modification d'employés</div>
                <div>✓ Organisation par service</div>
                <div>✓ Export des données</div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg sm:text-xl">🎫</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-green-900 ml-3 sm:ml-4">Visiteurs</h3>
            </div>
            <p className="text-green-700 text-xs sm:text-sm mb-3 sm:mb-4">
              Enregistrement visiteurs avec workflow guidé
            </p>
            <div className="text-xs text-green-600 space-y-1">
              <div>✓ Processus en 5 étapes</div>
              <div>✓ Extraction IA documents</div>
              <div>✓ Attribution badges</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg sm:text-xl">📦</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-orange-900 ml-3 sm:ml-4">Colis</h3>
            </div>
            <p className="text-orange-700 text-xs sm:text-sm mb-3 sm:mb-4">
              Gestion des colis et courriers entrants
            </p>
            <div className="text-xs text-orange-600 space-y-1">
              <div>✓ Documentation photo</div>
              <div>✓ Notifications automatiques</div>
              <div>✓ Traçabilité complète</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg sm:text-xl">📊</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-purple-900 ml-3 sm:ml-4">Rapports</h3>
            </div>
            <p className="text-purple-700 text-xs sm:text-sm mb-3 sm:mb-4">
              Consultez les statistiques et exportez les données
            </p>
            <div className="text-xs text-purple-600 space-y-1">
              <div>✓ Rapports quotidiens</div>
              <div>✓ Statistiques par service</div>
              <div>✓ Export CSV</div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl mr-2">🚀</span>
            Actions Rapides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <a 
              href="/visitor-workflow"
              className="flex items-center p-3 sm:p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                <span className="text-blue-600 text-lg sm:text-xl">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Nouveau Visiteur</h4>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Processus complet en 5 étapes avec IA</p>
              </div>
            </a>
            
            <a 
              href="/package-workflow"
              className="flex items-center p-3 sm:p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                <span className="text-orange-600 text-lg sm:text-xl">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Nouveau Colis</h4>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Enregistrement colis/courrier avec photo</p>
              </div>
            </a>
          </div>
        </div>

        {/* Guide d'utilisation responsive */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl mr-2">📚</span>
            Guide d'utilisation rapide
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg p-4 sm:p-5">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                Enregistrer un visiteur
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-gray-600">
                <li>Allez dans la section "Visiteurs"</li>
                <li>Remplissez les informations du visiteur</li>
                <li>Recherchez l'employé à visiter</li>
                <li>Sélectionnez le motif de visite</li>
                <li>Validez pour imprimer le badge</li>
              </ol>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-5">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                Gérer le personnel
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-gray-600">
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
    <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      {/* Container avec scroll pour le contenu */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <Routes>
            <Route path="/" element={<SimpleHome />} />
            
            {user?.role === 'ADMIN' && (
              <Route path="/personnel" element={<PersonnelManagementModule />} />
            )}
            
            <Route path="/visitors" element={<VisitorModuleSimple />} />
            {/* Page d'accueil spécifique pour les réceptionnistes avec accès direct aux fonctions principales */}
            <Route path="/reception" element={<ReceptionHome />} />
            <Route path="/badges" element={<BadgeManagementModule />} />
            <Route path="/appointments" element={<AppointmentsModule />} />
            <Route path="/packages" element={<PackagesModule />} />
            <Route path="/statistics" element={<StatisticsModule />} />
            <Route path="/profile" element={<ProfileModule />} />
            <Route path="/dashboard" element={<DashboardModule />} />
            
            {/* Nouveaux workflows */}
            <Route path="/visitor-workflow" element={
              <VisitorWorkflow 
                onComplete={(result) => {
                  console.log('Visiteur enregistré:', result);
                  alert(`✅ Visiteur enregistré avec succès !\nN° d'enregistrement: ${result.registrationNumber}`);
                }}
              />
            } />
            
            <Route path="/package-workflow" element={
              <PackageWorkflow 
                onComplete={(result) => {
                  console.log('Colis enregistré:', result);
                  alert(`✅ Colis enregistré avec succès !\nN° d'enregistrement: ${result.registrationNumber}`);
                }}
              />
            } />
            
            {user?.role === 'ADMIN' && (
              <Route path="/reports" element={<ReportsModule />} />
            )}
            
            <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/reception/dashboard'} replace />} />
          </Routes>
        </div>
      </div>
    </main>
  );
};

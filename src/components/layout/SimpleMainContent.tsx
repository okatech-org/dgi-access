import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PersonnelModule } from '../modules/PersonnelModule';
import { PersonnelManagementModule } from '../modules/PersonnelManagementModule';
import { VisitorModuleSimple } from '../modules/VisitorModuleSimple';
import { ReportsModule } from '../modules/ReportsModule';
import { BadgeManagementModule } from '../modules/BadgeManagementModule';
import { ReceptionVisitorForm } from '../modules/ReceptionVisitorForm';
import { AdminReceptionForm } from '../modules/AdminReceptionForm';
import { VisitorWorkflow } from '../workflow/VisitorWorkflow';
import { PackageWorkflow } from '../workflow/PackageWorkflow';
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Enregistrement visiteurs avec workflow guidé
            </p>
            <div className="text-xs text-green-600">
              ✓ Processus en 5 étapes<br/>
              ✓ Extraction IA documents<br/>
              ✓ Attribution badges
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📦</span>
              </div>
              <h3 className="text-lg font-bold text-orange-900 ml-4">Colis</h3>
            </div>
            <p className="text-orange-700 text-sm mb-4">
              Gestion des colis et courriers entrants
            </p>
            <div className="text-xs text-orange-600">
              ✓ Documentation photo<br/>
              ✓ Notifications automatiques<br/>
              ✓ Traçabilité complète
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

        {/* Accès rapide aux nouveaux workflows */}
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Processus Guidés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/visitor-workflow"
              className="flex items-center p-4 border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200">
                <span className="text-blue-600 text-xl">👤</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Nouveau Visiteur</h4>
                <p className="text-sm text-gray-600">Processus complet en 5 étapes avec IA</p>
              </div>
            </a>
            
            <a 
              href="/package-workflow"
              className="flex items-center p-4 border border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200">
                <span className="text-orange-600 text-xl">📦</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Nouveau Colis</h4>
                <p className="text-sm text-gray-600">Enregistrement colis/courrier avec photo</p>
              </div>
            </a>
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
          <Route path="/personnel" element={<PersonnelManagementModule />} />
        )}
        
        <Route path="/visitors" element={<VisitorModuleSimple />} />
        <Route path="/reception" element={
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {(() => {
                console.log('🔍 Route /reception - Rôle utilisateur:', user?.role);
                console.log('🔍 Condition ADMIN:', user?.role === 'ADMIN');
                return user?.role === 'ADMIN' ? (
                  <>
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <p className="text-green-800 text-sm">
                        ✅ Mode ADMIN détecté - Formulaire administrateur avec grilles DGI
                      </p>
                    </div>
                    <AdminReceptionForm onSubmit={(visitorData) => {
                      console.log('Visiteur enregistré par admin:', visitorData);
                      alert('✅ Visiteur enregistré avec succès ! Badge prêt pour impression.');
                    }} />
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        ✅ Mode RÉCEPTION détecté - Formulaire réception standard
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
                      <h1 className="text-2xl font-bold">Module Réception DGI</h1>
                      <p className="text-blue-100 mt-1">
                        Enregistrement visiteurs avec traçabilité personnel DGI
                      </p>
                    </div>
                    <ReceptionVisitorForm onSubmit={(visitorData) => {
                      console.log('Visiteur enregistré:', visitorData);
                      alert('✅ Visiteur enregistré avec succès ! Badge prêt pour impression.');
                    }} />
                  </>
                );
              })()}
            </div>
          </div>
        } />
        <Route path="/badges" element={<BadgeManagementModule />} />
        
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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

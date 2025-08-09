import React from 'react';
import { Users, Building, Calendar, Shield, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboardModule: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Administrateur
        </h1>
        <p className="text-gray-600">
          Bienvenue {user?.name} - Vue d'ensemble administrative
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Personnel</p>
              <p className="text-3xl font-bold">8</p>
              <p className="text-blue-100 text-xs">+2 ce mois</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Services Actifs</p>
              <p className="text-3xl font-bold">6</p>
              <p className="text-green-100 text-xs">Tous opérationnels</p>
            </div>
            <Building className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Visites ce mois</p>
              <p className="text-3xl font-bold">45</p>
              <p className="text-purple-100 text-xs">+12% vs dernier mois</p>
            </div>
            <Calendar className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Sécurité</p>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-orange-100 text-xs">Excellent niveau</p>
            </div>
            <Shield className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Activité du Système
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nouvelle connexion administrateur
                </p>
                <p className="text-xs text-gray-600">
                  {user?.name} - Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Personnel DGI synchronisé
                </p>
                <p className="text-xs text-gray-600">8 agents - Il y a 2h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Visite planifiée - Eric BOUMAH
                </p>
                <p className="text-xs text-gray-600">Direction Générale - Il y a 3h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Organigramme mis à jour
                </p>
                <p className="text-xs text-gray-600">Structure DGI - Il y a 5h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="space-y-6">
          {/* Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temps de réponse</span>
                <span className="text-sm font-medium text-green-600">&lt; 100ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponibilité</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Erreurs</span>
                <span className="text-sm font-medium text-green-600">0</span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions Rapides
            </h3>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left">
                Ajouter Personnel
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-left">
                Planifier Visite
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-left">
                Générer Rapport
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-left">
                Gérer Services
              </button>
            </div>
          </div>

          {/* État du système */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              État du Système
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Base de données</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Authentification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Stockage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">API DGI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Users, Plus, Clock, CheckCircle, UserX } from 'lucide-react';
import { VisitorWorkflow } from '../workflow/VisitorWorkflow';
import { VisitorRegistrationData } from '../../types/visitor-process';
import { visitorPackageService } from '../../services/visitor-package-service';

interface VisitorSummary {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  badgeNumber?: string;
  checkInTime: Date;
  status: 'active' | 'completed';
  destination: string;
}

const TodayVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<VisitorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayVisitors();
  }, []);

  const loadTodayVisitors = async () => {
    try {
      setLoading(true);
      const todayVisitors = await visitorPackageService.getVisitorsByDate(new Date());
      
      const summaries: VisitorSummary[] = todayVisitors.map(v => ({
        id: v.id,
        firstName: v.identity?.firstName || '',
        lastName: v.identity?.lastName || '',
        company: v.identity?.company,
        badgeNumber: v.badge?.badgeNumber,
        checkInTime: v.metadata?.checkInTime || new Date(),
        status: v.metadata?.status || 'active',
        destination: getDestinationSummary(v)
      }));
      
      setVisitors(summaries);
    } catch (error) {
      console.error('Erreur lors du chargement des visiteurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDestinationSummary = (visitor: any): string => {
    if (visitor.destination?.employee) {
      return `${visitor.destination.employee.firstName} ${visitor.destination.employee.lastName}`;
    } else if (visitor.destination?.service) {
      return visitor.destination.service.name;
    }
    return 'Non défini';
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      await visitorPackageService.checkOutVisitor(visitorId);
      await loadTodayVisitors(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la sortie:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement des visiteurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Visiteurs du jour ({visitors.length})
        </h3>
        <button
          onClick={loadTodayVisitors}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Actualiser
        </button>
      </div>
      
      <div className="space-y-3">
        {visitors.map((visitor) => (
          <div key={visitor.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {visitor.firstName} {visitor.lastName}
                  </span>
                  {visitor.status === 'active' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Présent
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Sorti
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mt-1">
                  {visitor.company && <span>{visitor.company} • </span>}
                  {visitor.badgeNumber && <span>Badge {visitor.badgeNumber} • </span>}
                  Entrée: {visitor.checkInTime.toLocaleTimeString('fr-FR')}
                </div>
                
                <div className="text-sm text-gray-500">
                  Destination: {visitor.destination}
                </div>
              </div>
              
              {visitor.status === 'active' && (
                <button
                  onClick={() => handleCheckOut(visitor.id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Sortie
                </button>
              )}
            </div>
          </div>
        ))}
        
        {visitors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun visiteur enregistré aujourd'hui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const VisitorModule: React.FC = () => {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVisitorRegistered = async (data: VisitorRegistrationData) => {
    try {
      const visitorId = await visitorPackageService.registerVisitor(data);
      console.log('Visiteur enregistré avec succès:', visitorId);
      
      // Fermer le workflow et actualiser
      setShowWorkflow(false);
      setRefreshKey(prev => prev + 1);
      
      // Afficher un message de succès
      alert(`Visiteur enregistré avec succès!\nN° d'enregistrement: ${data.metadata?.registrationNumber}`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du visiteur');
    }
  };

  const handleWorkflowCancel = () => {
    setShowWorkflow(false);
  };

  if (showWorkflow) {
    return (
      <div className="max-w-full">
        <VisitorWorkflow
          onComplete={handleVisitorRegistered}
          onCancel={handleWorkflowCancel}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestion des Visiteurs</h2>
            <p className="text-gray-600 mt-1">
              Enregistrement et suivi des visiteurs de la DGI
            </p>
          </div>
          <button
            onClick={() => setShowWorkflow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau visiteur
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Présents</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total du jour</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Durée moyenne</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des visiteurs */}
      <TodayVisitors key={refreshKey} />
    </div>
  );
};



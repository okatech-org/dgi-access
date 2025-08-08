import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Download, User, MapPin, Phone, Mail, ChevronDown, GitBranch } from 'lucide-react';
import { Personnel, FiltresPersonnel, SelectionPersonnel } from '../../types/dgi-personnel';
import { dgiService } from '../../services/dgi-hybrid';
import { PlanificateurVisites } from './PlanificateurVisites';
import { OrganigrammeDGI } from './OrganigrammeDGI';

export const PersonnelDGI: React.FC = () => {
  const [filtres, setFiltres] = useState<FiltresPersonnel>({});
  const [personnelSelectionne, setPersonnelSelectionne] = useState<string[]>([]);
  const [afficherPlanificateur, setAfficherPlanificateur] = useState(false);
  const [ongletActuel, setOngletActuel] = useState<'liste' | 'organigramme'>('liste');
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [personnelData, servicesData, statsData] = await Promise.all([
          dgiService.filtrerPersonnel(filtres),
          dgiService.getServices(),
          dgiService.getStatistiquesPersonnel()
        ]);
        setPersonnel(personnelData);
        setServices(servicesData);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur chargement données DGI:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filtres]);

  const handleSelectionChange = (personnelId: string, selected: boolean) => {
    setPersonnelSelectionne(prev => 
      selected 
        ? [...prev, personnelId]
        : prev.filter(id => id !== personnelId)
    );
  };

  const handleSelectionTous = (selected: boolean) => {
    setPersonnelSelectionne(selected ? personnel.map(p => p.id) : []);
  };

  const handlePlanifierVisites = () => {
    if (personnelSelectionne.length > 0) {
      const selection: SelectionPersonnel = {
        personnel_ids: personnelSelectionne,
        date_selection: new Date()
      };
      dgiService.sauvegarderSelection(selection);
      setAfficherPlanificateur(true);
    }
  };

  const exporterSelection = () => {
    const personnelExport = personnel.filter(p => personnelSelectionne.includes(p.id));
    const csv = [
      'Nom,Prénom,Fonction,Service,Statut,Contact',
      ...personnelExport.map(p => 
        `${p.nom},${p.prenom},${p.fonction},${p.service},${p.statut},${p.contact?.telephone || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personnel_dgi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getNiveauLibelle = (niveau: number): string => {
    switch (niveau) {
      case 1: return 'DG';
      case 2: return 'DGA';
      case 3: return 'Directeur';
      case 4: return 'Cadre';
      default: return 'Agent';
    }
  };

  const getStatutCouleur = (statut: string): string => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50';
      case 'en_mission': return 'text-blue-600 bg-blue-50';
      case 'absent': return 'text-orange-600 bg-orange-50';
      case 'suspendu': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (afficherPlanificateur) {
    return (
      <PlanificateurVisites 
        personnelSelectionne={personnel.filter(p => personnelSelectionne.includes(p.id))}
        onRetour={() => setAfficherPlanificateur(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Direction Générale des Impôts - Gestion Personnel
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {stats.total_personnel} agents</span>
            <span>•</span>
            <span>Actifs: {stats.par_statut.actif || 0}</span>
            <span>•</span>
            <span>Services: {stats.total_services}</span>
          </div>
          
          {/* Onglets */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setOngletActuel('liste')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                ongletActuel === 'liste' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              Liste Personnel
            </button>
            <button
              onClick={() => setOngletActuel('organigramme')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                ongletActuel === 'organigramme' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Organigramme
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des données DGI...</span>
        </div>
      )}

      {/* Contenu selon l'onglet */}
      {!loading && ongletActuel === 'organigramme' ? (
        <OrganigrammeDGI />
      ) : !loading ? (
        <div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, fonction, service..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filtres.recherche || ''}
              onChange={(e) => setFiltres({...filtres, recherche: e.target.value})}
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filtres.service || ''}
              onChange={(e) => setFiltres({...filtres, service: e.target.value || undefined})}
            >
              <option value="">Tous les services</option>
              {services.map(s => (
                <option key={s.id} value={s.nom}>{s.sigle || s.nom}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filtres.statut || ''}
              onChange={(e) => setFiltres({...filtres, statut: e.target.value || undefined})}
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="en_mission">En mission</option>
              <option value="absent">Absent</option>
              <option value="suspendu">Suspendu</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filtres.niveau_hierarchique || ''}
              onChange={(e) => setFiltres({...filtres, niveau_hierarchique: e.target.value ? parseInt(e.target.value) : undefined})}
            >
              <option value="">Tous les niveaux</option>
              <option value="1">Direction Générale</option>
              <option value="2">Direction Générale Adjointe</option>
              <option value="3">Directions</option>
              <option value="4">Cadres</option>
            </select>
          </div>
        </div>

        {/* Personnel sélectionné */}
        {personnelSelectionne.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Personnel sélectionné pour visite: {personnelSelectionne.length}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePlanifierVisites}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Planifier les visites
                </button>
                <button
                  onClick={exporterSelection}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter sélection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions en lot */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={personnelSelectionne.length === personnel.length && personnel.length > 0}
            onChange={(e) => handleSelectionTous(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">
            Sélectionner tout ({personnel.length})
          </span>
        </div>
        
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          + Nouvelle visite
        </button>
      </div>

      {/* Liste du personnel */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="divide-y divide-gray-200">
          {personnel.map((person) => (
            <div key={person.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={personnelSelectionne.includes(person.id)}
                  onChange={(e) => handleSelectionChange(person.id, e.target.checked)}
                  className="rounded"
                />

                {/* Photo/Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>

                {/* Informations principales */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {person.prenom} {person.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{person.fonction}</p>
                    {person.grade && (
                      <p className="text-xs text-gray-500">{person.grade}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">{getNiveauLibelle(person.niveau_hierarchique)}</p>
                    <p className="text-sm text-gray-600">{person.service}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatutCouleur(person.statut)}`}>
                      {person.statut}
                    </span>
                    {person.contact?.bureau && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {person.contact.bureau}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {person.contact?.telephone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>📞</span>
                        </div>
                      )}
                      {person.contact?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>📧</span>
                        </div>
                      )}
                    </div>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Fiche
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {personnel.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun personnel trouvé avec ces critères</p>
        </div>
      )}
        </div>
      ) : null}
    </div>
  );
};



// Helper function pour éviter la duplication
const getNiveauLibelle = (niveau: number): string => {
  switch (niveau) {
    case 1: return 'DG';
    case 2: return 'DGA';
    case 3: return 'Directeur';
    case 4: return 'Cadre';
    default: return 'Agent';
  }
};

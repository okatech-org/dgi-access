import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, User, Users, MapPin, Phone, Mail, Eye, Calendar } from 'lucide-react';
import { Personnel, ServiceDGI } from '../../types/dgi-personnel';
import { dgiService } from '../../services/dgi-hybrid';

interface OrganigrammeNode {
  personnel?: Personnel;
  service?: ServiceDGI;
  children: OrganigrammeNode[];
  level: number;
}

export const OrganigrammeDGI: React.FC = () => {
  const [noeudsExpandes, setNoeudsExpandes] = useState<Set<string>>(new Set(['dgi']));
  const [personnelSelectionne, setPersonnelSelectionne] = useState<Personnel | null>(null);
  const [modeSelection, setModeSelection] = useState(false);
  const [personnelSelectionnePourVisite, setPersonnelSelectionnePourVisite] = useState<string[]>([]);

  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [services, setServices] = useState<ServiceDGI[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [personnelData, servicesData] = await Promise.all([
          dgiService.getPersonnel(),
          dgiService.getServices()
        ]);
        setPersonnel(personnelData);
        setServices(servicesData);
      } catch (error) {
        console.error('Erreur chargement données organigramme:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Construire l'arbre hiérarchique
  const organigramme = useMemo((): OrganigrammeNode | null => {
    if (services.length === 0 || personnel.length === 0) return null;
    
    const servicePrincipal = services.find(s => s.id === 'dgi');
    if (!servicePrincipal) return null;
    
    const construireArbre = (service: ServiceDGI, niveau: number = 0): OrganigrammeNode => {
      const responsable = service.responsable_id ? 
        personnel.find(p => p.id === service.responsable_id) : 
        undefined;

      const servicesEnfants = services.filter(s => s.parent_id === service.id);
      const personnelService = personnel.filter(p => p.service === service.nom);

      const enfants: OrganigrammeNode[] = [];

      // Ajouter le responsable en premier si il existe
      if (responsable) {
        enfants.push({
          personnel: responsable,
          children: [],
          level: niveau + 1
        });
      }

      // Ajouter les sous-services
      servicesEnfants.forEach(sousService => {
        enfants.push(construireArbre(sousService, niveau + 1));
      });

      // Ajouter le personnel du service (sauf le responsable)
      personnelService
        .filter(p => p.id !== responsable?.id)
        .forEach(person => {
          enfants.push({
            personnel: person,
            children: [],
            level: niveau + 1
          });
        });

      return {
        service,
        children: enfants,
        level: niveau
      };
    };

    return construireArbre(servicePrincipal);
  }, [personnel, services]);

  const toggleExpansion = (id: string) => {
    const nouveauxExpandes = new Set(noeudsExpandes);
    if (nouveauxExpandes.has(id)) {
      nouveauxExpandes.delete(id);
    } else {
      nouveauxExpandes.add(id);
    }
    setNoeudsExpandes(nouveauxExpandes);
  };

  const selectionnerPersonnelPourVisite = (personnelId: string) => {
    if (!modeSelection) return;
    
    setPersonnelSelectionnePourVisite(prev => 
      prev.includes(personnelId) 
        ? prev.filter(id => id !== personnelId)
        : [...prev, personnelId]
    );
  };

  const getIndicateurStatut = (statut: string) => {
    switch (statut) {
      case 'actif': return { color: 'bg-green-400', text: 'Présent' };
      case 'en_mission': return { color: 'bg-blue-400', text: 'En mission' };
      case 'absent': return { color: 'bg-orange-400', text: 'Absent' };
      case 'suspendu': return { color: 'bg-red-400', text: 'Suspendu' };
      default: return { color: 'bg-gray-400', text: 'Inconnu' };
    }
  };

  const RenduNoeud: React.FC<{ noeud: OrganigrammeNode }> = ({ noeud }) => {
    const estExpande = noeud.service ? noeudsExpandes.has(noeud.service.id) : false;
    const aDesEnfants = noeud.children.length > 0;
    const indicateurStatut = noeud.personnel ? getIndicateurStatut(noeud.personnel.statut) : null;
    const estSelectionne = noeud.personnel ? personnelSelectionnePourVisite.includes(noeud.personnel.id) : false;

    return (
      <div className={`ml-${Math.min(noeud.level * 4, 16)}`}>
        {/* Service */}
        {noeud.service && (
          <div className="mb-2">
            <div 
              className={`flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                noeud.level === 0 ? 'border-blue-500 bg-blue-50' : 
                noeud.level === 1 ? 'border-purple-300 bg-purple-50' :
                'border-gray-300'
              }`}
              onClick={() => aDesEnfants && toggleExpansion(noeud.service!.id)}
            >
              {aDesEnfants && (
                estExpande ? 
                  <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                  <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Users className={`h-5 w-5 ${
                    noeud.level === 0 ? 'text-blue-600' :
                    noeud.level === 1 ? 'text-purple-600' :
                    'text-gray-600'
                  }`} />
                  <span className="font-semibold text-gray-900">
                    {noeud.service.sigle || noeud.service.nom}
                  </span>
                  {noeud.service.sigle && noeud.service.sigle !== noeud.service.nom && (
                    <span className="text-sm text-gray-600">- {noeud.service.nom}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{noeud.service.mission}</p>
                {noeud.service.localisation && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {noeud.service.localisation}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {noeud.children.length > 0 && (
                  <span>{noeud.children.filter(e => e.personnel).length} agent(s)</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personnel */}
        {noeud.personnel && (
          <div className="mb-2">
            <div 
              className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                estSelectionne ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => {
                setPersonnelSelectionne(noeud.personnel!);
                if (modeSelection) {
                  selectionnerPersonnelPourVisite(noeud.personnel!.id);
                }
              }}
            >
              {/* Avatar et statut */}
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                {indicateurStatut && (
                  <div 
                    className={`absolute -top-1 -right-1 w-4 h-4 ${indicateurStatut.color} rounded-full border-2 border-white`}
                    title={indicateurStatut.text}
                  ></div>
                )}
              </div>

              {/* Informations */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {noeud.personnel.prenom} {noeud.personnel.nom}
                  </span>
                  {noeud.personnel.niveau_hierarchique <= 2 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      noeud.personnel.niveau_hierarchique === 1 ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {noeud.personnel.niveau_hierarchique === 1 ? 'DG' : 'DGA'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{noeud.personnel.fonction}</p>
                {noeud.personnel.grade && (
                  <p className="text-xs text-gray-500">{noeud.personnel.grade}</p>
                )}
                
                {/* Contact */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {noeud.personnel.contact?.bureau && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {noeud.personnel.contact.bureau}
                    </div>
                  )}
                  {noeud.personnel.contact?.telephone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>📞</span>
                    </div>
                  )}
                  {noeud.personnel.contact?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>📧</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {modeSelection && (
                  <input 
                    type="checkbox" 
                    checked={estSelectionne}
                    onChange={() => selectionnerPersonnelPourVisite(noeud.personnel!.id)}
                    className="rounded"
                  />
                )}
                <button 
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPersonnelSelectionne(noeud.personnel!);
                  }}
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enfants */}
        {estExpande && noeud.children.map((enfant, index) => (
          <RenduNoeud key={`${enfant.service?.id || enfant.personnel?.id}-${index}`} noeud={enfant} />
        ))}
      </div>
    );
  };

      // Affichage du loading
    if (loading) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement de l'organigramme...</span>
          </div>
        </div>
      );
    }

    if (!organigramme) {
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Impossible de charger l'organigramme</p>
          </div>
        </div>
      );
    }

    return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Organigramme DGI Gabon
            </h1>
            <p className="text-gray-600">
              Structure hiérarchique et personnel de la Direction Générale des Impôts
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setModeSelection(!modeSelection)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                modeSelection 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              {modeSelection ? 'Annuler sélection' : 'Sélectionner pour visite'}
            </button>
            
            {modeSelection && personnelSelectionnePourVisite.length > 0 && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planifier visite ({personnelSelectionnePourVisite.length})
              </button>
            )}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-900">{personnel.length}</div>
            <div className="text-sm text-blue-700">Total Personnel</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {personnel.filter(p => p.statut === 'actif').length}
            </div>
            <div className="text-sm text-green-700">Agents Actifs</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-900">{services.length}</div>
            <div className="text-sm text-purple-700">Services/Directions</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-orange-900">
              {personnel.filter(p => p.niveau_hierarchique <= 2).length}
            </div>
            <div className="text-sm text-orange-700">Direction Générale</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organigramme */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <RenduNoeud noeud={organigramme} />
          </div>
        </div>

        {/* Panneau de détails */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {personnelSelectionne ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Détails Personnel</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold">{personnelSelectionne.prenom} {personnelSelectionne.nom}</div>
                    <div className="text-sm text-gray-600">{personnelSelectionne.fonction}</div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Service:</span>
                    <p className="text-sm text-gray-600">{personnelSelectionne.service}</p>
                  </div>
                  
                  {personnelSelectionne.grade && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Grade:</span>
                      <p className="text-sm text-gray-600">{personnelSelectionne.grade}</p>
                    </div>
                  )}

                  {personnelSelectionne.contact?.bureau && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Bureau:</span>
                      <p className="text-sm text-gray-600">{personnelSelectionne.contact.bureau}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-700">Statut:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                      personnelSelectionne.statut === 'actif' ? 'bg-green-100 text-green-800' :
                      personnelSelectionne.statut === 'en_mission' ? 'bg-blue-100 text-blue-800' :
                      personnelSelectionne.statut === 'absent' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {personnelSelectionne.statut}
                    </span>
                  </div>

                  {personnelSelectionne.biographie && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Biographie:</span>
                      <p className="text-sm text-gray-600 mt-1">{personnelSelectionne.biographie}</p>
                    </div>
                  )}

                  {personnelSelectionne.specialisation && personnelSelectionne.specialisation.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Spécialisations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {personnelSelectionne.specialisation.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Planifier une visite
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Sélectionnez un membre du personnel pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { User, MapPin, Phone, Mail, Calendar, Award, Building, History, ArrowLeft } from 'lucide-react';
import { Personnel } from '../../types/dgi-personnel';

interface FichePersonnelDGIProps {
  personnel: Personnel;
  onRetour: () => void;
}

export const FichePersonnelDGI: React.FC<FichePersonnelDGIProps> = ({ personnel, onRetour }) => {
  const getNiveauLibelle = (niveau: number): string => {
    switch (niveau) {
      case 1: return 'Direction Générale';
      case 2: return 'Direction Générale Adjointe';
      case 3: return 'Direction';
      case 4: return 'Cadre';
      default: return 'Agent';
    }
  };

  const getStatutCouleur = (statut: string): string => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50 border-green-200';
      case 'en_mission': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'absent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'suspendu': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={onRetour}
          className="mb-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {personnel.photo ? (
                  <img src={personnel.photo} alt={`${personnel.prenom} ${personnel.nom}`} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-500" />
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {personnel.prenom} {personnel.nom}
                  </h1>
                  <p className="text-lg text-gray-700 mb-2">{personnel.fonction}</p>
                  {personnel.grade && (
                    <p className="text-sm text-gray-600 mb-3">{personnel.grade}</p>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatutCouleur(personnel.statut)}`}>
                      {personnel.statut.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {getNiveauLibelle(personnel.niveau_hierarchique)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Planifier une visite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations détaillées */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de service */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Affectation et Service
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Service/Direction</label>
                <p className="text-gray-900">{personnel.service}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Direction Générale</label>
                <p className="text-gray-900">{personnel.direction}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Niveau hiérarchique</label>
                <p className="text-gray-900">{getNiveauLibelle(personnel.niveau_hierarchique)}</p>
              </div>
              
              {personnel.date_nomination && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de nomination</label>
                  <p className="text-gray-900">
                    {new Date(personnel.date_nomination).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formation et spécialisations */}
          {(personnel.formation || personnel.specialisation) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Formation et Compétences
              </h3>
              
              {personnel.formation && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700">Formation</label>
                  <p className="text-gray-900">{personnel.formation}</p>
                </div>
              )}
              
              {personnel.specialisation && personnel.specialisation.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Spécialisations</label>
                  <div className="flex flex-wrap gap-2">
                    {personnel.specialisation.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Biographie */}
          {personnel.biographie && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Biographie</h3>
              <p className="text-gray-700 leading-relaxed">{personnel.biographie}</p>
            </div>
          )}

          {/* Historique des postes */}
          {personnel.historique_postes && personnel.historique_postes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                Historique des postes
              </h3>
              
              <div className="space-y-4">
                {personnel.historique_postes.map((poste, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{poste.poste}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(poste.date_debut).getFullYear()}
                        {poste.date_fin && ` - ${new Date(poste.date_fin).getFullYear()}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{poste.service}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Du {new Date(poste.date_debut).toLocaleDateString('fr-FR')}
                      {poste.date_fin && ` au ${new Date(poste.date_fin).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
            
            <div className="space-y-3">
              {personnel.contact?.bureau && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bureau</p>
                    <p className="text-gray-900">{personnel.contact.bureau}</p>
                  </div>
                </div>
              )}
              
              {personnel.contact?.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone</p>
                    <p className="text-gray-900">{personnel.contact.telephone}</p>
                  </div>
                </div>
              )}
              
              {personnel.contact?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{personnel.contact.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Planifier une visite
              </button>
              
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Contacter
              </button>
              
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Envoyer un email
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="bg-gray-50 rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Visites prévues</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dernière visite</span>
                <span className="font-medium">Il y a 5 jours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibilité</span>
                <span className="font-medium text-green-600">Libre</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

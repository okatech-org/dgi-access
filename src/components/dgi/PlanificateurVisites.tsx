import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Personnel, Visite, CreneauDisponible } from '../../types/dgi-personnel';
import { dgiService } from '../../services/dgi-hybrid';

interface PlanificateurVisitesProps {
  personnelSelectionne: Personnel[];
  onRetour: () => void;
}

export const PlanificateurVisites: React.FC<PlanificateurVisitesProps> = ({
  personnelSelectionne,
  onRetour
}) => {
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [heureSelectionnee, setHeureSelectionnee] = useState('09:00');
  const [dureeSelectionnee, setDureeSelectionnee] = useState(60);
  const [objectifVisite, setObjectifVisite] = useState('Réunion stratégique');
  const [lieuVisite, setLieuVisite] = useState('Siège DGI - Salle de réunion');
  const [typeVisite, setTypeVisite] = useState<'officielle' | 'inspection' | 'reunion' | 'formation' | 'autre'>('reunion');
  const [moisActuel, setMoisActuel] = useState(new Date());

  // Générer le calendrier du mois
  const joursCalendrier = useMemo(() => {
    const debut = new Date(moisActuel.getFullYear(), moisActuel.getMonth(), 1);
    const fin = new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 0);
    const premierJourSemaine = debut.getDay();
    const jours = [];

    // Ajouter les jours vides du début
    for (let i = 0; i < premierJourSemaine; i++) {
      jours.push(null);
    }

    // Ajouter tous les jours du mois
    for (let jour = 1; jour <= fin.getDate(); jour++) {
      jours.push(new Date(moisActuel.getFullYear(), moisActuel.getMonth(), jour));
    }

    return jours;
  }, [moisActuel]);

  // État pour les visites
  const [visitesJour, setVisitesJour] = useState<Visite[]>([]);

  // Charger les visites pour la date sélectionnée
  useEffect(() => {
    const loadVisites = async () => {
      try {
        const visites = await dgiService.getVisitesPourDate(dateSelectionnee);
        setVisitesJour(visites);
      } catch (error) {
        console.error('Erreur chargement visites:', error);
        setVisitesJour([]);
      }
    };
    loadVisites();
  }, [dateSelectionnee]);

  // Analyser la disponibilité pour une date
  const analyserDisponibilite = (date: Date): 'libre' | 'occupe' | 'partiellement_libre' => {
    // Cette fonction sera appelée avec les données chargées
    const visitesPersonnel = visitesJour.filter(v => 
      personnelSelectionne.some(p => p.id === v.personnel_id) &&
      new Date(v.date_prevue).toDateString() === date.toDateString()
    );

    if (visitesPersonnel.length === 0) return 'libre';
    if (visitesPersonnel.length < personnelSelectionne.length) return 'partiellement_libre';
    return 'occupe';
  };

  // Obtenir l'icône de disponibilité
  const getIconeDisponibilite = (disponibilite: string) => {
    switch (disponibilite) {
      case 'libre': return '✅';
      case 'partiellement_libre': return '⚠️';
      case 'occupe': return '❌';
      default: return '';
    }
  };

  // Naviguer dans les mois
  const moisPrecedent = () => {
    setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() - 1, 1));
  };

  const moisSuivant = () => {
    setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 1));
  };

  // Confirmer la visite
  const confirmerVisites = async () => {
    try {
      for (const person of personnelSelectionne) {
        const nouvelleVisite: Omit<Visite, 'id' | 'date_creation'> = {
          personnel_id: person.id,
          date_prevue: dateSelectionnee,
          heure_prevue: heureSelectionnee,
          duree_estimee: dureeSelectionnee,
          objectif: objectifVisite,
          type: typeVisite,
          statut: 'planifiee',
          lieu: lieuVisite,
          participants: personnelSelectionne.map(p => p.id),
          createur_id: 'current_user' // À remplacer par l'utilisateur connecté
        };
        
        await dgiService.creerVisite(nouvelleVisite);
      }

      alert(`${personnelSelectionne.length} visite(s) planifiée(s) avec succès !`);
      onRetour();
    } catch (error) {
      console.error('Erreur création visites:', error);
      alert('Erreur lors de la planification des visites');
    }
  };

  const heuresDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  const durees = [30, 45, 60, 90, 120];
  const lieux = [
    'Siège DGI - Salle de réunion',
    'Siège DGI - Bureau DG',
    'Siège DGI - Salle de conférence',
    'Direction des Grandes Entreprises',
    'Direction des Moyennes Entreprises',
    'Direction du Recouvrement',
    'Inspection Centrale'
  ];

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={onRetour}
          className="mb-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à la liste
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Planification des visites - {personnelSelectionne.length} personnes sélectionnées
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {moisNoms[moisActuel.getMonth()]} {moisActuel.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={moisPrecedent}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={moisSuivant}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {joursSemaine.map(jour => (
              <div key={jour} className="p-2 text-center text-sm font-medium text-gray-500">
                {jour}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {joursCalendrier.map((jour, index) => {
              if (!jour) {
                return <div key={index} className="p-3"></div>;
              }

              const estAujourdhui = jour.toDateString() === new Date().toDateString();
              const estSelectionne = jour.toDateString() === dateSelectionnee.toDateString();
              const disponibilite = analyserDisponibilite(jour);
              const iconeDisponibilite = getIconeDisponibilite(disponibilite);

              return (
                <button
                  key={index}
                  onClick={() => setDateSelectionnee(jour)}
                  className={`p-3 text-sm rounded hover:bg-gray-100 relative ${
                    estSelectionne ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    estAujourdhui ? 'bg-blue-50 text-blue-600' :
                    'text-gray-700'
                  }`}
                >
                  <div>{jour.getDate()}</div>
                  {iconeDisponibilite && (
                    <div className="absolute top-0 right-0 text-xs">
                      {iconeDisponibilite}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Légende */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>Libre</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚠️</span>
              <span>Partiellement libre</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❌</span>
              <span>Occupé</span>
            </div>
          </div>
        </div>

        {/* Détails de la visite */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Détails de la visite</h2>

          {/* Personnel sélectionné */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Personnel sélectionné:
            </h3>
            <div className="space-y-2">
              {personnelSelectionne.map(person => (
                <div key={person.id} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                  <span>•</span>
                  <span className="font-medium">{person.prenom} {person.nom}</span>
                  <span className="text-gray-600">
                    ({person.fonction === 'Directeur Général' ? 'DG' : 
                      person.fonction.includes('Directeur Général Adjoint') ? 'DGA' :
                      person.fonction.includes('Directeur') ? 'Dir.' : 'Insp.'})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres de la visite */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date sélectionnée
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <Calendar className="h-4 w-4" />
                {dateSelectionnee.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure
                </label>
                <select
                  value={heureSelectionnee}
                  onChange={(e) => setHeureSelectionnee(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {heuresDisponibles.map(heure => (
                    <option key={heure} value={heure}>{heure}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée
                </label>
                <select
                  value={dureeSelectionnee}
                  onChange={(e) => setDureeSelectionnee(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {durees.map(duree => (
                    <option key={duree} value={duree}>
                      {duree} min{duree > 60 ? ` (${Math.floor(duree/60)}h${duree%60 > 0 ? duree%60 : ''})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objectif de la visite
              </label>
              <input
                type="text"
                value={objectifVisite}
                onChange={(e) => setObjectifVisite(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Réunion stratégique, Point d'avancement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de visite
              </label>
              <select
                value={typeVisite}
                onChange={(e) => setTypeVisite(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="reunion">Réunion</option>
                <option value="officielle">Visite officielle</option>
                <option value="inspection">Inspection</option>
                <option value="formation">Formation</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <select
                value={lieuVisite}
                onChange={(e) => setLieuVisite(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {lieux.map(lieu => (
                  <option key={lieu} value={lieu}>{lieu}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={confirmerVisites}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirmer les visites
            </button>
            <button
              onClick={onRetour}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>

          {/* Avertissement disponibilité */}
          {analyserDisponibilite(dateSelectionnee) !== 'libre' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {analyserDisponibilite(dateSelectionnee) === 'occupe' 
                    ? 'Attention: Certaines personnes ont déjà des visites prévues ce jour.'
                    : 'Attention: Il y a des conflits partiels pour cette date.'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

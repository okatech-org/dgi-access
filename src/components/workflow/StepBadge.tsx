import React, { useState, useEffect, useCallback } from 'react';
import { Badge, AlertCircle, Clock, MapPin } from 'lucide-react';
import { VisitorRegistrationData, AvailableBadge, AccessZone } from '../../types/visitor-process';

interface StepBadgeProps {
  data: VisitorRegistrationData;
  onUpdate: (updates: Partial<VisitorRegistrationData>) => void;
}

export const StepBadge: React.FC<StepBadgeProps> = ({ data, onUpdate }) => {
  const [requiresBadge, setRequiresBadge] = useState(true);
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [accessZones, setAccessZones] = useState<AccessZone[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableBadges();
    loadAccessZones();
  }, []);

  const loadAvailableBadges = async () => {
    // Simulation des badges disponibles
    const badges: AvailableBadge[] = [
      { id: 'B001', number: '001', zone: 'Général', isAvailable: true },
      { id: 'B002', number: '002', zone: 'Général', isAvailable: true },
      { id: 'B003', number: '003', zone: 'Sécurisé', isAvailable: true },
      { id: 'B004', number: '004', zone: 'VIP', isAvailable: false, currentHolder: 'En utilisation' },
      { id: 'B005', number: '005', zone: 'Général', isAvailable: true },
      { id: 'B006', number: '006', zone: 'Sécurisé', isAvailable: true },
    ];
    setAvailableBadges(badges);
  };

  const loadAccessZones = async () => {
    // Simulation des zones d'accès
    const zones: AccessZone[] = [
      { id: 'Z001', name: 'Accueil', description: 'Hall d\'accueil et réception', level: 1, requiresEscort: false },
      { id: 'Z002', name: 'Bureaux RDC', description: 'Bureaux du rez-de-chaussée', level: 2, requiresEscort: false },
      { id: 'Z003', name: 'Bureaux 1er étage', description: 'Bureaux du premier étage', level: 2, requiresEscort: false },
      { id: 'Z004', name: 'Salle de réunion', description: 'Salles de réunion et conférence', level: 2, requiresEscort: false },
      { id: 'Z005', name: 'Cafétéria', description: 'Espace restauration', level: 1, requiresEscort: false },
      { id: 'Z006', name: 'Zone technique', description: 'Salles serveurs et technique', level: 3, requiresEscort: true },
    ];
    setAccessZones(zones);
  };

  const handleBadgeRequirement = (required: boolean) => {
    setRequiresBadge(required);
    setSelectedBadge('');
    setSelectedZones([]);
    
    onUpdate({
      ...data,
      badge: {
        ...data.badge,
        required,
        badgeId: required ? undefined : '',
        badgeNumber: required ? undefined : '',
        accessZones: required ? [] : undefined
      }
    });
  };

  const handleBadgeSelection = useCallback((badgeId: string) => {
    const badge = availableBadges.find(b => b.id === badgeId);
    setSelectedBadge(badgeId);
    
    onUpdate({
      ...data,
      badge: {
        ...data.badge,
        badgeId,
        badgeNumber: badge?.number,
        accessZones: selectedZones
      }
    });
  }, [availableBadges, selectedZones, data, onUpdate]);

  const handleZoneToggle = (zoneId: string) => {
    const newZones = selectedZones.includes(zoneId)
      ? selectedZones.filter(id => id !== zoneId)
      : [...selectedZones, zoneId];
    
    setSelectedZones(newZones);
    
    onUpdate({
      ...data,
      badge: {
        ...data.badge,
        accessZones: newZones
      }
    });
  };

  const availableBadgesList = availableBadges.filter(b => b.isAvailable);
  const unavailableBadgesList = availableBadges.filter(b => !b.isAvailable);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 2: Attribution du badge
        </h2>
        <p className="text-gray-600">
          Déterminez si le visiteur a besoin d'un badge et configurez les accès
        </p>
      </div>
      
      {/* Choix badge requis ou non */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Type de visite</h3>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={requiresBadge}
              onChange={() => handleBadgeRequirement(true)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Avec badge</span>
              <p className="text-sm text-gray-600">Accès aux zones internes</p>
            </div>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={!requiresBadge}
              onChange={() => handleBadgeRequirement(false)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Sans badge</span>
              <p className="text-sm text-gray-600">Visite courte à l'accueil uniquement</p>
            </div>
          </label>
        </div>
      </div>

      {!requiresBadge && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Visite sans badge</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Le visiteur restera dans la zone d'accueil et devra être accompagné pour tout déplacement.
            </p>
          </div>
        </div>
      )}

      {requiresBadge && (
        <>
          {/* Liste des badges disponibles */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Badges disponibles</h3>
            
            {availableBadgesList.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {availableBadgesList.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeSelection(badge.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                      selectedBadge === badge.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Badge className="w-8 h-8 mx-auto mb-1" />
                    <div className="font-bold text-lg">{badge.number}</div>
                    <div className="text-xs text-gray-500">{badge.zone}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Aucun badge disponible</p>
                  <p className="text-sm text-red-600">Tous les badges sont actuellement en utilisation.</p>
                </div>
              </div>
            )}

            {/* Badges indisponibles */}
            {unavailableBadgesList.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Badges en utilisation</h4>
                <div className="grid grid-cols-4 gap-3">
                  {unavailableBadgesList.map(badge => (
                    <div
                      key={badge.id}
                      className="p-3 border-2 border-gray-200 rounded-lg text-center bg-gray-50 opacity-60"
                    >
                      <Badge className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                      <div className="font-bold text-lg text-gray-400">{badge.number}</div>
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        En cours
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Zones d'accès */}
          {selectedBadge && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Zones d'accès autorisées
              </h3>
              <div className="space-y-2">
                {accessZones.map(zone => (
                  <label
                    key={zone.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedZones.includes(zone.id)}
                      onChange={() => handleZoneToggle(zone.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{zone.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          zone.level === 1 ? 'bg-green-100 text-green-800' :
                          zone.level === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Niveau {zone.level}
                        </span>
                        {zone.requiresEscort && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Accompagné
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Récapitulatif badge sélectionné */}
          {selectedBadge && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Badge sélectionné</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Numéro:</span> {availableBadges.find(b => b.id === selectedBadge)?.number}
                </div>
                <div>
                  <span className="text-blue-600">Type:</span> {availableBadges.find(b => b.id === selectedBadge)?.zone}
                </div>
                <div className="col-span-2">
                  <span className="text-blue-600">Zones autorisées:</span>{' '}
                  {selectedZones.length === 0 
                    ? 'Aucune zone sélectionnée' 
                    : selectedZones.map(zoneId => {
                        const zone = accessZones.find(z => z.id === zoneId);
                        return zone?.name;
                      }).join(', ')
                  }
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Instructions de sécurité */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Instructions de sécurité</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          {requiresBadge ? (
            <>
              <li>• Le badge doit être porté de manière visible en permanence</li>
              <li>• Le visiteur doit rester dans les zones autorisées</li>
              <li>• Tout déplacement vers une zone non autorisée nécessite un accompagnement</li>
              <li>• Le badge doit être restitué à la sortie</li>
            </>
          ) : (
            <>
              <li>• Le visiteur doit rester dans la zone d'accueil</li>
              <li>• Tout déplacement nécessite un accompagnement obligatoire</li>
              <li>• La durée de visite est limitée à 30 minutes maximum</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

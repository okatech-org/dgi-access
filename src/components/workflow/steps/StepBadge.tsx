import React, { useState, useEffect } from 'react';
import { Badge, Shield, Clock, MapPin, AlertTriangle, Check, X } from 'lucide-react';
import { VisitorRegistrationData } from '../../../types/visitor-process';

interface StepBadgeProps {
  data: VisitorRegistrationData;
  onUpdate: (data: Partial<VisitorRegistrationData>) => void;
}

interface BadgeInfo {
  id: string;
  number: string;
  type: 'visitor' | 'contractor' | 'vip' | 'escort';
  zones: string[];
  isAvailable: boolean;
  batteryLevel?: number;
  lastUsed?: Date;
}

const AVAILABLE_ZONES = [
  { id: 'accueil', name: 'Accueil', level: 0, color: 'green' },
  { id: 'rdc', name: 'Bureaux RDC', level: 1, color: 'blue' },
  { id: 'etage1', name: 'Bureaux 1er étage', level: 2, color: 'yellow' },
  { id: 'etage2', name: 'Bureaux 2ème étage', level: 2, color: 'yellow' },
  { id: 'reunion', name: 'Salles de réunion', level: 1, color: 'blue' },
  { id: 'cafeteria', name: 'Cafétéria', level: 0, color: 'green' },
  { id: 'parking', name: 'Parking', level: 0, color: 'green' },
  { id: 'direction', name: 'Direction', level: 3, color: 'red' },
  { id: 'archives', name: 'Archives', level: 3, color: 'red' },
  { id: 'serveur', name: 'Salle serveur', level: 4, color: 'purple' }
];

export const StepBadge: React.FC<StepBadgeProps> = ({ data, onUpdate }) => {
  const [requiresBadge, setRequiresBadge] = useState(data.badge.required);
  const [availableBadges, setAvailableBadges] = useState<BadgeInfo[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [selectedZones, setSelectedZones] = useState<string[]>(data.badge.accessZones || ['accueil']);
  const [estimatedReturnTime, setEstimatedReturnTime] = useState<string>('');

  useEffect(() => {
    // Simuler le chargement des badges disponibles
    loadAvailableBadges();
  }, []);

  useEffect(() => {
    // Calculer l'heure de retour estimée basée sur la durée prévue
    if (data.visitType.expectedDuration) {
      const now = new Date();
      const duration = parseDuration(data.visitType.expectedDuration);
      const returnTime = new Date(now.getTime() + duration * 60000);
      setEstimatedReturnTime(returnTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }
  }, [data.visitType.expectedDuration]);

  const loadAvailableBadges = () => {
    // Simulation de badges disponibles
    const badges: BadgeInfo[] = [
      { id: 'B001', number: '001', type: 'visitor', zones: ['accueil', 'rdc'], isAvailable: true, batteryLevel: 85 },
      { id: 'B002', number: '002', type: 'visitor', zones: ['accueil', 'rdc', 'etage1'], isAvailable: true, batteryLevel: 92 },
      { id: 'B003', number: '003', type: 'visitor', zones: ['accueil', 'rdc', 'reunion'], isAvailable: true, batteryLevel: 78 },
      { id: 'B004', number: '004', type: 'contractor', zones: ['accueil', 'rdc', 'etage1', 'etage2'], isAvailable: false },
      { id: 'B005', number: '005', type: 'vip', zones: ['accueil', 'rdc', 'etage1', 'etage2', 'direction'], isAvailable: true, batteryLevel: 95 },
      { id: 'B006', number: '006', type: 'visitor', zones: ['accueil', 'rdc'], isAvailable: true, batteryLevel: 67 }
    ];
    
    setAvailableBadges(badges);
  };

  const parseDuration = (duration: string): number => {
    const durations: Record<string, number> = {
      '30min': 30,
      '1h': 60,
      '2h': 120,
      'halfday': 240,
      'fullday': 480
    };
    return durations[duration] || 60;
  };

  const handleBadgeRequirementChange = (required: boolean) => {
    setRequiresBadge(required);
    onUpdate({
      badge: {
        ...data.badge,
        required,
        badgeId: required ? selectedBadge : undefined,
        accessZones: required ? selectedZones : []
      }
    });
  };

  const handleBadgeSelection = (badgeId: string) => {
    setSelectedBadge(badgeId);
    const badge = availableBadges.find(b => b.id === badgeId);
    
    onUpdate({
      badge: {
        ...data.badge,
        badgeId,
        badgeNumber: badge?.number,
        accessZones: selectedZones
      }
    });
  };

  const handleZoneToggle = (zoneId: string) => {
    const newZones = selectedZones.includes(zoneId)
      ? selectedZones.filter(z => z !== zoneId)
      : [...selectedZones, zoneId];
    
    setSelectedZones(newZones);
    onUpdate({
      badge: {
        ...data.badge,
        accessZones: newZones
      }
    });
  };

  const getZoneColor = (level: number) => {
    const colors = {
      0: 'bg-green-100 text-green-800 border-green-300',
      1: 'bg-blue-100 text-blue-800 border-blue-300',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      3: 'bg-red-100 text-red-800 border-red-300',
      4: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const getBadgeTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return '👑';
      case 'contractor': return '🔧';
      case 'escort': return '🛡️';
      default: return '👤';
    }
  };

  const filteredBadges = availableBadges.filter(badge => {
    if (!badge.isAvailable) return false;
    
    // Vérifier si le badge peut accéder aux zones sélectionnées
    return selectedZones.every(zone => badge.zones.includes(zone));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 2: Attribution du badge
        </h2>
        <p className="text-gray-600">
          Déterminez si le visiteur a besoin d'un badge et configurez les zones d'accès autorisées.
        </p>
      </div>

      {/* Choix badge requis ou non */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Badge requis ?</h3>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={requiresBadge}
              onChange={() => handleBadgeRequirementChange(true)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Badge className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <span className="font-medium">Avec badge</span>
                <p className="text-sm text-gray-600">Visite nécessitant un accès contrôlé</p>
              </div>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={!requiresBadge}
              onChange={() => handleBadgeRequirementChange(false)}
              className="mr-3"
            />
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <span className="font-medium">Sans badge</span>
                <p className="text-sm text-gray-600">Visite courte à l'accueil uniquement</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {requiresBadge && (
        <>
          {/* Sélection des zones d'accès */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Zones d'accès autorisées</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez les zones auxquelles le visiteur peut accéder
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_ZONES.map(zone => (
                <label
                  key={zone.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedZones.includes(zone.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedZones.includes(zone.id)}
                    onChange={() => handleZoneToggle(zone.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{zone.name}</span>
                      <span className={`px-2 py-1 text-xs border rounded-full ${getZoneColor(zone.level)}`}>
                        Niveau {zone.level}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Légende des niveaux de sécurité */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Niveaux de sécurité :</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
                  <span>0 - Public</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                  <span>1 - Restreint</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
                  <span>2 - Contrôlé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
                  <span>3 - Sécurisé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-200 rounded mr-2"></div>
                  <span>4 - Critique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des badges disponibles */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Badges disponibles ({filteredBadges.length})
            </h3>
            
            {filteredBadges.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800 font-medium">Aucun badge compatible</p>
                <p className="text-yellow-700 text-sm">
                  Aucun badge disponible ne peut accéder aux zones sélectionnées.
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Veuillez réduire les zones d'accès ou contacter l'administrateur.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges.map(badge => (
                  <div
                    key={badge.id}
                    onClick={() => handleBadgeSelection(badge.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedBadge === badge.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-lg">{getBadgeTypeIcon(badge.type)}</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">Badge {badge.number}</div>
                          <div className="text-sm text-gray-600 capitalize">{badge.type}</div>
                        </div>
                      </div>
                      {selectedBadge === badge.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    {/* Niveau de batterie */}
                    {badge.batteryLevel && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Batterie</span>
                          <span>{badge.batteryLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              badge.batteryLevel > 70 ? 'bg-green-500' :
                              badge.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${badge.batteryLevel}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Zones accessibles */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Zones accessibles :</div>
                      <div className="flex flex-wrap gap-1">
                        {badge.zones.slice(0, 3).map(zoneId => {
                          const zone = AVAILABLE_ZONES.find(z => z.id === zoneId);
                          return zone ? (
                            <span
                              key={zoneId}
                              className={`px-2 py-1 text-xs rounded-full ${getZoneColor(zone.level)}`}
                            >
                              {zone.name}
                            </span>
                          ) : null;
                        })}
                        {badge.zones.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{badge.zones.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {badge.lastUsed && (
                      <div className="mt-2 text-xs text-gray-500">
                        Dernière utilisation : {badge.lastUsed.toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations sur le retour du badge */}
          {selectedBadge && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-800">Badge sélectionné</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Badge numéro :</span>
                  <span className="font-medium text-green-800">
                    {availableBadges.find(b => b.id === selectedBadge)?.number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Zones autorisées :</span>
                  <span className="font-medium text-green-800">{selectedZones.length}</span>
                </div>
                {estimatedReturnTime && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Retour estimé :</span>
                    <span className="font-medium text-green-800">{estimatedReturnTime}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
                <p className="text-green-800 text-sm font-medium">
                  ⚠️ Consignes importantes :
                </p>
                <ul className="text-green-700 text-sm mt-1 space-y-1">
                  <li>• Porter le badge de manière visible</li>
                  <li>• Respecter les zones autorisées</li>
                  <li>• Restituer le badge à la sortie</li>
                  <li>• Signaler toute perte immédiatement</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Résumé pour visite sans badge */}
      {!requiresBadge && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <h4 className="font-medium text-yellow-800">Visite sans badge</h4>
          </div>
          <p className="text-yellow-700 text-sm">
            Le visiteur restera dans la zone d'accueil et sera accompagné si nécessaire.
            Cette option est recommandée pour les visites courtes et les rendez-vous à l'accueil.
          </p>
          <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>Zone autorisée :</strong> Accueil uniquement
            </p>
          </div>
        </div>
      )}

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Sélectionnez uniquement les zones nécessaires à la visite</li>
          <li>• Les badges VIP donnent accès à plus de zones mais sont limités</li>
          <li>• La batterie du badge doit être suffisante pour la durée de visite</li>
          <li>• Vérifiez que le badge sélectionné couvre toutes les zones requises</li>
        </ul>
      </div>
    </div>
  );
};

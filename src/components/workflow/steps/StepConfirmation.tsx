import React from 'react';
import { Check, User, Badge, Calendar, MapPin, Phone, Mail, Clock, AlertCircle, FileText, Printer } from 'lucide-react';
import { VisitorRegistrationData } from '../../../types/visitor-process';

interface StepConfirmationProps {
  data: VisitorRegistrationData;
  onUpdate: (data: Partial<VisitorRegistrationData>) => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({ data }) => {
  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      normal: 'bg-green-100 text-green-800',
      urgent: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    const labels = {
      normal: 'Normal',
      urgent: 'Urgent',
      high: 'Très urgent'
    };
    return {
      className: badges[urgency as keyof typeof badges] || badges.normal,
      label: labels[urgency as keyof typeof labels] || 'Normal'
    };
  };

  const formatDuration = (duration: string) => {
    const durations: Record<string, string> = {
      '30min': '30 minutes',
      '1h': '1 heure',
      '2h': '2 heures',
      'halfday': 'Demi-journée',
      'fullday': 'Journée complète'
    };
    return durations[duration] || duration;
  };

  const estimateCheckoutTime = () => {
    const now = new Date();
    const durations: Record<string, number> = {
      '30min': 30,
      '1h': 60,
      '2h': 120,
      'halfday': 240,
      'fullday': 480
    };
    const minutes = durations[data.visitType.expectedDuration] || 60;
    const checkoutTime = new Date(now.getTime() + minutes * 60000);
    return checkoutTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 5: Confirmation de l'enregistrement
        </h2>
        <p className="text-gray-600">
          Vérifiez toutes les informations avant de finaliser l'enregistrement du visiteur.
        </p>
      </div>

      {/* Résumé complet */}
      <div className="space-y-6">
        
        {/* Section Identité */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Identité du visiteur</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nom complet :</span>
              <div className="font-medium">
                {data.identity.firstName} {data.identity.lastName}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Pièce d'identité :</span>
              <div className="font-medium">
                {data.identity.idType} N° {data.identity.idNumber}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Téléphone :</span>
              <div className="font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-500" />
                {data.identity.phone}
              </div>
            </div>
            
            {data.identity.email && (
              <div>
                <span className="text-gray-600">Email :</span>
                <div className="font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-500" />
                  {data.identity.email}
                </div>
              </div>
            )}
            
            {data.identity.company && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Société :</span>
                <div className="font-medium">{data.identity.company}</div>
              </div>
            )}
            
            <div className="md:col-span-2">
              <span className="text-gray-600">Méthode d'enregistrement :</span>
              <div className="font-medium">
                {data.identity.method === 'ai-scan' ? '🤖 Extraction IA' : '✍️ Saisie manuelle'}
              </div>
            </div>
          </div>
        </div>

        {/* Section Badge */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Badge className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Badge et accès</h3>
          </div>
          
          {data.badge.required ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Badge requis :</span>
                  <div className="font-medium text-green-600">✅ Oui</div>
                </div>
                
                {data.badge.badgeNumber && (
                  <div>
                    <span className="text-gray-600">Numéro de badge :</span>
                    <div className="font-medium">Badge {data.badge.badgeNumber}</div>
                  </div>
                )}
              </div>
              
              <div>
                <span className="text-gray-600">Zones d'accès autorisées :</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.badge.accessZones.map(zone => (
                    <span 
                      key={zone}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Important :</strong> Le visiteur doit porter le badge de manière visible 
                  et le restituer à la sortie.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Badge requis :</span>
                <span className="font-medium text-orange-600">❌ Non (visite à l'accueil)</span>
              </div>
              <p className="text-gray-600 mt-2">
                Le visiteur restera dans la zone d'accueil et sera accompagné si nécessaire.
              </p>
            </div>
          )}
        </div>

        {/* Section Type de visite */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Détails de la visite</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Type de visite :</span>
                <div className="font-medium">
                  {data.visitType.hasAppointment ? '📅 Rendez-vous planifié' : '👤 Visite spontanée'}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Motif :</span>
                <div className="font-medium capitalize">{data.visitType.purpose}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Durée prévue :</span>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {formatDuration(data.visitType.expectedDuration)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Urgence :</span>
                <div className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyBadge(data.visitType.urgency).className}`}>
                    {getUrgencyBadge(data.visitType.urgency).label}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Description :</span>
              <div className="font-medium bg-gray-50 p-2 rounded border mt-1">
                {data.visitType.description}
              </div>
            </div>
            
            {data.visitType.accompaniedBy && data.visitType.accompaniedBy.length > 0 && (
              <div>
                <span className="text-gray-600">Accompagnants :</span>
                <div className="font-medium">{data.visitType.accompaniedBy.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section Destination */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Destination</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            {data.destination.type === 'employee' ? (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Type :</span>
                  <div className="font-medium">👤 Personne spécifique</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Employé à rencontrer :</span>
                  <div className="font-medium text-blue-700">{data.destination.employeeName}</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Service :</span>
                  <div className="font-medium">{data.destination.serviceName}</div>
                </div>
                
                {data.destination.specificLocation && (
                  <div>
                    <span className="text-gray-600">Localisation :</span>
                    <div className="font-medium">{data.destination.specificLocation}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Type :</span>
                  <div className="font-medium">🏢 Service DGI</div>
                </div>
                
                <div>
                  <span className="text-gray-600">Service à rencontrer :</span>
                  <div className="font-medium text-blue-700">{data.destination.serviceName}</div>
                </div>
                
                {data.destination.building && (
                  <div>
                    <span className="text-gray-600">Bâtiment :</span>
                    <div className="font-medium">{data.destination.building}</div>
                  </div>
                )}
              </div>
            )}
            
            {data.destination.meetingRoom && (
              <div>
                <span className="text-gray-600">Lieu de rendez-vous :</span>
                <div className="font-medium">{data.destination.meetingRoom}</div>
              </div>
            )}
          </div>
        </div>

        {/* Section Horaires */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Horaires de visite</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-700">Arrivée :</span>
              <div className="font-medium text-green-800">
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div>
              <span className="text-green-700">Durée :</span>
              <div className="font-medium text-green-800">
                {formatDuration(data.visitType.expectedDuration)}
              </div>
            </div>
            
            <div>
              <span className="text-green-700">Sortie estimée :</span>
              <div className="font-medium text-green-800">
                {estimateCheckoutTime()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions après validation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Actions à effectuer</h3>
          </div>
          
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Génération automatique du récépissé de visite</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Attribution automatique du badge (si requis)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Notification automatique du destinataire</span>
            </div>
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Impression du récépissé pour le visiteur</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Enregistrement dans l'historique des visites</span>
            </div>
          </div>
        </div>

        {/* Avertissements et consignes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Consignes importantes</h3>
          </div>
          
          <ul className="space-y-2 text-sm text-yellow-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Le visiteur doit conserver son récépissé pendant toute la durée de sa visite</span>
            </li>
            {data.badge.required && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Le badge doit être porté de manière visible et restitué à la sortie</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Le visiteur doit respecter les zones d'accès autorisées</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Toute prolongation de visite doit être signalée à l'accueil</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Les règles de confidentialité et sécurité DGI s'appliquent</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Check, Printer, Send, QrCode, Badge, User, Calendar, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { VisitorRegistrationData } from '../../types/visitor-process';

interface StepConfirmationProps {
  data: VisitorRegistrationData;
  onUpdate: (updates: Partial<VisitorRegistrationData>) => void;
  onSubmit: () => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({ 
  data, 
  onUpdate, 
  onSubmit 
}) => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Générer le numéro d'enregistrement et le QR code
    generateRegistrationDetails();
  }, []);

  const generateRegistrationDetails = () => {
    // Générer un numéro d'enregistrement unique
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const regNumber = `VIS-${dateStr}-${timeStr}-${randomNum}`;
    
    setRegistrationNumber(regNumber);
    setQrCode(`https://dgi.gov.ga/visitor/${regNumber}`);
    
    // Mettre à jour les métadonnées
    onUpdate({
      ...data,
      metadata: {
        ...data.metadata,
        registrationNumber: regNumber,
        qrCode: `https://dgi.gov.ga/visitor/${regNumber}`,
        receiptGenerated: false
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Mettre à jour les options finales
      onUpdate({
        ...data,
        destination: {
          ...data.destination,
          notificationSent: sendNotification
        },
        metadata: {
          ...data.metadata,
          receiptGenerated: printReceipt
        }
      });
      
      // Simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await onSubmit();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDestinationText = () => {
    if (data.destination?.employee) {
      return `${data.destination.employee.firstName} ${data.destination.employee.lastName} - ${data.destination.employee.service.name}`;
    } else if (data.destination?.service) {
      return data.destination.service.name;
    }
    return 'Non défini';
  };

  const getBadgeText = () => {
    if (data.badge?.required && data.badge.badgeNumber) {
      return `Badge N° ${data.badge.badgeNumber}`;
    } else if (data.badge?.required === false) {
      return 'Sans badge (visite accueil)';
    }
    return 'Non défini';
  };

  const getDurationText = () => {
    const duration = data.visitType?.expectedDuration;
    if (!duration) return 'Non définie';
    
    const durationMap: { [key: string]: string } = {
      '15min': '15 minutes',
      '30min': '30 minutes',
      '1h': '1 heure',
      '2h': '2 heures',
      'halfday': 'Demi-journée',
      'fullday': 'Journée complète'
    };
    
    return durationMap[duration] || duration;
  };

  const getPurposeText = () => {
    const purposeMap: { [key: string]: string } = {
      'reunion': 'Réunion',
      'livraison': 'Livraison',
      'prestation': 'Prestation',
      'personnel': 'Personnel',
      'autre': 'Autre'
    };
    
    return purposeMap[data.visitType?.purpose || ''] || 'Non défini';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 5: Confirmation et validation
        </h2>
        <p className="text-gray-600">
          Vérifiez les informations avant de valider l'enregistrement
        </p>
      </div>

      {/* Numéro d'enregistrement */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-bold text-green-800 text-lg">N° d'enregistrement</h3>
            <p className="text-green-700 font-mono text-lg">{registrationNumber}</p>
          </div>
        </div>
      </div>

      {/* Récapitulatif des informations */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Récapitulatif de l'enregistrement</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Identité du visiteur */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Visiteur</h4>
              <p className="text-gray-700">
                {data.identity?.firstName} {data.identity?.lastName}
                {data.identity?.company && ` - ${data.identity.company}`}
              </p>
              <p className="text-sm text-gray-600">
                {data.identity?.idType} N° {data.identity?.idNumber} • {data.identity?.phone}
                {data.identity?.email && ` • ${data.identity.email}`}
              </p>
            </div>
          </div>

          {/* Badge */}
          <div className="flex items-start gap-3">
            <Badge className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Badge d'accès</h4>
              <p className="text-gray-700">{getBadgeText()}</p>
              {data.badge?.accessZones && data.badge.accessZones.length > 0 && (
                <p className="text-sm text-gray-600">
                  Zones autorisées: {data.badge.accessZones.length} zone(s)
                </p>
              )}
            </div>
          </div>

          {/* Type de visite */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Type de visite</h4>
              <p className="text-gray-700">
                {getPurposeText()}
                {data.visitType?.isUrgent && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    URGENT
                  </span>
                )}
              </p>
              {data.visitType?.description && (
                <p className="text-sm text-gray-600">{data.visitType.description}</p>
              )}
              {data.visitType?.hasAppointment && (
                <p className="text-sm text-green-600 font-medium">✓ Rendez-vous prévu</p>
              )}
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Destination</h4>
              <p className="text-gray-700">{getDestinationText()}</p>
              {data.destination?.specificLocation && (
                <p className="text-sm text-gray-600">Lieu: {data.destination.specificLocation}</p>
              )}
            </div>
          </div>

          {/* Durée */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Durée prévue</h4>
              <p className="text-gray-700">{getDurationText()}</p>
              <p className="text-sm text-gray-600">
                Arrivée: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Options finales */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Options de validation</h3>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Envoyer une notification</span>
              <p className="text-sm text-gray-600">
                Informer {data.destination?.type === 'employee' ? 'l\'employé' : 'le service'} de l'arrivée du visiteur
              </p>
            </div>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Imprimer le récépissé</span>
              <p className="text-sm text-gray-600">
                Générer et imprimer automatiquement le récépissé de visite
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Avertissements */}
      {!data.badge?.required && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Visite sans badge</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Le visiteur devra rester dans la zone d'accueil et être accompagné pour tout déplacement. 
              La durée de visite est limitée.
            </p>
          </div>
        </div>
      )}

      {/* Consignes de sécurité */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Consignes de sécurité</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {data.badge?.required ? (
            <>
              <li>• Porter le badge de manière visible en permanence</li>
              <li>• Respecter les zones d'accès autorisées</li>
              <li>• Être accompagné dans les zones sécurisées</li>
              <li>• Restituer le badge à la sortie obligatoirement</li>
            </>
          ) : (
            <>
              <li>• Rester dans la zone d'accueil uniquement</li>
              <li>• Être accompagné pour tout déplacement</li>
              <li>• Durée limitée à 30 minutes maximum</li>
              <li>• Signaler son départ à la réception</li>
            </>
          )}
        </ul>
      </div>

      {/* Actions finales */}
      <div className="flex gap-4 pt-4">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            <Printer className="w-5 h-5" />
            Aperçu récépissé
          </button>
          
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            disabled={isSubmitting}
          >
            <Send className="w-5 h-5" />
            Test notification
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Valider et Enregistrer
            </>
          )}
        </button>
      </div>

      {/* Message de validation en cours */}
      {isSubmitting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <h3 className="font-medium text-blue-800">Enregistrement en cours...</h3>
              <p className="text-sm text-blue-700">
                Sauvegarde des données, génération du récépissé et envoi des notifications
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

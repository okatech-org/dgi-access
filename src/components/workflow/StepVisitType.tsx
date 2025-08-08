import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Package, Wrench, User, FileText, Clock, AlertCircle } from 'lucide-react';
import { VisitorRegistrationData, VisitPurpose } from '../../types/visitor-process';
import { Appointment } from '../../types/appointment';

interface StepVisitTypeProps {
  data: VisitorRegistrationData;
  onUpdate: (updates: Partial<VisitorRegistrationData>) => void;
}

const visitPurposes = [
  { 
    value: 'reunion' as VisitPurpose, 
    label: 'Réunion', 
    icon: Users, 
    description: 'Rendez-vous professionnel ou réunion de travail',
    suggestedDuration: '1h'
  },
  { 
    value: 'livraison' as VisitPurpose, 
    label: 'Livraison', 
    icon: Package, 
    description: 'Livraison de matériel ou documents',
    suggestedDuration: '30min'
  },
  { 
    value: 'prestation' as VisitPurpose, 
    label: 'Prestation', 
    icon: Wrench, 
    description: 'Intervention technique ou maintenance',
    suggestedDuration: '2h'
  },
  { 
    value: 'personnel' as VisitPurpose, 
    label: 'Personnel', 
    icon: User, 
    description: 'Visite personnelle ou familiale',
    suggestedDuration: '30min'
  },
  { 
    value: 'autre' as VisitPurpose, 
    label: 'Autre', 
    icon: FileText, 
    description: 'Autre motif à préciser',
    suggestedDuration: '1h'
  }
];

const durationOptions = [
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1h', label: '1 heure' },
  { value: '2h', label: '2 heures' },
  { value: 'halfday', label: 'Demi-journée' },
  { value: 'fullday', label: 'Journée complète' }
];

export const StepVisitType: React.FC<StepVisitTypeProps> = ({ data, onUpdate }) => {
  const [hasAppointment, setHasAppointment] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    if (hasAppointment) {
      loadTodayAppointments();
    }
  }, [hasAppointment]);

  const loadTodayAppointments = async () => {
    setLoadingAppointments(true);
    try {
      // Simulation des rendez-vous du jour
      const today = new Date().toISOString().split('T')[0];
      const mockAppointments: Appointment[] = [
        {
          id: 'apt1',
          date: today,
          time: '09:00',
          duration: 60,
          citizenName: 'Marie DUPONT',
          citizenPhone: '077 11 11 11',
          service: 'Fiscalité',
          purpose: 'Déclaration fiscale',
          agent: 'Jean MARTIN',
          status: 'confirmed',
          notes: 'RDV pour aide à la déclaration'
        },
        {
          id: 'apt2',
          date: today,
          time: '14:30',
          duration: 45,
          citizenName: 'Paul BERNARD',
          citizenPhone: '077 22 22 22',
          service: 'Contentieux',
          purpose: 'Litige fiscal',
          agent: 'Sophie DURAND',
          status: 'confirmed',
          notes: 'Contestation d\'imposition'
        },
        {
          id: 'apt3',
          date: today,
          time: '16:00',
          duration: 30,
          citizenName: 'Claire ROUSSEAU',
          citizenPhone: '077 33 33 33',
          service: 'Renseignements',
          purpose: 'Information générale',
          agent: 'Pierre LEROY',
          status: 'pending',
          notes: 'Questions sur obligations fiscales'
        }
      ];
      
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const updateVisitType = useCallback((field: string, value: any) => {
    onUpdate({
      ...data,
      visitType: {
        ...data.visitType,
        [field]: value
      }
    });
  }, [data, onUpdate]);

  const handleAppointmentChange = (hasRdv: boolean) => {
    setHasAppointment(hasRdv);
    setSelectedAppointment('');
    
    updateVisitType('hasAppointment', hasRdv);
    if (!hasRdv) {
      updateVisitType('appointmentId', undefined);
    }
  };

  const handleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    updateVisitType('appointmentId', appointmentId);
    
    // Pré-remplir avec les infos du RDV
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      updateVisitType('description', appointment.purpose);
      updateVisitType('expectedDuration', `${appointment.duration}min`);
    }
  };

  const handlePurposeSelection = (purpose: VisitPurpose) => {
    updateVisitType('purpose', purpose);
    
    // Suggérer une durée basée sur le type
    const purposeConfig = visitPurposes.find(p => p.value === purpose);
    if (purposeConfig && !data.visitType?.expectedDuration) {
      updateVisitType('expectedDuration', purposeConfig.suggestedDuration);
    }
  };

  const selectedPurpose = visitPurposes.find(p => p.value === data.visitType?.purpose);
  const appointmentDetails = appointments.find(apt => apt.id === selectedAppointment);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 3: Type de visite
        </h2>
        <p className="text-gray-600">
          Précisez le motif et les détails de la visite
        </p>
      </div>
      
      {/* RDV prévu ou non */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Rendez-vous prévu</h3>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasAppointment}
            onChange={(e) => handleAppointmentChange(e.target.checked)}
            className="mr-3"
          />
          <div>
            <span className="font-medium">Le visiteur a un rendez-vous prévu</span>
            <p className="text-sm text-gray-600">Sélectionner dans la liste des RDV du jour</p>
          </div>
        </label>

        {hasAppointment && (
          <div className="mt-4">
            {loadingAppointments ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Chargement des rendez-vous...
              </div>
            ) : appointments.length > 0 ? (
              <select
                value={selectedAppointment}
                onChange={(e) => handleAppointmentSelection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un rendez-vous...</option>
                {appointments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {apt.time} - {apt.citizenName} - {apt.agent} - {apt.purpose}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">Aucun rendez-vous prévu pour aujourd'hui</span>
              </div>
            )}
          </div>
        )}

        {/* Détails du RDV sélectionné */}
        {appointmentDetails && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Détails du rendez-vous</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-blue-600">Heure:</span> {appointmentDetails.time}</div>
              <div><span className="text-blue-600">Durée:</span> {appointmentDetails.duration} min</div>
              <div><span className="text-blue-600">Service:</span> {appointmentDetails.service}</div>
              <div><span className="text-blue-600">Agent:</span> {appointmentDetails.agent}</div>
              <div className="col-span-2">
                <span className="text-blue-600">Motif:</span> {appointmentDetails.purpose}
              </div>
              {appointmentDetails.notes && (
                <div className="col-span-2">
                  <span className="text-blue-600">Notes:</span> {appointmentDetails.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Motif de la visite */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Motif de la visite *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {visitPurposes.map(purpose => {
            const IconComponent = purpose.icon;
            return (
              <button
                key={purpose.value}
                onClick={() => handlePurposeSelection(purpose.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  data.visitType?.purpose === purpose.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="w-6 h-6 mt-0.5" />
                  <div>
                    <div className="font-medium">{purpose.label}</div>
                    <p className="text-xs text-gray-600 mt-1">{purpose.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Durée suggérée: {purpose.suggestedDuration}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description détaillée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description détaillée
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder={selectedPurpose ? 
            `Détails supplémentaires sur ${selectedPurpose.label.toLowerCase()}...` : 
            'Détails supplémentaires sur la visite...'}
          value={data.visitType?.description || ''}
          onChange={(e) => updateVisitType('description', e.target.value)}
        />
      </div>

      {/* Durée prévue */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée prévue *
          </label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={data.visitType?.expectedDuration || ''}
            onChange={(e) => updateVisitType('expectedDuration', e.target.value)}
          >
            <option value="">Sélectionner une durée...</option>
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Caractère urgent */}
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 w-full">
            <input
              type="checkbox"
              checked={data.visitType?.isUrgent || false}
              onChange={(e) => updateVisitType('isUrgent', e.target.checked)}
              className="mr-3"
            />
            <div>
              <span className="font-medium text-red-600">Visite urgente</span>
              <p className="text-sm text-gray-600">Priorité élevée</p>
            </div>
          </label>
        </div>
      </div>

      {/* Récapitulatif */}
      {data.visitType?.purpose && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Récapitulatif de la visite</h3>
          <div className="space-y-1 text-sm text-green-700">
            <div>
              <span className="font-medium">Type:</span> {selectedPurpose?.label}
              {data.visitType.isUrgent && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  URGENT
                </span>
              )}
            </div>
            {hasAppointment && appointmentDetails && (
              <div><span className="font-medium">RDV:</span> {appointmentDetails.time} avec {appointmentDetails.agent}</div>
            )}
            <div><span className="font-medium">Durée:</span> {data.visitType.expectedDuration}</div>
            {data.visitType.description && (
              <div><span className="font-medium">Description:</span> {data.visitType.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

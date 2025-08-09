import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Package, Wrench, User, FileText, AlertCircle } from 'lucide-react';
import { VisitorRegistrationData, VisitPurpose } from '../../../types/visitor-process';

interface StepVisitTypeProps {
  data: VisitorRegistrationData;
  onUpdate: (data: Partial<VisitorRegistrationData>) => void;
}

interface Appointment {
  id: string;
  time: string;
  employee: string;
  subject: string;
  location: string;
}

const VISIT_PURPOSES = [
  { value: 'reunion' as VisitPurpose, label: 'Réunion', icon: Users, description: 'Rendez-vous professionnel', color: 'blue' },
  { value: 'livraison' as VisitPurpose, label: 'Livraison', icon: Package, description: 'Livraison de marchandises', color: 'green' },
  { value: 'prestation' as VisitPurpose, label: 'Prestation', icon: Wrench, description: 'Service technique', color: 'orange' },
  { value: 'personnel' as VisitPurpose, label: 'Personnel', icon: User, description: 'Visite personnelle', color: 'purple' },
  { value: 'autre' as VisitPurpose, label: 'Autre', icon: FileText, description: 'Autre motif', color: 'gray' }
];

const DURATION_OPTIONS = [
  { value: '30min', label: '30 minutes', icon: '🕐' },
  { value: '1h', label: '1 heure', icon: '🕑' },
  { value: '2h', label: '2 heures', icon: '🕒' },
  { value: 'halfday', label: 'Demi-journée', icon: '🕕' },
  { value: 'fullday', label: 'Journée complète', icon: '🕘' }
];

export const StepVisitType: React.FC<StepVisitTypeProps> = ({ data, onUpdate }) => {
  const [hasAppointment, setHasAppointment] = useState(data.visitType.hasAppointment);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<VisitPurpose>(data.visitType.purpose);
  const [description, setDescription] = useState(data.visitType.description);
  const [duration, setDuration] = useState(data.visitType.expectedDuration);
  const [urgency, setUrgency] = useState(data.visitType.urgency);

  useEffect(() => {
    // Charger les rendez-vous du jour
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = () => {
    // Simulation de rendez-vous
    const todayAppointments: Appointment[] = [
      {
        id: 'apt1',
        time: '09:00',
        employee: 'Jean OBAME',
        subject: 'Réunion budget',
        location: 'Bureau 105'
      },
      {
        id: 'apt2',
        time: '14:30',
        employee: 'Marie NGUEMA',
        subject: 'Formation SYDONIA',
        location: 'Salle formation'
      },
      {
        id: 'apt3',
        time: '16:00',
        employee: 'Séraphin NDONG',
        subject: 'Présentation projet',
        location: 'Bureau direction'
      }
    ];
    
    setAppointments(todayAppointments);
  };

  const handleAppointmentChange = (hasAppt: boolean) => {
    setHasAppointment(hasAppt);
    updateVisitType({ hasAppointment: hasAppt });
  };

  const handlePurposeChange = (purpose: VisitPurpose) => {
    setSelectedPurpose(purpose);
    updateVisitType({ purpose });
  };

  const handleDescriptionChange = (desc: string) => {
    setDescription(desc);
    updateVisitType({ description: desc });
  };

  const handleDurationChange = (dur: string) => {
    setDuration(dur);
    updateVisitType({ expectedDuration: dur });
  };

  const handleUrgencyChange = (urg: 'normal' | 'urgent' | 'high') => {
    setUrgency(urg);
    updateVisitType({ urgency: urg });
  };

  const updateVisitType = (updates: Partial<typeof data.visitType>) => {
    onUpdate({
      visitType: {
        ...data.visitType,
        ...updates
      }
    });
  };

  const getPurposeColor = (color: string) => {
    const colors = {
      blue: 'border-blue-500 bg-blue-50 text-blue-700',
      green: 'border-green-500 bg-green-50 text-green-700',
      orange: 'border-orange-500 bg-orange-50 text-orange-700',
      purple: 'border-purple-500 bg-purple-50 text-purple-700',
      gray: 'border-gray-500 bg-gray-50 text-gray-700'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Étape 3: Type de visite
        </h2>
        <p className="text-gray-600">
          Précisez le motif, la durée et les détails de la visite.
        </p>
      </div>

      {/* Rendez-vous prévu */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Cette visite correspond-elle à un rendez-vous ?</h3>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={!hasAppointment}
              onChange={() => handleAppointmentChange(false)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Visite spontanée</span>
              <p className="text-sm text-gray-600">Pas de rendez-vous prévu</p>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              checked={hasAppointment}
              onChange={() => handleAppointmentChange(true)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">Rendez-vous planifié</span>
              <p className="text-sm text-gray-600">Sélectionner un rendez-vous existant</p>
            </div>
          </label>
        </div>

        {hasAppointment && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner le rendez-vous
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => updateVisitType({ appointmentId: e.target.value })}
            >
              <option value="">Choisir un rendez-vous...</option>
              {appointments.map(apt => (
                <option key={apt.id} value={apt.id}>
                  {apt.time} - {apt.employee} - {apt.subject}
                </option>
              ))}
            </select>
            
            {appointments.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Aucun rendez-vous prévu pour aujourd'hui
              </p>
            )}
          </div>
        )}
      </div>

      {/* Motif de la visite */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Motif de la visite *</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {VISIT_PURPOSES.map(purpose => {
            const Icon = purpose.icon;
            const isSelected = selectedPurpose === purpose.value;
            
            return (
              <button
                key={purpose.value}
                onClick={() => handlePurposeChange(purpose.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  isSelected 
                    ? getPurposeColor(purpose.color)
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Icon className="w-6 h-6 mr-3" />
                  <span className="font-medium">{purpose.label}</span>
                </div>
                <p className="text-sm opacity-75">{purpose.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description détaillée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description de la visite *
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Décrivez le motif et les détails de la visite..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Cette information sera communiquée à la personne à rencontrer
        </p>
      </div>

      {/* Durée prévue */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Durée prévue de la visite</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {DURATION_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleDurationChange(option.value)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                duration === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{option.icon}</div>
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Niveau d'urgence */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Niveau d'urgence</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleUrgencyChange('normal')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              urgency === 'normal'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Normal</div>
            <div className="text-sm">Pas d'urgence particulière</div>
          </button>
          
          <button
            onClick={() => handleUrgencyChange('urgent')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              urgency === 'urgent'
                ? 'border-orange-600 bg-orange-50 text-orange-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Urgent</div>
            <div className="text-sm">Priorité élevée</div>
          </button>
          
          <button
            onClick={() => handleUrgencyChange('high')}
            className={`p-3 border-2 rounded-lg text-center transition-all ${
              urgency === 'high'
                ? 'border-red-600 bg-red-50 text-red-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Très urgent</div>
            <div className="text-sm">Priorité maximale</div>
          </button>
        </div>
      </div>

      {/* Accompagnants */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Accompagnants (optionnel)</h3>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Noms des personnes accompagnant le visiteur"
          onChange={(e) => updateVisitType({ accompaniedBy: e.target.value ? [e.target.value] : undefined })}
        />
        <p className="text-sm text-gray-500 mt-1">
          Séparez les noms par des virgules si plusieurs personnes
        </p>
      </div>

      {/* Résumé de la visite */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">📋 Résumé de la visite</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Type :</span>
            <span className="font-medium text-blue-800">
              {VISIT_PURPOSES.find(p => p.value === selectedPurpose)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Durée :</span>
            <span className="font-medium text-blue-800">
              {DURATION_OPTIONS.find(d => d.value === duration)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Urgence :</span>
            <span className={`font-medium ${
              urgency === 'high' ? 'text-red-800' :
              urgency === 'urgent' ? 'text-orange-800' : 'text-green-800'
            }`}>
              {urgency === 'high' ? 'Très urgent' :
               urgency === 'urgent' ? 'Urgent' : 'Normal'}
            </span>
          </div>
          {hasAppointment && (
            <div className="flex justify-between">
              <span className="text-blue-700">Rendez-vous :</span>
              <span className="font-medium text-blue-800">Oui</span>
            </div>
          )}
        </div>
      </div>

      {/* Informations d'aide */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Conseils</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Une description claire accélère le processus d'accueil</li>
          <li>• Le niveau d'urgence influence la priorité de traitement</li>
          <li>• Les visites urgentes peuvent nécessiter une validation supplémentaire</li>
          <li>• Mentionnez les accompagnants pour faciliter leur enregistrement</li>
        </ul>
      </div>
    </div>
  );
};

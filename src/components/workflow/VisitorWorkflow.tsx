import React, { useState, useEffect } from 'react';
import { Camera, User, Badge, Calendar, MapPin, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { VisitorRegistrationData, VisitorStep } from '../../types/visitor-process';
import { useAuth } from '../../contexts/AuthContext';
import { visitorPackageService } from '../../services/visitor-package-service';
import { StepIdentity } from './steps/StepIdentity';
import { StepBadge } from './steps/StepBadge';
import { StepVisitType } from './steps/StepVisitType';
import { StepDestination } from './steps/StepDestination';
import { StepConfirmation } from './steps/StepConfirmation';

interface VisitorWorkflowProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

interface WorkflowStep {
  id: number;
  key: VisitorStep;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

export const VisitorWorkflow: React.FC<VisitorWorkflowProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [registrationData, setRegistrationData] = useState<VisitorRegistrationData>({
    identity: {
      method: 'manual',
      firstName: '',
      lastName: '',
      idType: 'CNI',
      idNumber: '',
      phone: '',
      email: '',
      company: ''
    },
    badge: {
      required: true,
      accessZones: ['Accueil']
    },
    visitType: {
      hasAppointment: false,
      purpose: 'reunion',
      description: '',
      expectedDuration: '1h',
      urgency: 'normal'
    },
    destination: {
      type: 'employee'
    },
    metadata: {
      registeredBy: user?.id || 'unknown',
      registrationTime: new Date(),
      checkInTime: new Date(),
      status: 'pending',
      registrationNumber: '',
      securityLevel: 'standard'
    }
  });

  const steps: WorkflowStep[] = [
    { 
      id: 1, 
      key: 'identity',
      name: 'Identité', 
      icon: User,
      description: 'Informations personnelles du visiteur'
    },
    { 
      id: 2, 
      key: 'badge',
      name: 'Badge', 
      icon: Badge,
      description: 'Attribution et zones d\'accès'
    },
    { 
      id: 3, 
      key: 'visit-type',
      name: 'Type de visite', 
      icon: Calendar,
      description: 'Motif et durée de la visite'
    },
    { 
      id: 4, 
      key: 'destination',
      name: 'Destination', 
      icon: MapPin,
      description: 'Personne ou service à rencontrer'
    },
    { 
      id: 5, 
      key: 'confirmation',
      name: 'Confirmation', 
      icon: Check,
      description: 'Vérification et validation'
    }
  ];

  // Validation des données pour chaque étape
  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1: // Identité
        if (!registrationData.identity.firstName.trim()) {
          errors.push('Le prénom est requis');
        }
        if (!registrationData.identity.lastName.trim()) {
          errors.push('Le nom est requis');
        }
        if (!registrationData.identity.phone.trim()) {
          errors.push('Le téléphone est requis');
        }
        if (!registrationData.identity.idNumber.trim()) {
          errors.push('Le numéro de pièce d\'identité est requis');
        }
        break;
        
      case 2: // Badge
        if (registrationData.badge.required && !registrationData.badge.accessZones.length) {
          errors.push('Au moins une zone d\'accès doit être sélectionnée');
        }
        break;
        
      case 3: // Type de visite
        if (!registrationData.visitType.description.trim()) {
          errors.push('Une description de la visite est requise');
        }
        break;
        
      case 4: // Destination
        if (registrationData.destination.type === 'employee' && !registrationData.destination.employeeId) {
          errors.push('Un employé doit être sélectionné');
        }
        if (registrationData.destination.type === 'service' && !registrationData.destination.serviceId) {
          errors.push('Un service doit être sélectionné');
        }
        break;
    }
    
    return errors;
  };

  // Navigation vers l'étape suivante
  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    
    if (stepErrors.length === 0 && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigation vers l'étape précédente
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  // Finaliser l'enregistrement
  const handleSubmit = async () => {
    const finalErrors = validateStep(currentStep);
    setErrors(finalErrors);
    
    if (finalErrors.length > 0) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await visitorPackageService.registerVisitor(registrationData);
      
      if (onComplete) {
        onComplete(result);
      }
      
      // Afficher le succès
      alert(`✅ Visiteur enregistré avec succès !\nN° d'enregistrement: ${result.registrationNumber}`);
      
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      setErrors(['Erreur lors de l\'enregistrement. Veuillez réessayer.']);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mise à jour des données
  const updateData = (newData: Partial<VisitorRegistrationData>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...newData
    }));
    setErrors([]); // Effacer les erreurs lors de la modification
  };

  // Calculer le pourcentage de progression
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Enregistrement de Visiteur
            </h1>
            <p className="text-gray-600">
              Processus guidé en 5 étapes - Direction Générale des Impôts
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full transition-all
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : currentStep === step.id
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                  : 'bg-gray-200 text-gray-600'}
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 transition-all ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-xs text-gray-600">
          {steps.map(step => (
            <div key={step.id} className="text-center flex-1">
              <div className="font-medium">{step.name}</div>
              <div className="hidden sm:block">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Affichage des erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Erreurs à corriger :</h3>
          </div>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {currentStep === 1 && (
          <StepIdentity 
            data={registrationData} 
            onUpdate={updateData}
          />
        )}
        {currentStep === 2 && (
          <StepBadge 
            data={registrationData} 
            onUpdate={updateData}
          />
        )}
        {currentStep === 3 && (
          <StepVisitType 
            data={registrationData} 
            onUpdate={updateData}
          />
        )}
        {currentStep === 4 && (
          <StepDestination 
            data={registrationData} 
            onUpdate={updateData}
          />
        )}
        {currentStep === 5 && (
          <StepConfirmation 
            data={registrationData} 
            onUpdate={updateData}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStep} sur {steps.length}
            </p>
            <p className="text-xs text-gray-500">
              {steps[currentStep - 1]?.name}
            </p>
          </div>
          
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Valider et Imprimer
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Informations d'aide */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          💡 Astuce : Vous pouvez revenir aux étapes précédentes pour modifier les informations
        </p>
        <p className="mt-1">
          🔒 Toutes les données sont sécurisées et conformes aux règles de confidentialité DGI
        </p>
      </div>
    </div>
  );
};

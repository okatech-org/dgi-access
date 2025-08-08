import React, { useState } from 'react';
import { Camera, User, Badge, Calendar, MapPin, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { VisitorRegistrationData, ProcessStep } from '../../types/visitor-process';
import { StepIdentity } from './StepIdentity';
import { StepBadge } from './StepBadge';
import { StepVisitType } from './StepVisitType';
import { StepDestination } from './StepDestination';
import { StepConfirmation } from './StepConfirmation';

interface WorkflowStep {
  id: ProcessStep;
  name: string;
  icon: React.ComponentType;
}

const steps: WorkflowStep[] = [
  { id: 'identity', name: 'Identité', icon: User },
  { id: 'badge', name: 'Badge', icon: Badge },
  { id: 'visit-type', name: 'Type de visite', icon: Calendar },
  { id: 'destination', name: 'Destination', icon: MapPin },
  { id: 'confirmation', name: 'Confirmation', icon: Check }
];

interface VisitorWorkflowProps {
  onComplete?: (data: VisitorRegistrationData) => void;
  onCancel?: () => void;
}

export const VisitorWorkflow: React.FC<VisitorWorkflowProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [registrationData, setRegistrationData] = useState<VisitorRegistrationData>({
    identity: {},
    badge: {},
    visitType: {},
    destination: {},
    metadata: {
      registeredBy: 'current-user', // À remplacer par l'utilisateur connecté
      registrationTime: new Date(),
      checkInTime: new Date(),
      status: 'pending'
    }
  });

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (onComplete) {
      await onComplete(registrationData);
    }
  };

  const updateRegistrationData = (updates: Partial<VisitorRegistrationData>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const isStepValid = (): boolean => {
    switch (currentStep.id) {
      case 'identity':
        return !!(registrationData.identity?.firstName && 
                 registrationData.identity?.lastName && 
                 registrationData.identity?.idNumber);
      case 'badge':
        return true; // Le badge est optionnel
      case 'visit-type':
        return !!(registrationData.visitType?.purpose && 
                 registrationData.visitType?.description);
      case 'destination':
        return !!(registrationData.destination?.employeeId || 
                 registrationData.destination?.serviceId);
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Enregistrement d'un visiteur
        </h1>
        <p className="text-gray-600">
          Suivez les étapes pour enregistrer un nouveau visiteur
        </p>
      </div>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full transition-colors
                ${currentStepIndex >= index 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'}
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-1 mx-2 transition-colors ${
                  currentStepIndex > index ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span 
              key={step.id} 
              className={`text-xs transition-colors ${
                currentStepIndex >= index ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {step.name}
            </span>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        {currentStep.id === 'identity' && (
          <StepIdentity 
            data={registrationData} 
            onUpdate={updateRegistrationData} 
          />
        )}
        {currentStep.id === 'badge' && (
          <StepBadge 
            data={registrationData} 
            onUpdate={updateRegistrationData} 
          />
        )}
        {currentStep.id === 'visit-type' && (
          <StepVisitType 
            data={registrationData} 
            onUpdate={updateRegistrationData} 
          />
        )}
        {currentStep.id === 'destination' && (
          <StepDestination 
            data={registrationData} 
            onUpdate={updateRegistrationData} 
          />
        )}
        {currentStep.id === 'confirmation' && (
          <StepConfirmation 
            data={registrationData} 
            onUpdate={updateRegistrationData}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Étape {currentStepIndex + 1} sur {steps.length}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>
          
          {!isLastStep ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              Valider et Imprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

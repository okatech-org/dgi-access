export interface VisitorRegistrationData {
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  email?: string;
  idType: 'CNI' | 'Passeport' | 'Permis';
  idNumber: string;
  purpose: string;
  expectedDuration: string;
}

export interface VisitorProcessStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface VisitorWorkflowState {
  currentStep: number;
  steps: VisitorProcessStep[];
  registrationData?: VisitorRegistrationData;
  badgeNumber?: string;
  visitId?: string;
}

export type IdType = 'CNI' | 'Passeport' | 'Permis';

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  email?: string;
  idType: IdType;
  idNumber: string;
  purpose: string;
  employeeToVisit: string; // ID de l'employé
  serviceToVisit: string; // ID du service
  checkInTime: Date;
  checkOutTime?: Date;
  badgeNumber: string;
  status: 'checked-in' | 'checked-out';
  validatedBy?: string; // ID employé
  expectedDuration: string;
}



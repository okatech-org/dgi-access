export interface Visitor {
  id: string;
  // Informations visiteur
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  email?: string;
  idType: 'CNI' | 'Passeport' | 'Permis';
  idNumber: string;
  
  // Visite
  purpose: string;
  employeeToVisit: string; // ID de l'employé
  serviceToVisit: string;  // ID du service
  
  // Statut
  checkInTime: Date;
  checkOutTime?: Date;
  badgeNumber: string;
  status: 'checked-in' | 'checked-out';
  
  // Validation
  validatedBy?: string; // Employé qui a validé la visite
  expectedDuration: string;
}

export interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  checkedIn: number;
  checkedOut: number;
  byService: Record<string, number>;
  byEmployee: Record<string, number>;
}

export interface DailyReport {
  date: string;
  totalVisitors: number;
  topServices: Array<{
    service: string;
    count: number;
  }>;
  topEmployees: Array<{
    name: string;
    service: string;
    visitors: number;
  }>;
  averageVisitDuration: string;
}

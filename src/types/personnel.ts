export interface Employee {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: Service;
  position: string;
  office: string; // Numéro de bureau
  floor: string;  // Étage
  isActive: boolean;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  code: string; // Ex: "FISCALITE", "RH", "COMPTA"
  name: string;
  description: string;
  responsable: string; // ID de l'employé responsable
  location: string; // Bâtiment/Aile
  employees: string[]; // IDs des employés
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  byService: Record<string, number>;
}

export interface ServiceStats {
  total: number;
  employeesCount: number;
  averageEmployeesPerService: number;
}

import { Employee, Service } from '../types/personnel';
import { Visitor } from '../types/visitor';

class DatabaseService {
  private readonly STORAGE_KEYS = {
    EMPLOYEES: 'dgi_employees',
    SERVICES: 'dgi_services',
    VISITORS: 'dgi_visitors',
    BADGES: 'dgi_badges',
  } as const;

  // Employés
  async saveEmployee(employee: Employee): Promise<void> {
    const employees = this.getEmployees();
    employees.push(employee);
    localStorage.setItem(this.STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  getEmployees(): Employee[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.EMPLOYEES);
    return data ? (JSON.parse(data) as Employee[]) : [];
  }

  getEmployeesByService(serviceId: string): Employee[] {
    return this.getEmployees().filter((e) => e.service.id === serviceId);
  }

  searchEmployee(query: string): Employee[] {
    const employees = this.getEmployees();
    const lowQuery = query.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(lowQuery) ||
        e.lastName.toLowerCase().includes(lowQuery) ||
        e.matricule.includes(query) ||
        e.service.name.toLowerCase().includes(lowQuery)
    );
  }

  // Services
  async saveService(service: Service): Promise<void> {
    const services = this.getServices();
    services.push(service);
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  getServices(): Service[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.SERVICES);
    let services: Service[] = data ? (JSON.parse(data) as Service[]) : [];
    if (services.length === 0) {
      services = [
        { id: 'svc-fisc', code: 'FISCALITE', name: 'Fiscalité', description: 'Gestion fiscale', responsable: '', location: 'Bât. A', employees: [] },
        { id: 'svc-rh', code: 'RH', name: 'Ressources Humaines', description: 'Gestion du personnel', responsable: '', location: 'Bât. B', employees: [] },
        { id: 'svc-compta', code: 'COMPTA', name: 'Comptabilité', description: 'Gestion comptable', responsable: '', location: 'Bât. C', employees: [] },
      ];
      localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
    return services;
  }

  // Visiteurs
  async saveVisitor(visitor: Visitor): Promise<void> {
    const visitors = this.getVisitors();
    visitors.push(visitor);
    localStorage.setItem(this.STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
  }

  getVisitors(): Visitor[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.VISITORS);
    return data ? (JSON.parse(data) as Visitor[]) : [];
  }

  getTodayVisitors(): Visitor[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.getVisitors().filter((v) => new Date(v.checkInTime).toISOString().slice(0, 10) === today);
  }
}

export const db = new DatabaseService();



import { Employee, Service, EmployeeStats, ServiceStats } from '../types/personnel';
import { Visitor, VisitorStats, DailyReport } from '../types/visitor';

class DatabaseService {
  private readonly STORAGE_KEYS = {
    EMPLOYEES: 'dgi_employees',
    SERVICES: 'dgi_services', 
    VISITORS: 'dgi_visitors',
    BADGES: 'dgi_badges'
  };

  // ===== EMPLOYEES =====
  
  async saveEmployee(employee: Employee): Promise<void> {
    const employees = this.getEmployees();
    const existingIndex = employees.findIndex(e => e.id === employee.id);
    
    if (existingIndex >= 0) {
      employees[existingIndex] = { ...employee, updatedAt: new Date() };
    } else {
      employees.push({ ...employee, createdAt: new Date(), updatedAt: new Date() });
    }
    
    localStorage.setItem(this.STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  getEmployees(): Employee[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data).map((emp: any) => ({
      ...emp,
      createdAt: new Date(emp.createdAt),
      updatedAt: new Date(emp.updatedAt)
    })) : [];
  }

  getEmployeeById(id: string): Employee | null {
    const employees = this.getEmployees();
    return employees.find(e => e.id === id) || null;
  }

  getEmployeesByService(serviceId: string): Employee[] {
    return this.getEmployees().filter(e => e.service.id === serviceId);
  }

  searchEmployee(query: string): Employee[] {
    const employees = this.getEmployees();
    const lowQuery = query.toLowerCase();
    
    return employees.filter(e => 
      e.firstName.toLowerCase().includes(lowQuery) ||
      e.lastName.toLowerCase().includes(lowQuery) ||
      e.matricule.toLowerCase().includes(lowQuery) ||
      e.service.name.toLowerCase().includes(lowQuery) ||
      e.position.toLowerCase().includes(lowQuery) ||
      e.email.toLowerCase().includes(lowQuery)
    );
  }

  async deleteEmployee(id: string): Promise<void> {
    const employees = this.getEmployees();
    const filtered = employees.filter(e => e.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
  }

  // ===== SERVICES =====
  
  async saveService(service: Service): Promise<void> {
    const services = this.getServices();
    const existingIndex = services.findIndex(s => s.id === service.id);
    
    if (existingIndex >= 0) {
      services[existingIndex] = service;
    } else {
      services.push(service);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  getServices(): Service[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : [];
  }

  getServiceById(id: string): Service | null {
    const services = this.getServices();
    return services.find(s => s.id === id) || null;
  }

  async deleteService(id: string): Promise<void> {
    const services = this.getServices();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
  }

  // ===== VISITORS =====
  
  async saveVisitor(visitor: Visitor): Promise<void> {
    const visitors = this.getVisitors();
    const existingIndex = visitors.findIndex(v => v.id === visitor.id);
    
    if (existingIndex >= 0) {
      visitors[existingIndex] = visitor;
    } else {
      visitors.push(visitor);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.VISITORS, JSON.stringify(visitors));
  }

  getVisitors(): Visitor[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.VISITORS);
    return data ? JSON.parse(data).map((visitor: any) => ({
      ...visitor,
      checkInTime: new Date(visitor.checkInTime),
      checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : undefined
    })) : [];
  }

  getVisitorById(id: string): Visitor | null {
    const visitors = this.getVisitors();
    return visitors.find(v => v.id === id) || null;
  }

  getTodayVisitors(): Visitor[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.getVisitors().filter(v => {
      const checkIn = new Date(v.checkInTime);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    });
  }

  getVisitorsByEmployee(employeeId: string): Visitor[] {
    return this.getVisitors().filter(v => v.employeeToVisit === employeeId);
  }

  getVisitorsByService(serviceId: string): Visitor[] {
    return this.getVisitors().filter(v => v.serviceToVisit === serviceId);
  }

  async checkOutVisitor(visitorId: string): Promise<void> {
    const visitors = this.getVisitors();
    const visitor = visitors.find(v => v.id === visitorId);
    
    if (visitor) {
      visitor.status = 'checked-out';
      visitor.checkOutTime = new Date();
      await this.saveVisitor(visitor);
    }
  }

  // ===== STATISTICS =====
  
  getEmployeeStats(): EmployeeStats {
    const employees = this.getEmployees();
    const services = this.getServices();
    
    const byService: Record<string, number> = {};
    services.forEach(service => {
      byService[service.name] = employees.filter(e => e.service.id === service.id).length;
    });

    return {
      total: employees.length,
      active: employees.filter(e => e.isActive).length,
      inactive: employees.filter(e => !e.isActive).length,
      byService
    };
  }

  getServiceStats(): ServiceStats {
    const services = this.getServices();
    const employees = this.getEmployees();
    
    return {
      total: services.length,
      employeesCount: employees.length,
      averageEmployeesPerService: services.length > 0 ? employees.length / services.length : 0
    };
  }

  getVisitorStats(): VisitorStats {
    const visitors = this.getVisitors();
    const todayVisitors = this.getTodayVisitors();
    const employees = this.getEmployees();
    const services = this.getServices();
    
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisWeek = visitors.filter(v => new Date(v.checkInTime) >= weekStart).length;
    const thisMonth = visitors.filter(v => new Date(v.checkInTime) >= monthStart).length;
    
    const byService: Record<string, number> = {};
    const byEmployee: Record<string, number> = {};
    
    services.forEach(service => {
      byService[service.name] = visitors.filter(v => v.serviceToVisit === service.id).length;
    });
    
    employees.forEach(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      byEmployee[fullName] = visitors.filter(v => v.employeeToVisit === employee.id).length;
    });

    return {
      today: todayVisitors.length,
      thisWeek,
      thisMonth,
      checkedIn: todayVisitors.filter(v => v.status === 'checked-in').length,
      checkedOut: todayVisitors.filter(v => v.status === 'checked-out').length,
      byService,
      byEmployee
    };
  }

  getDailyReport(date: Date = new Date()): DailyReport {
    const dateStr = date.toISOString().split('T')[0];
    const dayVisitors = this.getVisitors().filter(v => {
      const checkInDate = new Date(v.checkInTime).toISOString().split('T')[0];
      return checkInDate === dateStr;
    });

    const employees = this.getEmployees();
    const services = this.getServices();
    
    const serviceStats: Record<string, number> = {};
    const employeeStats: Record<string, { name: string; service: string; count: number }> = {};
    
    dayVisitors.forEach(visitor => {
      const service = services.find(s => s.id === visitor.serviceToVisit);
      const employee = employees.find(e => e.id === visitor.employeeToVisit);
      
      if (service) {
        serviceStats[service.name] = (serviceStats[service.name] || 0) + 1;
      }
      
      if (employee) {
        const key = employee.id;
        if (!employeeStats[key]) {
          employeeStats[key] = {
            name: `${employee.firstName} ${employee.lastName}`,
            service: employee.service.name,
            count: 0
          };
        }
        employeeStats[key].count++;
      }
    });

    const topServices = Object.entries(serviceStats)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEmployees = Object.values(employeeStats)
      .map(({ name, service, count }) => ({ name, service, visitors: count }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);

    const totalDuration = dayVisitors
      .filter(v => v.checkOutTime)
      .reduce((sum, v) => {
        const duration = new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime).getTime();
        return sum + duration;
      }, 0);

    const avgDurationMs = dayVisitors.length > 0 ? totalDuration / dayVisitors.length : 0;
    const avgDurationMinutes = Math.round(avgDurationMs / (1000 * 60));

    return {
      date: dateStr,
      totalVisitors: dayVisitors.length,
      topServices,
      topEmployees,
      averageVisitDuration: `${avgDurationMinutes} minutes`
    };
  }

  // ===== INITIALIZATION =====
  
  async initializeDefaultData(): Promise<void> {
    // Importer les données réelles DGI
    const { DGI_SERVICES } = await import('../data/dgi-services');
    
    if (this.getServices().length === 0) {
      for (const service of DGI_SERVICES) {
        await this.saveService(service);
      }
      console.log('✅ Services DGI initialisés:', DGI_SERVICES.length);
    }
  }

  async initializeDGIEmployees(): Promise<void> {
    // Importer les employés réels DGI
    const { createDGIEmployees } = await import('../data/dgi-employees');
    
    if (this.getEmployees().length === 0) {
      const dgiEmployees = createDGIEmployees();
      for (const employee of dgiEmployees) {
        await this.saveEmployee(employee);
      }
      console.log('✅ Personnel DGI initialisé:', dgiEmployees.length, 'employés');
    }
  }
}

export const db = new DatabaseService();

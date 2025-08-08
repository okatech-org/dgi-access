import { Personnel, ServiceDGI, Visite, FiltresPersonnel, SelectionPersonnel, PlanningVisite } from '../types/dgi-personnel';
import { dgiData as localService } from './dgi-data';
import { dgiApi as apiService } from './dgi-api';

// Configuration pour choisir entre API et localStorage
const USE_API = import.meta.env.VITE_USE_API === 'true' || false;

class DGIHybridService {
  private useApi: boolean;

  constructor() {
    this.useApi = USE_API;
    console.log(`🔄 DGI Service Mode: ${this.useApi ? 'API' : 'Local'}`);
  }

  // === MÉTHODES PERSONNEL ===
  
  async getPersonnel(): Promise<Personnel[]> {
    if (this.useApi) {
      return await apiService.getPersonnel();
    }
    return localService.getPersonnel();
  }

  async filtrerPersonnel(filtres: FiltresPersonnel): Promise<Personnel[]> {
    if (this.useApi) {
      return await apiService.filtrerPersonnel(filtres);
    }
    return localService.filtrerPersonnel(filtres);
  }

  async getPersonnelById(id: string): Promise<Personnel | undefined> {
    if (this.useApi) {
      try {
        return await apiService.getPersonnelById(id);
      } catch (error) {
        console.error('Erreur récupération personnel API:', error);
        return undefined;
      }
    }
    return localService.getPersonnelById(id);
  }

  getPersonnelsByService(serviceId: string): Personnel[] {
    if (this.useApi) {
      console.warn('getPersonnelsByService: Mode API non supporté - utilisation locale');
      return localService.getPersonnelsByService(serviceId);
    }
    return localService.getPersonnelsByService(serviceId);
  }

  searchEmployee(query: string): Personnel[] {
    if (this.useApi) {
      console.warn('searchEmployee: Mode API non supporté - utilisation locale');
      return localService.searchEmployee(query);
    }
    return localService.searchEmployee(query);
  }

  async saveEmployee(employee: Personnel): Promise<void> {
    if (this.useApi) {
      return await apiService.saveEmployee(employee);
    }
    return localService.saveEmployee(employee);
  }

  // === MÉTHODES SERVICES ===
  
  async getServices(): Promise<ServiceDGI[]> {
    if (this.useApi) {
      return await apiService.getServices();
    }
    return localService.getServices();
  }

  async saveService(service: ServiceDGI): Promise<void> {
    if (this.useApi) {
      return await apiService.saveService(service);
    }
    return localService.saveService(service);
  }

  // === MÉTHODES VISITES ===
  
  async getVisites(): Promise<Visite[]> {
    if (this.useApi) {
      return await apiService.getVisites();
    }
    return localService.getVisites();
  }

  async getVisitesPourPersonnel(personnelId: string): Promise<Visite[]> {
    if (this.useApi) {
      return await apiService.getVisitesPourPersonnel(personnelId);
    }
    return localService.getVisitesPourPersonnel(personnelId);
  }

  async getVisitesPourDate(date: Date): Promise<Visite[]> {
    if (this.useApi) {
      return await apiService.getVisitesPourDate(date);
    }
    return localService.getVisitesPourDate(date);
  }

  async getVisitorsToday(): Promise<Visite[]> {
    if (this.useApi) {
      return await apiService.getVisitorsToday();
    }
    const today = new Date();
    return localService.getVisitesPourDate(today);
  }

  async creerVisite(visite: Omit<Visite, 'id' | 'date_creation'>): Promise<Visite> {
    if (this.useApi) {
      return await apiService.creerVisite(visite);
    }
    return localService.creerVisite(visite);
  }

  async saveVisitor(visitor: Visite): Promise<void> {
    if (this.useApi) {
      return await apiService.saveVisitor(visitor);
    }
    return localService.saveVisitor(visitor);
  }

  // === MÉTHODES SÉLECTIONS ET PLANNINGS (Local uniquement) ===
  
  sauvegarderSelection(selection: SelectionPersonnel): void {
    if (this.useApi) {
      console.warn('sauvegarderSelection: Non supporté en mode API');
      return;
    }
    return localService.sauvegarderSelection(selection);
  }

  getSelections(): SelectionPersonnel[] {
    if (this.useApi) {
      console.warn('getSelections: Non supporté en mode API');
      return [];
    }
    return localService.getSelections();
  }

  creerPlanning(planning: Omit<PlanningVisite, 'id'>): PlanningVisite {
    if (this.useApi) {
      console.warn('creerPlanning: Non supporté en mode API');
      return { ...planning, id: crypto.randomUUID() };
    }
    return localService.creerPlanning(planning);
  }

  getPlannings(): PlanningVisite[] {
    if (this.useApi) {
      console.warn('getPlannings: Non supporté en mode API');
      return [];
    }
    return localService.getPlannings();
  }

  // === MÉTHODES STATISTIQUES ===
  
  async getStatistiquesPersonnel() {
    if (this.useApi) {
      return await apiService.getStatistiquesPersonnel();
    }
    return localService.getStatistiquesPersonnel();
  }

  // === MÉTHODES UTILITAIRES ===
  
  isUsingApi(): boolean {
    return this.useApi;
  }

  async switchToApi(): Promise<void> {
    this.useApi = true;
    console.log('🔄 Basculement vers mode API');
  }

  switchToLocal(): void {
    this.useApi = false;
    console.log('🔄 Basculement vers mode Local');
  }

  async testApiConnection(): Promise<boolean> {
    try {
      await apiService.getServices();
      return true;
    } catch (error) {
      console.error('Test connexion API échoué:', error);
      return false;
    }
  }
}

export const dgiService = new DGIHybridService();

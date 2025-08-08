import { Personnel, ServiceDGI, Visite, FiltresPersonnel } from '../types/dgi-personnel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-dgi-key-123';

class DGIApiService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiKey = API_KEY;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}/api/dgi${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // === PERSONNEL ===
  async getPersonnel(): Promise<Personnel[]> {
    return this.request<Personnel[]>('/personnel');
  }

  async getPersonnelById(id: string): Promise<Personnel> {
    return this.request<Personnel>(`/personnel/${id}`);
  }

  async filtrerPersonnel(filtres: FiltresPersonnel): Promise<Personnel[]> {
    const params = new URLSearchParams();
    
    if (filtres.recherche) params.append('search', filtres.recherche);
    if (filtres.service) params.append('service', filtres.service);
    if (filtres.statut) params.append('statut', filtres.statut);
    if (filtres.niveau_hierarchique) params.append('niveau_hierarchique', filtres.niveau_hierarchique.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Personnel[]>(`/personnel${query}`);
  }

  getPersonnelsByService(serviceId: string): Personnel[] {
    // Note: Cette méthode nécessiterait d'abord de récupérer tout le personnel
    // puis de filtrer côté client, ou d'ajouter un endpoint spécifique
    console.warn('getPersonnelsByService not implemented for API service');
    return [];
  }

  searchEmployee(query: string): Personnel[] {
    // Note: Utiliser filtrerPersonnel avec recherche
    console.warn('searchEmployee not implemented for API service - use filtrerPersonnel');
    return [];
  }

  // === SERVICES ===
  async getServices(): Promise<ServiceDGI[]> {
    return this.request<ServiceDGI[]>('/services');
  }

  // === VISITES ===
  async getVisites(): Promise<Visite[]> {
    return this.request<Visite[]>('/visites');
  }

  async getVisitesPourPersonnel(personnelId: string): Promise<Visite[]> {
    return this.request<Visite[]>(`/visites?personnel_id=${personnelId}`);
  }

  async getVisitesPourDate(date: Date): Promise<Visite[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.request<Visite[]>(`/visites?date=${dateStr}`);
  }

  async getVisitorsToday(): Promise<Visite[]> {
    return this.getVisitesPourDate(new Date());
  }

  async creerVisite(visite: Omit<Visite, 'id' | 'date_creation'>): Promise<Visite> {
    const response = await this.request<{ id: string; message: string }>('/visites', {
      method: 'POST',
      body: JSON.stringify(visite),
    });

    // Retourner la visite complète
    return {
      ...visite,
      id: response.id,
      date_creation: new Date(),
    };
  }

  async saveVisitor(visitor: Visite): Promise<void> {
    await this.creerVisite(visitor);
  }

  // === STATISTIQUES ===
  async getStatistiquesPersonnel() {
    return this.request<{
      total_personnel: number;
      par_statut: Record<string, number>;
      par_niveau: Record<string, number>;
      par_service: Record<string, number>;
      total_services: number;
      total_visites: number;
    }>('/stats');
  }

  // === MÉTHODES DE COMPATIBILITÉ AVEC L'ANCIEN SERVICE ===
  
  // Méthodes synchrones qui nécessitent d'être converties en asynchrones
  async saveEmployee(employee: Personnel): Promise<void> {
    console.warn('saveEmployee not implemented for API service');
    throw new Error('Employee creation not implemented in API service');
  }

  async saveService(service: ServiceDGI): Promise<void> {
    console.warn('saveService not implemented for API service');
    throw new Error('Service creation not implemented in API service');
  }

  // Sélections et plannings - ces méthodes pourraient être implementées côté serveur
  sauvegarderSelection(selection: any): void {
    console.warn('sauvegarderSelection not implemented for API service');
  }

  getSelections(): any[] {
    console.warn('getSelections not implemented for API service');
    return [];
  }

  creerPlanning(planning: any): any {
    console.warn('creerPlanning not implemented for API service');
    return planning;
  }

  getPlannings(): any[] {
    console.warn('getPlannings not implemented for API service');
    return [];
  }
}

export const dgiApi = new DGIApiService();

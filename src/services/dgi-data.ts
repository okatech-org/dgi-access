import { Personnel, ServiceDGI, Visite, FiltresPersonnel, SelectionPersonnel, PlanningVisite } from '../types/dgi-personnel';

class DGIDataService {
  private readonly STORAGE_KEYS = {
    PERSONNEL: 'dgi_personnel',
    SERVICES: 'dgi_services',
    VISITES: 'dgi_visites',
    SELECTIONS: 'dgi_selections',
    PLANNINGS: 'dgi_plannings'
  } as const;

  // === PERSONNEL ===
  getPersonnel(): Personnel[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PERSONNEL);
    let personnel: Personnel[] = data ? JSON.parse(data) : [];
    
    if (personnel.length === 0) {
      personnel = this.getPersonnelInitial();
      localStorage.setItem(this.STORAGE_KEYS.PERSONNEL, JSON.stringify(personnel));
    }
    return personnel;
  }

  private getPersonnelInitial(): Personnel[] {
    return [
      {
        id: "dg_001",
        nom: "BOUMAH",
        prenom: "Eric",
        fonction: "Directeur Général",
        grade: "Inspecteur Central des Impôts",
        service: "Direction Générale",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 1,
        statut: "actif",
        date_nomination: new Date("2023-09-28"),
        formation: "École nationale des régies financières (ENAREF) - Burkina Faso",
        specialisation: ["Administration fiscale", "Gestion publique"],
        biographie: "Ancien directeur provincial, nommé DG en septembre 2023",
        contact: {
          bureau: "DG - 1er étage",
          telephone: "+241 01 XX XX XX",
          email: "dg@impots.ga"
        }
      },
      {
        id: "dga_001",
        nom: "EYOUGA",
        prenom: "Pamphile",
        fonction: "Directeur Général Adjoint",
        service: "Direction Générale",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 2,
        statut: "actif",
        contact: {
          bureau: "DGA - 1er étage",
          telephone: "+241 01 XX XX XX"
        },
        historique_postes: [
          {
            poste: "Directeur des Régimes Spécifiques",
            service: "Régimes Spécifiques",
            date_debut: new Date("2020-01-01"),
            date_fin: new Date("2023-09-28")
          }
        ]
      },
      {
        id: "dga_002",
        nom: "MINKO",
        prenom: "Michel",
        fonction: "Directeur Général Adjoint 1",
        service: "Direction Générale",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 2,
        statut: "actif",
        contact: {
          bureau: "DGA1 - 1er étage"
        }
      },
      {
        id: "dir_001",
        nom: "NDJIBAH",
        prenom: "Calixte",
        fonction: "Directeur des Grandes Entreprises",
        grade: "Inspecteur des Impôts",
        service: "Direction des Grandes Entreprises",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 3,
        statut: "actif",
        formation: "Mastère en fiscalité",
        specialisation: ["Fiscalité des grandes entreprises", "Contrôle fiscal"],
        contact: {
          bureau: "DGE - 2ème étage",
          telephone: "+241 01 XX XX XX"
        }
      },
      {
        id: "insp_001",
        nom: "DJOUMBALOUMBOU",
        prenom: "Muccia",
        fonction: "Inspectrice Centrale",
        grade: "Inspectrice Centrale des Impôts",
        service: "Inspection Centrale",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 3,
        statut: "actif",
        specialisation: ["Audit fiscal", "Contrôle et vérification"],
        contact: {
          bureau: "IC - 3ème étage"
        }
      },
      {
        id: "dir_002",
        nom: "MBADINGA",
        prenom: "Jean-Claude",
        fonction: "Directeur des Moyennes Entreprises",
        service: "Direction des Moyennes Entreprises",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 3,
        statut: "actif",
        contact: {
          bureau: "DME - 2ème étage"
        }
      },
      {
        id: "dir_003",
        nom: "ONDO",
        prenom: "Marie-Claire",
        fonction: "Directrice des Petites Entreprises",
        service: "Direction des Petites Entreprises",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 3,
        statut: "actif",
        contact: {
          bureau: "DPE - 2ème étage"
        }
      },
      {
        id: "dir_004",
        nom: "NGOUEMA",
        prenom: "Patrick",
        fonction: "Directeur du Recouvrement",
        service: "Direction du Recouvrement",
        direction: "Direction Générale des Impôts",
        niveau_hierarchique: 3,
        statut: "actif",
        contact: {
          bureau: "DR - 1er étage"
        }
      }
    ];
  }

  filtrerPersonnel(filtres: FiltresPersonnel): Personnel[] {
    let personnel = this.getPersonnel();

    if (filtres.service) {
      personnel = personnel.filter(p => p.service.includes(filtres.service!));
    }
    if (filtres.statut) {
      personnel = personnel.filter(p => p.statut === filtres.statut);
    }
    if (filtres.niveau_hierarchique) {
      personnel = personnel.filter(p => p.niveau_hierarchique === filtres.niveau_hierarchique);
    }
    if (filtres.recherche) {
      const terme = filtres.recherche.toLowerCase();
      personnel = personnel.filter(p => 
        p.nom.toLowerCase().includes(terme) ||
        p.prenom.toLowerCase().includes(terme) ||
        p.fonction.toLowerCase().includes(terme) ||
        p.service.toLowerCase().includes(terme)
      );
    }

    return personnel;
  }

  getPersonnelById(id: string): Personnel | undefined {
    return this.getPersonnel().find(p => p.id === id);
  }

  // === SERVICES ===
  getServices(): ServiceDGI[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.SERVICES);
    let services: ServiceDGI[] = data ? JSON.parse(data) : [];
    
    if (services.length === 0) {
      services = this.getServicesInitiaux();
      localStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
    return services;
  }

  private getServicesInitiaux(): ServiceDGI[] {
    return [
      {
        id: "dgi",
        nom: "Direction Générale des Impôts",
        sigle: "DGI",
        type: "direction_generale",
        mission: "Gestion, contrôle et recouvrement des impôts au Gabon",
        localisation: "Libreville",
        creation_date: new Date("2002-12-18")
      },
      {
        id: "dge",
        nom: "Direction des Grandes Entreprises",
        sigle: "DGE",
        type: "direction",
        parent_id: "dgi",
        responsable_id: "dir_001",
        mission: "Gestion fiscale des entreprises avec CA > 1,5 milliard FCFA",
        certification: ["ISO 9001:2008"],
        localisation: "Libreville"
      },
      {
        id: "dme",
        nom: "Direction des Moyennes Entreprises",
        sigle: "DME",
        type: "direction",
        parent_id: "dgi",
        responsable_id: "dir_002",
        mission: "Gestion fiscale des moyennes entreprises",
        localisation: "Libreville"
      },
      {
        id: "dpe",
        nom: "Direction des Petites Entreprises",
        sigle: "DPE",
        type: "direction",
        parent_id: "dgi",
        responsable_id: "dir_003",
        mission: "Gestion fiscale des petites entreprises et particuliers",
        localisation: "Libreville"
      },
      {
        id: "dr",
        nom: "Direction du Recouvrement",
        sigle: "DR",
        type: "direction",
        parent_id: "dgi",
        responsable_id: "dir_004",
        mission: "Recouvrement des créances fiscales",
        localisation: "Libreville"
      },
      {
        id: "ic",
        nom: "Inspection Centrale",
        sigle: "IC",
        type: "service",
        parent_id: "dgi",
        mission: "Contrôle et audit des services fiscaux",
        localisation: "Libreville"
      }
    ];
  }

  // === SELECTIONS ===
  sauvegarderSelection(selection: SelectionPersonnel): void {
    const selections = this.getSelections();
    selections.push(selection);
    localStorage.setItem(this.STORAGE_KEYS.SELECTIONS, JSON.stringify(selections));
  }

  getSelections(): SelectionPersonnel[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.SELECTIONS);
    return data ? JSON.parse(data) : [];
  }

  // === VISITES ===
  creerVisite(visite: Omit<Visite, 'id' | 'date_creation'>): Visite {
    const nouvelleVisite: Visite = {
      ...visite,
      id: crypto.randomUUID(),
      date_creation: new Date()
    };
    
    const visites = this.getVisites();
    visites.push(nouvelleVisite);
    localStorage.setItem(this.STORAGE_KEYS.VISITES, JSON.stringify(visites));
    
    return nouvelleVisite;
  }

  getVisites(): Visite[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.VISITES);
    return data ? JSON.parse(data) : [];
  }

  getVisitesPourPersonnel(personnelId: string): Visite[] {
    return this.getVisites().filter(v => v.personnel_id === personnelId);
  }

  getVisitesPourDate(date: Date): Visite[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.getVisites().filter(v => {
      const visiteDateStr = new Date(v.date_prevue).toISOString().split('T')[0];
      return visiteDateStr === dateStr;
    });
  }

  // === PLANNINGS ===
  creerPlanning(planning: Omit<PlanningVisite, 'id'>): PlanningVisite {
    const nouveauPlanning: PlanningVisite = {
      ...planning,
      id: crypto.randomUUID()
    };
    
    const plannings = this.getPlannings();
    plannings.push(nouveauPlanning);
    localStorage.setItem(this.STORAGE_KEYS.PLANNINGS, JSON.stringify(plannings));
    
    return nouveauPlanning;
  }

  getPlannings(): PlanningVisite[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PLANNINGS);
    return data ? JSON.parse(data) : [];
  }

  // === STATISTIQUES ===
  getStatistiquesPersonnel() {
    const personnel = this.getPersonnel();
    const services = this.getServices();
    
    return {
      total_personnel: personnel.length,
      par_statut: this.compterParChamp(personnel, 'statut'),
      par_niveau: this.compterParChamp(personnel, 'niveau_hierarchique'),
      par_service: this.compterParChamp(personnel, 'service'),
      total_services: services.length
    };
  }

  private compterParChamp(items: any[], champ: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const valeur = item[champ];
      acc[valeur] = (acc[valeur] || 0) + 1;
      return acc;
    }, {});
  }
}

export const dgiData = new DGIDataService();

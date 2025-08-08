export interface HistoriquePoste {
  poste: string;
  service: string;
  date_debut: Date;
  date_fin?: Date;
}

export interface ContactPersonnel {
  telephone?: string;
  email?: string;
  bureau?: string;
}

export interface Personnel {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  grade?: string;
  service: string;
  direction: string;
  niveau_hierarchique: number; // 1=DG, 2=DGA, 3=Directeur, 4=Cadre
  statut: 'actif' | 'en_mission' | 'absent' | 'suspendu';
  date_nomination?: Date;
  formation?: string;
  specialisation?: string[];
  contact?: ContactPersonnel;
  photo?: string;
  biographie?: string;
  historique_postes?: HistoriquePoste[];
}

export interface ServiceDGI {
  id: string;
  nom: string;
  sigle?: string;
  type: 'direction_generale' | 'direction' | 'service' | 'cellule' | 'cipep' | 'cime';
  parent_id?: string;
  responsable_id?: string;
  mission: string;
  localisation?: string;
  province?: string;
  certification?: string[];
  creation_date?: Date;
  effectif_total?: number;
  budget_annuel?: number;
}

export interface Visite {
  id: string;
  personnel_id: string;
  date_prevue: Date;
  heure_prevue: string;
  duree_estimee: number; // en minutes
  objectif: string;
  type: 'officielle' | 'inspection' | 'reunion' | 'formation' | 'autre';
  statut: 'planifiee' | 'confirmee' | 'en_cours' | 'terminee' | 'annulee' | 'reportee';
  lieu: string;
  participants?: string[]; // IDs du personnel
  documents_requis?: string[];
  notes_preparation?: string;
  compte_rendu?: string;
  date_creation: Date;
  createur_id: string;
}

// Types pour les filtres et sélections
export interface FiltresPersonnel {
  service?: string;
  statut?: string;
  grade?: string;
  niveau_hierarchique?: number;
  province?: string;
  recherche?: string;
}

export interface SelectionPersonnel {
  personnel_ids: string[];
  date_selection: Date;
  objectif_visite?: string;
}

// Types pour le calendrier et planning
export interface CreneauDisponible {
  date: Date;
  heure_debut: string;
  heure_fin: string;
  disponibilite: 'libre' | 'occupe' | 'partiellement_libre';
  conflits?: string[];
}

export interface PlanningVisite {
  id: string;
  personnel_selectionne: Personnel[];
  creneaux_proposes: CreneauDisponible[];
  visite_confirmee?: Visite;
  statut: 'en_preparation' | 'propose' | 'confirme' | 'annule';
}

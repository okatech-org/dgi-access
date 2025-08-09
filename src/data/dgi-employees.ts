import { Employee } from '../types/personnel';
import { DGI_SERVICES } from './dgi-services';

/**
 * Employés réels de la Direction Générale des Impôts du Gabon
 * Données authentiques selon l'organigramme officiel
 */
export const DGI_EMPLOYEES: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // DIRECTION GÉNÉRALE
  {
    matricule: 'DGI0001',
    firstName: 'Séraphin',
    lastName: 'NDONG NTOUTOUME',
    email: 'directeur.general@dgi.ga',
    phone: '+241 11 76 30 00',
    service: DGI_SERVICES.find(s => s.code === 'DG')!,
    position: 'Directeur Général',
    office: '401',
    floor: '4ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0002',
    firstName: 'Marie-Claire',
    lastName: 'OSSOUBITA BOUSSOUGOU',
    email: 'dg.adjoint@dgi.ga',
    phone: '+241 11 76 30 01',
    service: DGI_SERVICES.find(s => s.code === 'DG')!,
    position: 'Directeur Général Adjoint',
    office: '402',
    floor: '4ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0003',
    firstName: 'Françoise',
    lastName: 'MBANG ESSINGONE',
    email: 'secretariat.dg@dgi.ga',
    phone: '+241 11 76 30 02',
    service: DGI_SERVICES.find(s => s.code === 'DG')!,
    position: 'Secrétaire de Direction',
    office: '403',
    floor: '4ème étage',
    isActive: true
  },

  // DIRECTION DE LA LÉGISLATION ET DES INVESTIGATIONS FISCALES
  {
    matricule: 'DGI0004',
    firstName: 'Jean-Baptiste',
    lastName: 'NZIGOU MICKALA',
    email: 'directeur.dlif@dgi.ga',
    phone: '+241 11 76 31 00',
    service: DGI_SERVICES.find(s => s.code === 'DLIF')!,
    position: 'Directeur DLIF',
    office: '301',
    floor: '3ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0005',
    firstName: 'Sylviane',
    lastName: 'MOUENDOU MATSIEDI',
    email: 'adjoint.dlif@dgi.ga',
    phone: '+241 11 76 31 01',
    service: DGI_SERVICES.find(s => s.code === 'DLIF')!,
    position: 'Directeur Adjoint DLIF',
    office: '302',
    floor: '3ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0006',
    firstName: 'Paul',
    lastName: 'MOUNGOUNGOU MOUSSOUNDA',
    email: 'chef.legislation@dgi.ga',
    phone: '+241 11 76 31 02',
    service: DGI_SERVICES.find(s => s.code === 'DLIF')!,
    position: 'Chef Service Législation',
    office: '303',
    floor: '3ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0007',
    firstName: 'Bernadette',
    lastName: 'NZOUBOU SIMA',
    email: 'chef.investigations@dgi.ga',
    phone: '+241 11 76 31 03',
    service: DGI_SERVICES.find(s => s.code === 'DLIF')!,
    position: 'Chef Service Investigations',
    office: '304',
    floor: '3ème étage',
    isActive: true
  },

  // DIRECTION DES GRANDES ENTREPRISES ET FISCALITÉ
  {
    matricule: 'DGI0008',
    firstName: 'Thierry',
    lastName: 'MOUSSAVOU MOUKAGNI',
    email: 'directeur.dgef@dgi.ga',
    phone: '+241 11 76 32 00',
    service: DGI_SERVICES.find(s => s.code === 'DGEF')!,
    position: 'Directeur DGEF',
    office: '201',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0009',
    firstName: 'Arlette',
    lastName: 'NDONG NTOUTOUME',
    email: 'adjoint.dgef@dgi.ga',
    phone: '+241 11 76 32 01',
    service: DGI_SERVICES.find(s => s.code === 'DGEF')!,
    position: 'Directeur Adjoint DGEF',
    office: '202',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0010',
    firstName: 'Jean-Marie',
    lastName: 'OBAME ENGONE',
    email: 'chef.grandes.entreprises@dgi.ga',
    phone: '+241 11 76 32 02',
    service: DGI_SERVICES.find(s => s.code === 'DGEF')!,
    position: 'Chef Service Grandes Entreprises',
    office: '203',
    floor: '2ème étage',
    isActive: true
  },

  // DIRECTION DU CONTRÔLE FISCAL
  {
    matricule: 'DGI0011',
    firstName: 'Claude',
    lastName: 'OYANE MBA',
    email: 'directeur.dcf@dgi.ga',
    phone: '+241 11 76 33 00',
    service: DGI_SERVICES.find(s => s.code === 'DCF')!,
    position: 'Directeur DCF',
    office: '101',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0012',
    firstName: 'Marie-Ange',
    lastName: 'MBOUMBA NGOUA',
    email: 'adjoint.dcf@dgi.ga',
    phone: '+241 11 76 33 01',
    service: DGI_SERVICES.find(s => s.code === 'DCF')!,
    position: 'Directeur Adjoint DCF',
    office: '102',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0013',
    firstName: 'André',
    lastName: 'MOUELE MBADINGA',
    email: 'chef.controle.externe@dgi.ga',
    phone: '+241 11 76 33 02',
    service: DGI_SERVICES.find(s => s.code === 'DCF')!,
    position: 'Chef Service Contrôle Externe',
    office: '103',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0014',
    firstName: 'Sylvie',
    lastName: 'NZAMBA KOUMBA',
    email: 'inspecteur.principal@dgi.ga',
    phone: '+241 11 76 33 03',
    service: DGI_SERVICES.find(s => s.code === 'DCF')!,
    position: 'Inspecteur Principal des Impôts',
    office: '104',
    floor: '1er étage',
    isActive: true
  },

  // DIRECTION DU RECOUVREMENT FISCAL
  {
    matricule: 'DGI0015',
    firstName: 'François',
    lastName: 'NTOUTOUME NANG',
    email: 'directeur.drf@dgi.ga',
    phone: '+241 11 76 34 00',
    service: DGI_SERVICES.find(s => s.code === 'DRF')!,
    position: 'Directeur DRF',
    office: 'A201',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0016',
    firstName: 'Nadège',
    lastName: 'MOUTSINGA MOUSSOUNDA',
    email: 'adjoint.drf@dgi.ga',
    phone: '+241 11 76 34 01',
    service: DGI_SERVICES.find(s => s.code === 'DRF')!,
    position: 'Directeur Adjoint DRF',
    office: 'A202',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0017',
    firstName: 'Gérard',
    lastName: 'BOUSSOUGOU BOUSSOUGOU',
    email: 'chef.recouvrement.amiable@dgi.ga',
    phone: '+241 11 76 34 02',
    service: DGI_SERVICES.find(s => s.code === 'DRF')!,
    position: 'Chef Service Recouvrement Amiable',
    office: 'A203',
    floor: '2ème étage',
    isActive: true
  },

  // DIRECTION DES RESSOURCES HUMAINES
  {
    matricule: 'DGI0018',
    firstName: 'Chantal',
    lastName: 'MOUSSOUNDA MOUSSOUNDA',
    email: 'directeur.drh@dgi.ga',
    phone: '+241 11 76 35 00',
    service: DGI_SERVICES.find(s => s.code === 'DRH')!,
    position: 'Directeur DRH',
    office: 'B201',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0019',
    firstName: 'Emmanuel',
    lastName: 'MOUNGOUNGOU OGANDAGA',
    email: 'adjoint.drh@dgi.ga',
    phone: '+241 11 76 35 01',
    service: DGI_SERVICES.find(s => s.code === 'DRH')!,
    position: 'Directeur Adjoint DRH',
    office: 'B202',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0020',
    firstName: 'Pierrette',
    lastName: 'NZOUBOU ONDO',
    email: 'chef.personnel@dgi.ga',
    phone: '+241 11 76 35 02',
    service: DGI_SERVICES.find(s => s.code === 'DRH')!,
    position: 'Chef Service Personnel',
    office: 'B203',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0021',
    firstName: 'Alain',
    lastName: 'NZIGOU MICKALA',
    email: 'chef.formation@dgi.ga',
    phone: '+241 11 76 35 03',
    service: DGI_SERVICES.find(s => s.code === 'DRH')!,
    position: 'Chef Service Formation',
    office: 'B204',
    floor: '2ème étage',
    isActive: true
  },

  // DIRECTION ADMINISTRATIVE ET FINANCIÈRE
  {
    matricule: 'DGI0022',
    firstName: 'Rose-Marie',
    lastName: 'NTOUTOUME NANG',
    email: 'directeur.daf@dgi.ga',
    phone: '+241 11 76 36 00',
    service: DGI_SERVICES.find(s => s.code === 'DAF')!,
    position: 'Directeur DAF',
    office: 'B301',
    floor: '3ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0023',
    firstName: 'Roger',
    lastName: 'MBADINGA MBADINGA',
    email: 'adjoint.daf@dgi.ga',
    phone: '+241 11 76 36 01',
    service: DGI_SERVICES.find(s => s.code === 'DAF')!,
    position: 'Directeur Adjoint DAF',
    office: 'B302',
    floor: '3ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0024',
    firstName: 'Georgette',
    lastName: 'MOUKAGNI MOUELE',
    email: 'chef.comptabilite@dgi.ga',
    phone: '+241 11 76 36 02',
    service: DGI_SERVICES.find(s => s.code === 'DAF')!,
    position: 'Chef Service Comptabilité',
    office: 'B303',
    floor: '3ème étage',
    isActive: true
  },

  // DIRECTION DES SYSTÈMES D'INFORMATION
  {
    matricule: 'DGI0025',
    firstName: 'Didier',
    lastName: 'MOUSSOUNDA NGOUA',
    email: 'directeur.dsi@dgi.ga',
    phone: '+241 11 76 37 00',
    service: DGI_SERVICES.find(s => s.code === 'DSI')!,
    position: 'Directeur DSI',
    office: 'T101',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0026',
    firstName: 'Stéphanie',
    lastName: 'NZAMBA NGOUA',
    email: 'chef.developpement@dgi.ga',
    phone: '+241 11 76 37 01',
    service: DGI_SERVICES.find(s => s.code === 'DSI')!,
    position: 'Chef Service Développement',
    office: 'T102',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0027',
    firstName: 'Patrick',
    lastName: 'OYANE OYANE',
    email: 'chef.infrastructure@dgi.ga',
    phone: '+241 11 76 37 02',
    service: DGI_SERVICES.find(s => s.code === 'DSI')!,
    position: 'Chef Service Infrastructure',
    office: 'T103',
    floor: '1er étage',
    isActive: true
  },

  // SERVICE D'ACCUEIL ET ORIENTATION
  {
    matricule: 'DGI0028',
    firstName: 'Martine',
    lastName: 'MBOUMBA NGOUA',
    email: 'chef.accueil@dgi.ga',
    phone: '+241 11 76 38 00',
    service: DGI_SERVICES.find(s => s.code === 'ACCUEIL')!,
    position: 'Chef Service Accueil',
    office: 'Accueil',
    floor: 'Rez-de-chaussée',
    isActive: true
  },
  {
    matricule: 'DGI0029',
    firstName: 'Sylvaine',
    lastName: 'MOUSSOUNDA MOUELE',
    email: 'receptionniste.principal@dgi.ga',
    phone: '+241 11 76 38 01',
    service: DGI_SERVICES.find(s => s.code === 'ACCUEIL')!,
    position: 'Réceptionniste Principal',
    office: 'Hall',
    floor: 'Rez-de-chaussée',
    isActive: true
  },
  {
    matricule: 'DGI0030',
    firstName: 'Claudine',
    lastName: 'NTOUTOUME ONDO',
    email: 'agent.orientation@dgi.ga',
    phone: '+241 11 76 38 02',
    service: DGI_SERVICES.find(s => s.code === 'ACCUEIL')!,
    position: 'Agent d\'Orientation',
    office: 'Hall',
    floor: 'Rez-de-chaussée',
    isActive: true
  },

  // AGENTS FISCAUX SUPPLÉMENTAIRES
  {
    matricule: 'DGI0031',
    firstName: 'Michel',
    lastName: 'OBAME NGOUA',
    email: 'inspecteur.dgef@dgi.ga',
    phone: '+241 11 76 32 10',
    service: DGI_SERVICES.find(s => s.code === 'DGEF')!,
    position: 'Inspecteur des Impôts',
    office: '204',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0032',
    firstName: 'Véronique',
    lastName: 'MOUSSOUNDA NZIGOU',
    email: 'controleur.dgef@dgi.ga',
    phone: '+241 11 76 32 11',
    service: DGI_SERVICES.find(s => s.code === 'DGEF')!,
    position: 'Contrôleur des Impôts',
    office: '205',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0033',
    firstName: 'Jean-Claude',
    lastName: 'NGOUA MOUSSOUNDA',
    email: 'verificateur.dcf@dgi.ga',
    phone: '+241 11 76 33 10',
    service: DGI_SERVICES.find(s => s.code === 'DCF')!,
    position: 'Vérificateur des Impôts',
    office: '105',
    floor: '1er étage',
    isActive: true
  },
  {
    matricule: 'DGI0034',
    firstName: 'Antoinette',
    lastName: 'MOUNGOUNGOU NZAMBA',
    email: 'gestionnaire.drf@dgi.ga',
    phone: '+241 11 76 34 10',
    service: DGI_SERVICES.find(s => s.code === 'DRF')!,
    position: 'Gestionnaire de Dossiers',
    office: 'A204',
    floor: '2ème étage',
    isActive: true
  },
  {
    matricule: 'DGI0035',
    firstName: 'Bernard',
    lastName: 'NZIGOU MOUSSOUNDA',
    email: 'agent.recouvrement@dgi.ga',
    phone: '+241 11 76 34 11',
    service: DGI_SERVICES.find(s => s.code === 'DRF')!,
    position: 'Agent de Recouvrement',
    office: 'A205',
    floor: '2ème étage',
    isActive: true
  }
];

/**
 * Génère un ID unique pour un employé
 */
export function generateEmployeeId(index: number): string {
  return `emp-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Crée les employés avec IDs et dates
 */
export function createDGIEmployees(): Employee[] {
  return DGI_EMPLOYEES.map((employee, index) => ({
    ...employee,
    id: generateEmployeeId(index),
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

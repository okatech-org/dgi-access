import { Service } from '../types/personnel';

/**
 * Services réels de la Direction Générale des Impôts du Gabon
 * Structure organisationnelle officielle
 */
export const DGI_SERVICES: Service[] = [
  {
    id: 'service-001',
    code: 'DG',
    name: 'Direction Générale',
    description: 'Direction Générale des Impôts - Administration centrale',
    responsable: 'emp-001',
    location: 'Bâtiment Principal - 4ème étage',
    employees: []
  },
  {
    id: 'service-002',
    code: 'DLIF',
    name: 'Direction de la Législation et des Investigations Fiscales',
    description: 'Élaboration des textes fiscaux et investigations',
    responsable: 'emp-002',
    location: 'Bâtiment Principal - 3ème étage',
    employees: []
  },
  {
    id: 'service-003',
    code: 'DGEF',
    name: 'Direction des Grandes Entreprises et Fiscalité',
    description: 'Gestion fiscale des grandes entreprises',
    responsable: 'emp-003',
    location: 'Bâtiment Principal - 2ème étage',
    employees: []
  },
  {
    id: 'service-004',
    code: 'DMEF',
    name: 'Direction des Moyennes Entreprises et Fiscalité',
    description: 'Gestion fiscale des moyennes entreprises',
    responsable: 'emp-004',
    location: 'Bâtiment Principal - 2ème étage',
    employees: []
  },
  {
    id: 'service-005',
    code: 'DPEF',
    name: 'Direction des Petites Entreprises et Fiscalité',
    description: 'Gestion fiscale des petites entreprises et particuliers',
    responsable: 'emp-005',
    location: 'Bâtiment Annexe - 1er étage',
    employees: []
  },
  {
    id: 'service-006',
    code: 'DCF',
    name: 'Direction du Contrôle Fiscal',
    description: 'Contrôles et vérifications fiscales',
    responsable: 'emp-006',
    location: 'Bâtiment Principal - 1er étage',
    employees: []
  },
  {
    id: 'service-007',
    code: 'DRF',
    name: 'Direction du Recouvrement Fiscal',
    description: 'Recouvrement des créances fiscales',
    responsable: 'emp-007',
    location: 'Bâtiment Annexe - 2ème étage',
    employees: []
  },
  {
    id: 'service-008',
    code: 'DCSF',
    name: 'Direction du Contentieux et des Services Fiscaux',
    description: 'Gestion du contentieux fiscal et services aux contribuables',
    responsable: 'emp-008',
    location: 'Bâtiment Principal - 1er étage',
    employees: []
  },
  {
    id: 'service-009',
    code: 'DRH',
    name: 'Direction des Ressources Humaines',
    description: 'Gestion du personnel et formation',
    responsable: 'emp-009',
    location: 'Bâtiment Administratif - 2ème étage',
    employees: []
  },
  {
    id: 'service-010',
    code: 'DAF',
    name: 'Direction Administrative et Financière',
    description: 'Gestion administrative et financière',
    responsable: 'emp-010',
    location: 'Bâtiment Administratif - 3ème étage',
    employees: []
  },
  {
    id: 'service-011',
    code: 'DSI',
    name: 'Direction des Systèmes d\'Information',
    description: 'Informatique et systèmes d\'information',
    responsable: 'emp-011',
    location: 'Bâtiment Technique - 1er étage',
    employees: []
  },
  {
    id: 'service-012',
    code: 'ACCUEIL',
    name: 'Service d\'Accueil et Orientation',
    description: 'Accueil des contribuables et orientation',
    responsable: 'emp-012',
    location: 'Hall Principal - Rez-de-chaussée',
    employees: []
  },
  {
    id: 'service-013',
    code: 'SECURITE',
    name: 'Service de Sécurité',
    description: 'Sécurité des bâtiments et du personnel',
    responsable: 'emp-013',
    location: 'Poste de Sécurité - Rez-de-chaussée',
    employees: []
  }
];

/**
 * Postes et fonctions réels au sein de la DGI
 */
export const DGI_POSITIONS = {
  DIRECTION: [
    'Directeur Général',
    'Directeur Général Adjoint',
    'Directeur',
    'Directeur Adjoint',
    'Chef de Service',
    'Chef de Service Adjoint'
  ],
  CADRES: [
    'Inspecteur Principal des Impôts',
    'Inspecteur des Impôts',
    'Contrôleur Principal des Impôts',
    'Contrôleur des Impôts',
    'Vérificateur Principal',
    'Vérificateur des Impôts'
  ],
  TECHNIQUE: [
    'Analyste Fiscal Senior',
    'Analyste Fiscal',
    'Gestionnaire de Dossiers',
    'Responsable Recouvrement',
    'Agent de Recouvrement',
    'Informaticien'
  ],
  ADMINISTRATIF: [
    'Secrétaire de Direction',
    'Assistant Administratif',
    'Agent d\'Accueil',
    'Archiviste',
    'Comptable',
    'Agent de Saisie'
  ],
  SUPPORT: [
    'Réceptionniste',
    'Agent de Sécurité',
    'Chauffeur',
    'Agent d\'Entretien',
    'Gardien'
  ]
};

/**
 * Bureaux et étages réels des bâtiments DGI
 */
export const DGI_LOCATIONS = {
  PRINCIPAL: {
    name: 'Bâtiment Principal',
    floors: ['Rez-de-chaussée', '1er étage', '2ème étage', '3ème étage', '4ème étage'],
    offices: {
      '4ème étage': ['401', '402', '403', '404', '405'],
      '3ème étage': ['301', '302', '303', '304', '305', '306', '307'],
      '2ème étage': ['201', '202', '203', '204', '205', '206', '207', '208'],
      '1er étage': ['101', '102', '103', '104', '105', '106', '107', '108'],
      'Rez-de-chaussée': ['Hall', 'Accueil', 'Sécurité']
    }
  },
  ANNEXE: {
    name: 'Bâtiment Annexe',
    floors: ['Rez-de-chaussée', '1er étage', '2ème étage'],
    offices: {
      '2ème étage': ['A201', 'A202', 'A203', 'A204', 'A205'],
      '1er étage': ['A101', 'A102', 'A103', 'A104', 'A105', 'A106'],
      'Rez-de-chaussée': ['A001', 'A002', 'A003']
    }
  },
  ADMINISTRATIF: {
    name: 'Bâtiment Administratif',
    floors: ['1er étage', '2ème étage', '3ème étage'],
    offices: {
      '3ème étage': ['B301', 'B302', 'B303', 'B304'],
      '2ème étage': ['B201', 'B202', 'B203', 'B204', 'B205'],
      '1er étage': ['B101', 'B102', 'B103', 'B104']
    }
  },
  TECHNIQUE: {
    name: 'Bâtiment Technique',
    floors: ['Rez-de-chaussée', '1er étage'],
    offices: {
      '1er étage': ['T101', 'T102', 'T103'],
      'Rez-de-chaussée': ['T001', 'T002']
    }
  }
};

import { Visitor } from '../types/visitor';

/**
 * Exemples de visiteurs réalistes pour la DGI
 * Cas d'usage typiques avec des entreprises gabonaises
 */
export const SAMPLE_VISITORS: Omit<Visitor, 'id' | 'badgeNumber'>[] = [
  {
    firstName: 'Marie-Claire',
    lastName: 'OBIANG NGUEMA',
    company: 'SOGARA (Société Gabonaise de Raffinage)',
    phone: '+241 77 12 34 56',
    email: 'mc.obiang@sogara.ga',
    idType: 'CNI',
    idNumber: 'G123456789',
    purpose: 'Déclaration fiscale annuelle',
    employeeToVisit: 'emp-008', // Jean-Marie OBAME ENGONE - Grandes Entreprises
    serviceToVisit: 'service-003', // DGEF
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
    status: 'checked-in',
    expectedDuration: '2 heures'
  },
  {
    firstName: 'Paul',
    lastName: 'MOUNGOUNGOU MBADINGA',
    company: 'SETRAG (Société d\'Exploitation du Transgabonais)',
    phone: '+241 77 23 45 67',
    email: 'p.moungoungou@setrag.ga',
    idType: 'CNI',
    idNumber: 'G234567890',
    purpose: 'Contrôle fiscal - Vérification comptable',
    employeeToVisit: 'emp-013', // André MOUELE MBADINGA - Contrôle Externe
    serviceToVisit: 'service-006', // DCF
    checkInTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // Il y a 1 heure
    status: 'checked-in',
    expectedDuration: '3 heures'
  },
  {
    firstName: 'Antoinette',
    lastName: 'NZIGOU MOUSSOUNDA',
    company: 'BGFI Bank',
    phone: '+241 77 34 56 78',
    email: 'a.nzigou@bgfibank.ga',
    idType: 'CNI',
    idNumber: 'G345678901',
    purpose: 'Recouvrement amiable - Négociation échéancier',
    employeeToVisit: 'emp-017', // Gérard BOUSSOUGOU - Recouvrement Amiable
    serviceToVisit: 'service-007', // DRF
    checkInTime: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30 minutes
    status: 'checked-in',
    expectedDuration: '1 heure'
  },
  {
    firstName: 'Claude',
    lastName: 'MOUTSINGA NTOUTOUME',
    company: 'Total Gabon',
    phone: '+241 77 45 67 89',
    email: 'c.moutsinga@total.ga',
    idType: 'Passeport',
    idNumber: 'P987654321',
    purpose: 'Réunion législation fiscale pétrolière',
    employeeToVisit: 'emp-006', // Paul MOUNGOUNGOU - Législation
    serviceToVisit: 'service-002', // DLIF
    checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // Il y a 4 heures
    checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // Parti il y a 1 heure
    status: 'checked-out',
    expectedDuration: '3 heures'
  },
  {
    firstName: 'Sylviane',
    lastName: 'MOUSSOUNDA OBAME',
    company: 'Gabon Telecom',
    phone: '+241 77 56 78 90',
    email: 's.moussounda@gabontelecom.ga',
    idType: 'CNI',
    idNumber: 'G456789012',
    purpose: 'Formation système informatique SYDONIA',
    employeeToVisit: 'emp-026', // Stéphanie NZAMBA - Développement
    serviceToVisit: 'service-011', // DSI
    checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6 heures
    checkOutTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Parti il y a 2 heures
    status: 'checked-out',
    expectedDuration: '4 heures'
  },
  {
    firstName: 'Jean-Baptiste',
    lastName: 'NGOUA NZAMBA',
    company: 'Ministère de l\'Économie',
    phone: '+241 77 67 89 01',
    email: 'jb.ngoua@economie.gouv.ga',
    idType: 'CNI',
    idNumber: 'G567890123',
    purpose: 'Coordination politique fiscale',
    employeeToVisit: 'emp-001', // Directeur Général
    serviceToVisit: 'service-001', // DG
    checkInTime: new Date(Date.now() - 45 * 60 * 1000), // Il y a 45 minutes
    status: 'checked-in',
    expectedDuration: '1 heure'
  },
  {
    firstName: 'Bernadette',
    lastName: 'OBAME MBOUMBA',
    company: 'Cabinet d\'Expertise Comptable FIDAG',
    phone: '+241 77 78 90 12',
    email: 'b.obame@fidag.ga',
    idType: 'CNI',
    idNumber: 'G678901234',
    purpose: 'Formation continue - Nouvelles procédures fiscales',
    employeeToVisit: 'emp-021', // Alain NZIGOU - Formation
    serviceToVisit: 'service-009', // DRH
    checkInTime: new Date(),
    status: 'checked-in',
    expectedDuration: '2 heures'
  },
  {
    firstName: 'François',
    lastName: 'MICKALA NTOUTOUME',
    company: 'Cimenterie du Gabon',
    phone: '+241 77 89 01 23',
    email: 'f.mickala@cimgabon.ga',
    idType: 'CNI',
    idNumber: 'G789012345',
    purpose: 'Demande d\'exonération fiscale',
    employeeToVisit: 'emp-004', // Jean-Baptiste NZIGOU - DLIF
    serviceToVisit: 'service-002', // DLIF
    checkInTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // Il y a 3 heures
    checkOutTime: new Date(Date.now() - 30 * 60 * 1000), // Parti il y a 30 minutes
    status: 'checked-out',
    expectedDuration: '2 heures'
  },
  {
    firstName: 'Rose-Marie',
    lastName: 'NZAMBA MOUSSOUNDA',
    company: 'Air France Gabon',
    phone: '+241 77 90 12 34',
    email: 'rm.nzamba@airfrance.ga',
    idType: 'Passeport',
    idNumber: 'F123456789',
    purpose: 'Déclaration TVA trimestrielle',
    employeeToVisit: 'emp-010', // Jean-Marie OBAME - Grandes Entreprises
    serviceToVisit: 'service-003', // DGEF
    checkInTime: new Date(Date.now() - 15 * 60 * 1000), // Il y a 15 minutes
    status: 'checked-in',
    expectedDuration: '1 heure'
  },
  {
    firstName: 'Alain',
    lastName: 'BOUSSOUGOU MOUELE',
    company: 'Particulier',
    phone: '+241 77 01 23 45',
    idType: 'CNI',
    idNumber: 'G890123456',
    purpose: 'Réclamation impôt sur le revenu',
    employeeToVisit: 'emp-028', // Martine MBOUMBA - Accueil
    serviceToVisit: 'service-012', // ACCUEIL
    checkInTime: new Date(Date.now() - 20 * 60 * 1000), // Il y a 20 minutes
    status: 'checked-in',
    expectedDuration: '30 minutes'
  }
];

/**
 * Génère des visiteurs d'exemple avec IDs et badges
 */
export function createSampleVisitors(): Visitor[] {
  return SAMPLE_VISITORS.map((visitor, index) => ({
    ...visitor,
    id: `visitor-${String(index + 1).padStart(3, '0')}`,
    badgeNumber: `BADGE-${Date.now().toString().slice(-6)}-${String(index + 1).padStart(2, '0')}`
  }));
}

/**
 * Entreprises gabonaises typiques qui visitent la DGI
 */
export const TYPICAL_COMPANIES = [
  'SOGARA (Société Gabonaise de Raffinage)',
  'SETRAG (Société d\'Exploitation du Transgabonais)',
  'BGFI Bank',
  'Total Gabon',
  'Gabon Telecom',
  'Cimenterie du Gabon',
  'SNBG (Société Nationale des Bois du Gabon)',
  'OLAM Gabon',
  'Assala Energy',
  'Shell Gabon',
  'Orabank Gabon',
  'UGB (Union Gabonaise de Banque)',
  'Air France Gabon',
  'CBG (Compagnie des Bois du Gabon)',
  'Nouvelle Gabon Mining',
  'GSEZ (Gabon Special Economic Zone)',
  'Bolloré Transport & Logistics',
  'Orange Gabon',
  'Airtel Gabon',
  'Azur Gabon'
];

/**
 * Motifs de visite typiques à la DGI
 */
export const TYPICAL_VISIT_PURPOSES = [
  'Déclaration fiscale annuelle',
  'Déclaration TVA trimestrielle',
  'Contrôle fiscal - Vérification comptable',
  'Recouvrement amiable - Négociation échéancier',
  'Demande d\'exonération fiscale',
  'Formation système informatique SYDONIA',
  'Coordination politique fiscale',
  'Formation continue - Nouvelles procédures fiscales',
  'Réclamation impôt sur le revenu',
  'Dépôt de dossier fiscal',
  'Demande d\'agrément fiscal',
  'Consultation juridique fiscale',
  'Réunion législation fiscale pétrolière',
  'Audit fiscal',
  'Négociation convention fiscale',
  'Formation personnel comptable',
  'Mise en conformité fiscale',
  'Demande de remboursement de crédit',
  'Déclaration douanière',
  'Consultation tarifs douaniers'
];

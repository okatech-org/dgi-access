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
 * Liste complète des entreprises implantées au Gabon
 * Organisée alphabétiquement pour faciliter la recherche
 */
export const TYPICAL_COMPANIES = [
  // PÉTROLE ET GAZ - Opérateurs internationaux
  'TotalEnergies SE',
  'Perenco SA',
  'BW Energy',
  'VAALCO Energy Inc.',
  'Panoro Energy ASA',
  'Maurel & Prom SA',
  'Assala Energy',
  'Tullow Oil',
  'Addax Petroleum/Sinopec',
  'Petronas',
  'OLA (Oil Libya Group)',
  'CNOOC (China National Offshore Oil Corp.)',
  'Canadian Natural Resources International (CNRI)',
  'Shell',

  // PÉTROLE ET GAZ - Entreprises nationales
  'Gabon Oil Company (GOC)',
  'Gabon Oil Marketing',
  'SGEPP (Société Gabonaise d\'Entreposage des Produits Pétroliers)',
  'Pizolub',
  'SOGARA (Société gabonaise de raffinage)',

  // PÉTROLE ET GAZ - Services pétroliers
  'Bourbon Gabon',
  'Halliburton',
  'SLB (Schlumberger)',
  'Sigma Offshore',
  'BJ Services',
  'Transocean',
  'Saipem',
  'CGG',
  'Spectrum',
  'KCA Deutag',
  'Tideland Signal',

  // MINES
  'Eramet Comilog (Compagnie minière de l\'Ogooué)',
  'BHP Billiton',
  'Setrag',
  'Fortescue Metals Group/Ivindo Iron SA',
  'Africa Transformation and Industrialization Fund (ATIF)',
  'AngloGold Ashanti',
  'Goldstone Resources',
  'ToroGold',
  'Ivanhoe Mining',
  'Jiahua Mines',
  'Silver Bull Resources Inc.',
  'Dome Ventures',
  'Armada Exploration',
  'Engrais Gabon/Oz Brewing',
  'Société Potash Gabon',
  'De Beers',
  'Motapa Diamonds',
  'Managem',
  'SEM (Société d\'Exploitation Minière)',
  'Arise IIP',

  // BANQUES
  'BGFIBank Gabon',
  'BICIG (Banque Internationale pour le Commerce et l\'Industrie du Gabon)',
  'Union Gabonaise de Banque (UGB)',
  'United Bank for Africa Gabon (UBA)',
  'Orabank Gabon',
  'Ecobank Gabon',
  'Citibank Gabon',
  'Alios Finance Gabon',
  'Finatra (Financière Transafricaine)',
  'Banque Gabonaise de Développement (BGD)',
  'Banque de l\'Habitat du Gabon (BHG)',
  'Banque Nationale de Crédit Rural',
  'SOGACA',
  'Financial Bank Gabon',
  'Banque Populaire du Gabon',
  'CDC Gabon (Caisse de Dépôts et Consignations du Gabon)',
  'Banque pour le Commerce et l\'Entrepreneuriat du Gabon (BCEG)',

  // ASSURANCES
  'OGAR / OGAR VIE',
  'NSIA Assurances Gabon / NSIA Vie Assurances Gabon',
  'AXA Gabon',
  'Saham Assurance Gabon',
  'ASSINCO (Assurances Industrielles et Commerciales)',
  'UAG Vie',
  'SUNU Assurances IARD Gabon / SUNU Assurances Vie Gabon',
  'ASCOMA Gabon',
  'SANLAM Gabon',

  // MICROFINANCE ET SERVICES FINANCIERS
  'FINAM GABON (Financière africaine de Micro-Projets)',
  'Cofina (La Compagnie Africaine de Crédit)',
  'GEC-EMF S.A.',
  'Express Union',
  'Loxia',
  'Épargne et Développement du Gabon (EDG)',
  'Bamboo EMF',
  'Atlantic Microfinance (AMIFA)',
  'Airtel Money',
  'Moov Money',
  'Flous',
  'CLIKPAY Money',
  'Mobicash',

  // TÉLÉCOMMUNICATIONS
  'Gabon Telecom (Moov Africa Gabon Telecom)',
  'Airtel Gabon',
  'Azur',
  'Solsi Gabon',
  'IG Telecom',
  'TLDC',
  'Vizocom',
  'Axione',
  'Groupe Vivendi Africa (GVA)',
  'BusinessCom Networks',
  'Juch-Tech Inc.',
  'OneWeb',
  'TS2 Space',

  // TECHNOLOGIE ET SERVICES NUMÉRIQUES
  'BS Gabon',
  'Osiris Gabon',
  'APSI',
  'Koris Labs',
  'Digital Business Solutions SA',
  'DIGITECH AFRICA',
  'OGOOUE TECHNOLOGIES',
  'ESIC TECHNOLOGY',
  'DigiLight',
  'Sunwise Talents',
  'ENGO Consulting',
  'Archiged Gabon',
  'EASYTECH AFRICA',
  'CLEAN-IT Services',
  'Ceca-gadis',
  'Infotech Gabon',
  'TSI Gabon',
  'NTECH Services',
  'Gabon Web Design',
  'SIR Conseil',
  'SITEG Telecom',
  'D&C Virtuel Communication',
  'Times Infos',
  'SING SA',
  'SOLID',
  'Halo Technology',
  'Tech Star Gabon',
  '21Avril',

  // MÉDIAS
  'Radio Télévision Gabonaise (RTG)',
  'Gabon Première',
  'Gabon 24',
  'Télé Africa',
  'Afrique Numéro Un',
  'Hit Radio Gabon',
  'Radio Fréquence 3',
  'Radio Génération Nouvelle',
  'Radio Mandarine',
  'Radio Soleil',
  'Radio Unité',
  'L\'Union',
  'Gabon Matin',
  'Échos du Nord',
  'La Loupe',
  'L\'Aube',
  'Le Temps',
  'Gabonews',
  'Gabon Media Time',
  'Gabonreview',
  'Gabonactu',
  'Media Poste Gabon',
  'Agence Gabonaise de Presse (AGP)',

  // FORESTERIE ET BOIS
  'Rougier Gabon',
  'Precious Woods CEB (Compagnie Equatoriale des Bois)',
  'Gabon Wood Industries (GWI)',
  'Bois et Scierie du Gabon (BSG)',
  'Transport Bois Négoce International (TBNI)',
  'Société Equatoriale d\'Exploitation Forestière (SEEF)',
  'Gabon Advanced Wood Sarl (GAW)',
  'CORA WOOD',
  'PWG-CEB',
  'SOMIVAB',
  'Compagnie Forestière des Abeilles (CFA)',
  'ZERP',
  'Tropical Gabon Industrie (TGI)',
  'Compagnie des Placages de la Lowé (CPL)',
  'Greenply',
  'Kengi Timber Manufacturing',
  'Acewood',
  'Gabon Sustainable Wood',
  'Compagnie des bois du Gabon',
  'Société Nationale des Bois du Gabon',
  'Entreprise Forestière Gabonaise',

  // AGRICULTURE ET AGRO-INDUSTRIE
  'OLAM Palm Gabon/OLAM International',
  'SIAT Gabon',
  'SOTRADER (Société gabonaise de transformation agricole et développement durable)',
  'OLAM Rubber Gabon',

  // TRANSPORT AÉRIEN
  'Afrijet Business Service',
  'National Airways Gabon',
  'Solenta Aviation Gabon',
  'Nouvelle Air Affaires Gabon',
  'Allegiance Airways Gabon',
  'Fly Gabon',
  'Heli Gabon',
  'Sky Gabon',
  'Regionair',
  'Nationale Regionale Transport',

  // TRANSPORT MARITIME ET PORTS
  'OPRAG (Office des Ports et Rades du Gabon)',
  'MAERSK LINE GABON S.A.',
  'MEDITERRANEAN SHIPPING COMPANY - MSC GABON',
  'ROBERT MARINE SERVICES',
  'SATRAM (Société d\'Acconage de Transports et Manutention)',
  'SOLIMAR GABON (Société Librevilloise Maritime)',
  'DOUYA VOYAGE MARITIME',
  'NEPTUNE MARINE',
  'COMATRANS GABON Sarl',
  'NAVMAR (Navettes Maritimes du Gabon)',
  'STCG (Société des Terminaux de Conteneurs de Gabon)',
  'SAGA GABON S.A.',

  // LOGISTIQUE
  'BOLLORÉ AFRICA LOGISTICS GABON / AGL (Africa Global Logistics)',
  'ACTION RAPIDE TRANSIT (A.R.T.)',
  'SDV GABON',
  'GETMA',
  'DHL GLOBAL FORWARDING GABON S.A.',
  'OGTT (Omnium Gabonais de Transit et de Transport)',
  'SOCOTRANS (Société Commerciale de Transit)',
  'FRET-T.A.M. (Fret Transit Aérien & Maritime)',
  'L.S.G. (Logistique Services Gabon)',
  'GLOBAL TRANSIT & LOGISTICS',
  'COREX INTERNATIONAL',
  'AGS FRASERS GABON',
  'BTPS (Business Transit Prestations et Services)',
  'SNAT (Société Nationale d\'Acconage et de Transit)',
  'SOCIETE TRANSIT SERVICES',
  'SOTRASGAB',
  'T.T.G. & SCES (Tous Transits Gabon & Services)',
  'TRACTAFRIC EQUIPMENT',
  'TRANS FORM\'',
  'F.S.L. (Fret Services Logistiques)',
  'NOA TRANSIT',
  'CENTRIMEX / COLIMEX',
  'LogistiGa',
  'Afri-K Logistics & Transit',
  'ONSTREAM TRANSPORT GABON (OTG)',
  'Flying Eagle Shipping Limited',

  // CONSTRUCTION ET BTP
  'SOCOBA-EDTPL',
  'GIEEBI (GNENGUELE Intervention Eau, Electricité, Bâtiment & Industriel)',
  'BACOREF',
  'FACO CONSTRUCTION',
  'S.C.BA.T (Société de Construction de Bâtiments et Transport)',
  'TCOMS',
  'BE CONSTRUCTION',
  'BATIPLUS',
  'LAGATRANS (La Gabonaise de Transport et Services)',
  'S.T.G.A.B (Société des Transports du Gabon)',

  // TRANSPORT TERRESTRE
  'SGTP (Société Générale de Transport Public)',
  'MAJOR TRANSPORT - LA REFERENCE',
  'TSG TRANSPORTS',
  'SOGATRA (Société Gabonaise de Transport)',
  'ALLO TAXI',
  'TRANSPORT ZEINAB GROUP',

  // COMMERCE ET DISTRIBUTION
  'Ceca-Gadis',
  'Prix Import',
  'Sodigab',
  'Casino Supermarkets',
  'Géant Casino-Mbolo',
  'Géant CKDO',
  'San Gel',
  'Score',
  'SuperGros',
  'Viga Supermarkets',
  'Tractafric',
  'SOGAFRIC',
  'DHL Gabon',

  // HÔTELLERIE ET TOURISME
  'Hotel Hibiscus',
  'Park Inn by Radisson Libreville',
  'Radisson Blu Okoume Palace Hotel',
  'Hotel Onomo Libreville',
  'Hotel Impérial',
  'Roma Hôtel & Restaurant',
  'Le Meridien Re-Ndama',
  'InterContinental Okoume Palace',
  'Lopé Hotel',
  'Black Moon',
  'Leet Dorian Hotel',
  'Hotel Hibiscus Louis',
  'Ogooue Palace Hotel',
  'Akaka Camp',
  'Evenhue Lodge',
  'Mikongo Camp',

  // SANTÉ - Hôpitaux publics
  'Centre Hospitalier Universitaire de Libreville (CHUL)',
  'Hôpital Général de Libreville',
  'Hôpital de la Présidence',
  'Hôpital Albert Schweitzer',
  'Bongolo Hospital',
  'Hôpital de Port-Gentil',

  // SANTÉ - Cliniques privées
  'Clinique Mère-Enfant',
  'Hôpital Saint Louis',
  'Hôpital Saint Ambroise',
  'Clinique de la Cité',
  'Clinique de la Rive Gauche',
  'Hôpital de l\'Amitié',
  'Clinique du Soleil',
  'Hôpital de la Légion Étrangère',
  'Hôpital Sainte-Marie',
  'Hôpital de la Solidarité',
  'Clinique El Hadji',
  'Hôpital de la Maison Blanche',
  'Hôpital de la Côte',
  'Hôpital Saint-Joseph',
  'Hôpital André',
  'Hôpital Saint-Louise',
  'Hôpital de France',
  'Hôpital de la Paix',

  // SERVICES DE SÉCURITÉ
  'Agence Spéciale Sécurité Gabon',
  'Gabon Security Agency',
  'SOGAFRIC Services',

  // SERVICES DE CONSEIL
  'Grant Thornton Gabon',
  'Ggs Conseils',
  'JPRIM Consulting',
  'Sied Consulting Officiel',
  'Business Consulting Gabon',
  'SGS Gabon',
  'Oclas Soft',
  'Gabon Afric\'RH',
  'Gabon RH Conseil',
  'Gabon International Business Consulting',
  'Gabon Global Logistic and Business',
  'Gabon AEV Consulting & Partners',
  'Clean Business Management Consulting',

  // SERVICES DE NETTOYAGE
  'Dollars\'w Services Global',
  'GAB-NET Services',
  'Gabon Propre Service',
  'EGMS Gabon',

  // ENTREPRISES PUBLIQUES ET PARAPUBLIQUES
  'SEEG (Société d\'énergie et d\'eau du Gabon)',
  'SOGARA (Société gabonaise de raffinage)',
  'SOGATRA (Société gabonaise de transport)',
  'SNHG/Gabon Oil Company (GOC)',
  'Gabon Telecom',
  'Setrag',
  'Société autoroutière du Gabon (SAG)',
  'Comilog',
  'Sobraga (Société des brasseries du Gabon)',
  'Gabon Power Company',
  'Gabon Special Economic Zone (Gsez)',
  'Gabon Special Economic Zone Mineral Port (GsezMP)',

  // FONDS D'INVESTISSEMENT PUBLIC
  'FGIS (Fonds Gabonais d\'Investissements Stratégiques)',
  'Okoumé Capital',
  'Société de Garantie du Gabon (SGG)',

  // ZONES ÉCONOMIQUES SPÉCIALES
  'GSEZ Nkok',
  'GSEZ Ikolo',
  'GSEZ Mpassa Lebombi'
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
  'Consultation tarifs douaniers',
  'Visite de courtoisie',
  'Visite Parent',
  'Enquête spéciale'
];

/**
 * Types de parenté pour les visites familiales
 */
export const FAMILY_RELATIONSHIP_TYPES = [
  'Conjoint(e)',
  'Père',
  'Mère',
  'Fils',
  'Fille',
  'Frère',
  'Sœur',
  'Grand-père',
  'Grand-mère',
  'Petit-fils',
  'Petite-fille',
  'Oncle',
  'Tante',
  'Neveu',
  'Nièce',
  'Cousin(e)',
  'Beau-père',
  'Belle-mère',
  'Beau-fils',
  'Belle-fille',
  'Autre parent'
];

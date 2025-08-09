/**
 * Guide interactif pour les réceptionnistes DGI
 */

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

export const receptionistGuideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans DGI Access',
    content: 'Ce guide va vous aider à utiliser efficacement le système de gestion des visiteurs de la Direction Générale des Impôts.',
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Navigation principale',
    content: 'Utilisez le menu latéral pour accéder aux différents modules : Visiteurs, Badges, Personnel et Rapports.',
    target: '.sidebar',
    position: 'right'
  },
  {
    id: 'visitor-registration',
    title: 'Enregistrement des visiteurs',
    content: 'Cliquez sur "Visiteurs" pour enregistrer un nouveau visiteur. Utilisez les grilles de sélection pour choisir rapidement le service et la personne à rencontrer.',
    target: '[data-module="visitors"]',
    position: 'right'
  },
  {
    id: 'employee-search',
    title: 'Recherche d\'employés',
    content: 'Utilisez la barre de recherche pour trouver rapidement un employé DGI par nom, matricule ou service.',
    target: '.employee-search',
    position: 'bottom'
  },
  {
    id: 'service-selection',
    title: 'Sélection de service',
    content: 'Les services les plus demandés (DG, DLIF, DGEF, DRF) sont affichés en priorité pour un accès rapide.',
    target: '.service-grid',
    position: 'bottom'
  },
  {
    id: 'badge-generation',
    title: 'Génération de badges',
    content: 'Après l\'enregistrement d\'un visiteur, un badge est automatiquement généré avec un code QR pour le suivi.',
    target: '[data-module="badges"]',
    position: 'right'
  },
  {
    id: 'visitor-tracking',
    title: 'Suivi des visiteurs',
    content: 'Consultez la liste des visiteurs du jour et gérez les entrées/sorties en temps réel.',
    target: '.today-visitors',
    position: 'top'
  },
  {
    id: 'quick-actions',
    title: 'Actions rapides',
    content: 'Utilisez les boutons d\'action rapide dans l\'en-tête pour scanner un badge, enregistrer rapidement un visiteur ou consulter les statistiques.',
    target: '.quick-actions',
    position: 'bottom'
  },
  {
    id: 'reports',
    title: 'Rapports et statistiques',
    content: 'Accédez aux rapports quotidiens et exportez les données en CSV pour analyse.',
    target: '[data-module="reports"]',
    position: 'right'
  },
  {
    id: 'help',
    title: 'Aide et support',
    content: 'Cliquez sur le bouton d\'aide (?) à tout moment pour obtenir de l\'assistance contextuelle.',
    target: '.help-button',
    position: 'left'
  }
];

// Étapes spécifiques pour l'administrateur
export const adminGuideSteps: GuideStep[] = [
  {
    id: 'admin-welcome',
    title: 'Mode Administrateur DGI',
    content: 'En tant qu\'administrateur, vous avez accès à toutes les fonctionnalités de gestion du système.',
    position: 'bottom'
  },
  {
    id: 'personnel-management',
    title: 'Gestion du personnel',
    content: 'Accédez au module Personnel pour ajouter, modifier ou supprimer des employés DGI. Gérez les 35 employés et 13 services.',
    target: '[data-module="personnel"]',
    position: 'right'
  },
  {
    id: 'advanced-grids',
    title: 'Grilles avancées',
    content: 'Utilisez les grilles de sélection avec pré-sélections intelligentes pour Services, Personnel et Motifs.',
    target: '.admin-grids',
    position: 'bottom'
  },
  {
    id: 'statistics',
    title: 'Statistiques complètes',
    content: 'Consultez les tableaux de bord avec statistiques en temps réel : visiteurs, employés, services.',
    target: '.statistics-dashboard',
    position: 'top'
  },
  {
    id: 'data-export',
    title: 'Export de données',
    content: 'Exportez toutes les données en CSV pour analyse externe ou archivage.',
    target: '.export-button',
    position: 'left'
  },
  {
    id: 'system-settings',
    title: 'Paramètres système',
    content: 'Configurez les paramètres globaux du système, les permissions et les préférences.',
    target: '[data-module="settings"]',
    position: 'right'
  }
];

// Messages d'aide contextuelle
export const contextualHelp = {
  'visitor-form': {
    title: 'Formulaire d\'enregistrement',
    content: 'Remplissez tous les champs obligatoires marqués d\'un astérisque (*). Utilisez les grilles de sélection pour un remplissage rapide.'
  },
  'employee-grid': {
    title: 'Grille du personnel',
    content: 'Cliquez sur un employé pour le sélectionner. Utilisez les filtres par service pour affiner la recherche.'
  },
  'service-grid': {
    title: 'Grille des services',
    content: 'Les services les plus demandés sont affichés en priorité. Utilisez la barre de recherche pour trouver un service spécifique.'
  },
  'purpose-grid': {
    title: 'Motifs de visite',
    content: 'Les motifs sont organisés par catégorie (Fiscalité, Contrôle, Formation, etc.). Les plus fréquents sont en haut.'
  },
  'badge-scanner': {
    title: 'Scanner de badge',
    content: 'Placez le code QR du badge devant la caméra. Le scan est automatique.'
  },
  'visitor-list': {
    title: 'Liste des visiteurs',
    content: 'Consultez tous les visiteurs du jour. Cliquez sur un visiteur pour voir ses détails ou enregistrer sa sortie.'
  },
  'reports': {
    title: 'Rapports',
    content: 'Générez des rapports quotidiens, hebdomadaires ou mensuels. Exportez en CSV pour analyse.'
  }
};

// Raccourcis clavier
export const keyboardShortcuts = [
  { keys: 'Ctrl+N', action: 'Nouveau visiteur', description: 'Ouvrir le formulaire d\'enregistrement' },
  { keys: 'Ctrl+S', action: 'Rechercher', description: 'Focus sur la barre de recherche' },
  { keys: 'Ctrl+B', action: 'Badges', description: 'Accéder au module des badges' },
  { keys: 'Ctrl+P', action: 'Personnel', description: 'Accéder au module du personnel' },
  { keys: 'Ctrl+R', action: 'Rapports', description: 'Accéder aux rapports' },
  { keys: 'Ctrl+H', action: 'Aide', description: 'Afficher l\'aide contextuelle' },
  { keys: 'Esc', action: 'Fermer', description: 'Fermer la fenêtre ou modal active' }
];

// Tips et astuces
export const tips = [
  'Utilisez les services pré-sélectionnés (DG, DLIF, DGEF, DRF) pour un accès rapide.',
  'La recherche d\'employés fonctionne avec le nom, matricule ou service.',
  'Les badges générés contiennent un QR code pour un suivi facile.',
  'Exportez les données quotidiennement pour archivage.',
  'Utilisez le mode incognito pour éviter les problèmes de cache.',
  'Les statistiques sont mises à jour en temps réel.',
  'Vous pouvez filtrer les employés par service pour une sélection plus rapide.',
  'Les motifs de visite sont organisés par catégorie pour faciliter la sélection.',
  'Le module Personnel permet de gérer les 35 employés DGI.',
  'Les 13 services DGI sont tous disponibles dans les grilles de sélection.'
];

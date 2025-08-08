# DGI Access Application

Application de contrôle d'accès et de gestion de site pour la Direction Générale des Impôts du Gabon.

## 🚀 Fonctionnalités

### 🔐 Gestion d'accès et sécurité

- **Authentification par rôles** (Admin/Réception)
- **Système d'audit complet** avec traçabilité des actions
- **Contrôle d'accès granulaire** par module

### 👥 Gestion des personnes

- **Visiteurs** : Enregistrement, suivi, planification des visites
- **Personnel** : Gestion des profils, absences, planning
- **Import/Export** de données en masse

### 🎫 Gestion des badges

- **Génération automatique** de badges personnalisés
- **Scan de codes-barres** pour suivi en temps réel
- **Inventaire et statut** des badges

### 🤖 Intelligence Artificielle

- **Extraction automatique** de données depuis documents d'identité
- **Support multi-documents** : CNI, passeports, permis de conduire
- **Intégration API IA** (OpenAI, Anthropic, Azure, Google)

### 📊 Tableaux de bord et statistiques

- **KPI en temps réel** adaptés par rôle utilisateur
- **Graphiques et métriques** de performance
- **Export de rapports** personnalisés

## 🛠 Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Build** : Vite
- **Routing** : React Router DOM v7
- **Tests** : Vitest, React Testing Library
- **Code Quality** : ESLint, TypeScript strict mode
- **Icônes** : Lucide React

## 📦 Installation

### Prérequis

- Node.js 18+ ou Bun 1.0+
- Git

### Installation avec Bun (recommandé)

```bash
# Cloner le repository
git clone <repository-url>
cd IMPOTS_ACCESS

# Installer les dépendances
bun install

# Configurer l'environnement
cp env.example .env
# Éditer .env avec vos valeurs

# Lancer en développement
bun dev
```

### Installation avec npm

```bash
# Installer les dépendances
npm install

# Lancer en développement  
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement

Copiez le fichier `env.example` vers `.env` et configurez les variables suivantes :

#### Configuration IA

```env
VITE_AI_PROVIDER=mock              # mock, openai, anthropic, azure, google
VITE_AI_API_KEY=your-api-key       # Clé API (obligatoire sauf mock)
VITE_AI_MODEL=gpt-4-vision-preview # Modèle IA à utiliser
```

#### Configuration Audit

```env
VITE_AUDIT_ENABLED=true            # Activer l'audit
VITE_AUDIT_LEVEL=info              # Niveau de log (debug, info, warn, error)
VITE_AUDIT_ENDPOINT=https://...    # Serveur d'audit externe (optionnel)
```

Voir `env.example` pour la liste complète des variables.

## 🏗 Architecture

### Structure du projet

```text
src/
├── components/          # Composants React
│   ├── modules/        # Modules fonctionnels
│   ├── ui/             # Composants d'interface
│   ├── layout/         # Composants de mise en page
│   └── __tests__/      # Tests des composants
├── contexts/           # Contextes React (Auth, etc.)
├── hooks/              # Hooks personnalisés
├── services/           # Services métier (audit, API)
├── utils/              # Fonctions utilitaires
├── types/              # Définitions TypeScript
├── data/               # Données statiques/mock
└── test/               # Configuration des tests
```

### Modules principaux

1. **AuthContext** : Gestion centralisée de l'authentification
2. **AuditService** : Service de traçabilité des actions
3. **AIExtraction** : Extraction IA de documents
4. **Navigation** : Routage basé sur React Router
5. **Modules métier** : Visiteurs, Personnel, Badges, etc.

## 🧪 Tests

```bash
# Lancer les tests
bun test

# Tests en mode watch
bun test:watch

# Tests avec interface
bun test:ui

# Coverage
bun test:coverage
```

## 📝 Scripts disponibles

- `bun dev` : Serveur de développement
- `bun build` : Build de production
- `bun preview` : Aperçu du build
- `bun test` : Lancer les tests
- `bun lint` : Vérification ESLint

## 🔒 Sécurité

### Authentification

- Sessions sécurisées avec timeout configurable
- Rôles granulaires (ADMIN, RECEPTION)
- Protection des routes par rôle

### Audit et traçabilité

- Log complet des actions utilisateur
- Niveaux de risque automatiques
- Export sécurisé des logs
- Rétention configurable des données

### Protection des données

- Variables d'environnement pour les secrets
- Chiffrement optionnel des données sensibles
- Validation stricte des entrées

## 🚀 Déploiement

### Build de production

```bash
bun build
```

### Variables d'environnement de production

```env
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=prod-api-key
VITE_AUDIT_ENABLED=true
VITE_AUDIT_ENDPOINT=https://audit.yourcompany.com
```

### Serveur web

Le dossier `dist/` peut être servi par n'importe quel serveur web statique (Nginx, Apache, Netlify, Vercel).

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Standards de code

- Utiliser TypeScript pour tout nouveau code
- Suivre les règles ESLint configurées
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les fonctions complexes avec JSDoc

## 📄 Licence

Développé par ORGANEUS Gabon - Tous droits réservés

## 🆘 Support

Pour toute question ou problème :

1. Vérifier les issues existantes
2. Consulter la documentation
3. Créer une nouvelle issue avec le template approprié

## 🔧 Développement

### Hooks de développement utiles

```typescript
// Hook d'audit
const { logEvent, logDataAccess } = useAudit();

// Hook d'authentification  
const { user, login, logout } = useAuth();
```

### Extension avec de nouveaux modules

1. Créer le composant dans `src/components/modules/`
2. Ajouter la route dans `Dashboard.tsx`
3. Implémenter l'audit pour les actions sensibles
4. Ajouter les tests correspondants

---

## 📅 Dernière mise à jour

Janvier 2025

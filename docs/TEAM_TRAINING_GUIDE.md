# Guide de Formation Équipe - DGI Access Application

## 🎯 Objectifs de la formation

Cette formation vise à familiariser l'équipe avec les nouvelles améliorations apportées à l'application DGI Access, incluant :
- React Router DOM pour la navigation
- Framework de tests (Vitest + React Testing Library)
- Intégration IA avec OpenAI
- Système d'audit complet
- Pipeline CI/CD automatisé

## 📚 Programme de formation

### Module 1: Navigation avec React Router (2h)

#### 🎯 Objectifs
- Comprendre les avantages de React Router vs navigation manuelle
- Maîtriser les concepts de routes protégées
- Implémenter de nouvelles routes

#### 📖 Concepts clés
```typescript
// Avant (navigation manuelle)
const [currentPage, setCurrentPage] = useState('home');
history.replaceState({}, '', '/admin');

// Après (React Router)
<Route path="/admin/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
const navigate = useNavigate();
navigate('/admin/visitors');
```

#### 🛠 Exercices pratiques
1. **Exercice 1** : Ajouter une nouvelle route `/admin/reports`
2. **Exercice 2** : Créer une route protégée pour les managers
3. **Exercice 3** : Implémenter une redirection après timeout de session

#### ✅ Points de contrôle
- [ ] Comprend les hooks `useNavigate`, `useLocation`
- [ ] Peut créer des routes protégées
- [ ] Maîtrise la gestion de l'état lors de la navigation

---

### Module 2: Tests Automatisés (3h)

#### 🎯 Objectifs
- Écrire des tests unitaires efficaces
- Tester les composants React avec RTL
- Comprendre les mocks et les fixtures

#### 📖 Concepts clés
```typescript
// Test d'un composant
import { render, screen, fireEvent } from '@testing-library/react';

test('doit afficher le nom d\'utilisateur', () => {
  render(<UserProfile user={{ name: 'Jean' }} />);
  expect(screen.getByText('Jean')).toBeInTheDocument();
});

// Mock d'un service
vi.mock('../services/auditService', () => ({
  auditService: {
    logEvent: vi.fn(),
  },
}));
```

#### 🛠 Exercices pratiques
1. **Exercice 1** : Tester le composant `VisitorForm`
2. **Exercice 2** : Mocker l'API d'extraction IA
3. **Exercice 3** : Test d'intégration d'un workflow complet

#### ✅ Points de contrôle
- [ ] Écrit des tests unitaires lisibles
- [ ] Utilise les mocks appropriés
- [ ] Comprend les assertions RTL

---

### Module 3: Intégration IA et OpenAI (2h)

#### 🎯 Objectifs
- Comprendre l'architecture du module IA
- Configurer différents providers d'IA
- Gérer les erreurs et les timeouts

#### 📖 Concepts clés
```typescript
// Configuration multi-provider
const config = {
  provider: 'openai' | 'mock' | 'anthropic',
  apiKey: process.env.VITE_AI_API_KEY,
  retries: 3,
  timeout: 30000,
};

// Gestion d'erreurs robuste
try {
  const result = await callAIAPI(image, 'CNI');
  if (!result.success) {
    // Fallback vers mode mock
  }
} catch (error) {
  // Retry avec backoff exponentiel
}
```

#### 🛠 Exercices pratiques
1. **Exercice 1** : Configurer un nouveau provider d'IA
2. **Exercice 2** : Implémenter un fallback personnalisé
3. **Exercice 3** : Ajouter la validation de nouveaux types de documents

#### ✅ Points de contrôle
- [ ] Configure les variables d'environnement IA
- [ ] Comprend le flow d'extraction
- [ ] Gère les cas d'erreur

---

### Module 4: Système d'Audit (2.5h)

#### 🎯 Objectifs
- Comprendre l'importance de l'audit en sécurité
- Utiliser le service d'audit dans l'application
- Configurer le serveur d'audit

#### 📖 Concepts clés
```typescript
// Logging d'événements
import { useAudit } from '../services/auditService';

const { logEvent, logDataAccess } = useAudit();

await logEvent({
  userId: user.id,
  action: 'CREATE_VISITOR',
  resource: 'Visitor Database',
  riskLevel: 'medium',
});

// Serveur d'audit
POST /api/logs
{
  "events": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "LOGIN",
      "status": "success"
    }
  ]
}
```

#### 🛠 Exercices pratiques
1. **Exercice 1** : Ajouter l'audit à un nouveau module
2. **Exercice 2** : Configurer les niveaux de risque
3. **Exercice 3** : Analyser les logs d'audit

#### ✅ Points de contrôle
- [ ] Utilise le hook `useAudit`
- [ ] Comprend les niveaux de risque
- [ ] Configure le serveur d'audit

---

### Module 5: CI/CD et Déploiement (2h)

#### 🎯 Objectifs
- Comprendre le pipeline de déploiement
- Utiliser les scripts de test et build
- Gérer les secrets et variables d'environnement

#### 📖 Concepts clés
```yaml
# Pipeline CI/CD
jobs:
  test:
    - run: bun run test:run
    - run: bun run test:openai
  
  build:
    - run: bun run build
    - env: production variables
  
  deploy:
    - if: github.ref == 'refs/heads/main'
    - run: deploy to production
```

#### 🛠 Exercices pratiques
1. **Exercice 1** : Déclencher un déploiement staging
2. **Exercice 2** : Configurer une nouvelle variable d'environnement
3. **Exercice 3** : Analyser les logs de déploiement

#### ✅ Points de contrôle
- [ ] Comprend le workflow GitHub Actions
- [ ] Utilise les scripts de build/test
- [ ] Gère les secrets en production

---

## 🎮 Ateliers pratiques (4h)

### Atelier 1: Nouveau Module Complet (2h)

**Objectif** : Créer un module "Rapports" de A à Z

**Étapes** :
1. Créer le composant `ReportsModule.tsx`
2. Ajouter la route dans le Dashboard
3. Implémenter l'audit des actions
4. Écrire les tests unitaires
5. Tester l'intégration avec l'IA (génération de rapports)

**Code de départ** :
```typescript
// src/components/modules/ReportsModule.tsx
import React from 'react';
import { useAudit } from '../../services/auditService';
import { useAuth } from '../../contexts/AuthContext';

export const ReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { logDataAccess } = useAudit();

  // TODO: Implémenter la logique du module
  
  return (
    <div className="space-y-6">
      <h1>Module Rapports</h1>
      {/* TODO: Interface utilisateur */}
    </div>
  );
};
```

### Atelier 2: Migration d'un composant existant (2h)

**Objectif** : Migrer un composant existant vers les nouveaux patterns

**Étapes** :
1. Identifier un composant existant
2. Ajouter les tests manquants
3. Intégrer le système d'audit
4. Migrer vers React Router si applicable
5. Optimiser les performances

---

## 📋 Check-lists par rôle

### 🧑‍💻 Développeur Frontend

**Avant de commencer :**
- [ ] Bun est installé et configuré
- [ ] Extension VS Code pour Vitest
- [ ] Accès au repository et aux secrets

**Après formation :**
- [ ] Peut créer des routes protégées
- [ ] Écrit des tests pour ses composants
- [ ] Utilise le système d'audit
- [ ] Configure les variables d'environnement
- [ ] Comprend le workflow de déploiement

### 🗄️ Développeur Backend

**Avant de commencer :**
- [ ] Docker installé
- [ ] Accès aux serveurs d'audit
- [ ] Compréhension des APIs REST

**Après formation :**
- [ ] Déploie le serveur d'audit
- [ ] Configure les endpoints d'API
- [ ] Surveille les logs d'audit
- [ ] Gère les bases de données d'audit

### 🚀 DevOps

**Avant de commencer :**
- [ ] Accès aux secrets GitHub
- [ ] Permissions sur les environnements
- [ ] Accès aux plateformes de déploiement

**Après formation :**
- [ ] Configure les pipelines CI/CD
- [ ] Gère les déploiements multi-environnements
- [ ] Surveille les métriques de build
- [ ] Configure les alertes de production

---

## 🔧 Configuration de l'environnement de développement

### Installation des outils

```bash
# 1. Installer Bun
curl -fsSL https://bun.sh/install | bash

# 2. Cloner le projet
git clone <repository-url>
cd IMPOTS_ACCESS

# 3. Installer les dépendances
bun install

# 4. Configurer l'environnement
bun run setup:env

# 5. Lancer les tests
bun run test

# 6. Démarrer le développement
bun run dev
```

### Extensions VS Code recommandées

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "vitest.explorer",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Configuration Git Hooks

```bash
# Installation des hooks pre-commit
echo "#!/bin/sh\nbun run lint && bun run test:run" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 📊 Évaluation des connaissances

### Quiz Module 1: Navigation
1. Quel hook permet de naviguer programmatiquement ?
2. Comment protéger une route selon le rôle utilisateur ?
3. Quelle est la différence entre `navigate` et `replace` ?

### Quiz Module 2: Tests
1. Comment mocker un service externe ?
2. Quelle assertion vérifier qu'un élément est visible ?
3. Comment tester un événement utilisateur ?

### Quiz Module 3: IA
1. Quels sont les providers d'IA supportés ?
2. Comment gérer un timeout d'API ?
3. Que faire en cas d'échec d'extraction ?

### Quiz Module 4: Audit
1. Quels événements doivent être audités ?
2. Comment définir le niveau de risque ?
3. Où sont stockés les logs d'audit ?

### Quiz Module 5: CI/CD
1. Quand le déploiement en production se déclenche-t-il ?
2. Comment ajouter une nouvelle variable d'environnement ?
3. Que faire en cas d'échec de build ?

---

## 🎯 Projet final

### Objectif
Implémenter une nouvelle fonctionnalité complète en appliquant tous les concepts appris.

### Fonctionnalité : Module de Notifications

**Exigences** :
1. **Interface** : Liste des notifications avec filtres
2. **Navigation** : Routes protégées `/admin/notifications`
3. **IA** : Classification automatique des notifications
4. **Audit** : Traçage des consultations et actions
5. **Tests** : Couverture ≥ 80%
6. **CI/CD** : Déploiement automatique

**Livrables** :
- [ ] Code source complet
- [ ] Tests unitaires et d'intégration
- [ ] Documentation technique
- [ ] Démonstration fonctionnelle

### Critères d'évaluation
- **Code** (30%) : Qualité, lisibilité, patterns
- **Tests** (25%) : Couverture, pertinence
- **Sécurité** (20%) : Audit, permissions
- **UX** (15%) : Interface, navigation
- **Documentation** (10%) : Clarté, complétude

---

## 📞 Support et ressources

### Documentation
- [Guide du développeur](./DEVELOPER_GUIDE.md)
- [Documentation technique](./TECHNICAL_DOCUMENTATION.md)
- [README principal](../README.md)

### Contacts
- **Lead Dev** : Pour questions techniques
- **DevOps** : Pour problèmes de déploiement
- **Product Owner** : Pour questions fonctionnelles

### Ressources externes
- [React Router Documentation](https://reactrouter.com/)
- [Vitest Documentation](https://vitest.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

*Formation créée par l'équipe technique ORGANEUS Gabon*
*Dernière mise à jour : Janvier 2025*

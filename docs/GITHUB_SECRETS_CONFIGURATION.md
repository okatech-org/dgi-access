# Configuration des Secrets GitHub

Ce document décrit comment configurer les secrets GitHub nécessaires pour que les workflows CI/CD fonctionnent correctement.

## 🔐 Secrets requis

### Pour le workflow principal (ci.yml)

#### Tests d'intégration IA

- `OPENAI_API_KEY` : Clé API OpenAI pour les tests d'intégration
  - **Format** : `sk-...` (clé API OpenAI)
  - **Utilisation** : Tests automatisés de l'extraction IA
  - **Obligatoire** : Non (les tests continuent si absent)

#### Déploiement Netlify

- `NETLIFY_AUTH_TOKEN` : Token d'authentification Netlify
  - **Format** : Token personnel Netlify
  - **Utilisation** : Déploiement automatique vers Netlify
  - **Obligatoire** : Oui (pour le déploiement)

- `NETLIFY_STAGING_SITE_ID` : ID du site Netlify pour staging
  - **Format** : UUID du site (ex: `abc123def-456-789`)
  - **Utilisation** : Déploiement des branches develop
  - **Obligatoire** : Oui (pour staging)

- `NETLIFY_PRODUCTION_SITE_ID` : ID du site Netlify pour production
  - **Format** : UUID du site (ex: `xyz789abc-123-456`)
  - **Utilisation** : Déploiement de la branche main
  - **Obligatoire** : Oui (pour production)

#### Notifications

- `SLACK_WEBHOOK_URL` : URL du webhook Slack pour notifications
  - **Format** : `https://hooks.slack.com/services/...`
  - **Utilisation** : Notifications de déploiement et erreurs
  - **Obligatoire** : Non (notifications désactivées si absent)

### Pour le workflow du serveur d'audit (audit-server.yml)

- `SLACK_WEBHOOK_URL` : (même que ci-dessus)
  - **Utilisation** : Notifications de déploiement du serveur d'audit

## 📝 Comment configurer les secrets

### 1. Accéder aux paramètres du repository

1. Aller sur votre repository GitHub
2. Cliquer sur l'onglet **Settings**
3. Dans le menu de gauche, cliquer sur **Secrets and variables** > **Actions**

### 2. Ajouter chaque secret

1. Cliquer sur **New repository secret**
2. Entrer le nom exact du secret (sensible à la casse)
3. Coller la valeur correspondante
4. Cliquer sur **Add secret**

### 3. Obtenir les valeurs des secrets

#### OpenAI API Key

1. Aller sur [platform.openai.com](https://platform.openai.com)
2. Créer un compte ou se connecter
3. Aller dans **API Keys**
4. Créer une nouvelle clé API
5. Copier la clé (format : `sk-...`)

#### Netlify Configuration

1. Aller sur [netlify.com](https://netlify.com)
2. Créer un compte ou se connecter
3. **Pour le token** :
   - Aller dans **User settings** > **Applications**
   - Créer un **Personal access token**
   - Copier le token généré
4. **Pour les Site IDs** :
   - Créer deux sites (staging et production)
   - Copier l'ID de chaque site depuis les paramètres du site

#### Slack Webhook

1. Aller sur votre workspace Slack
2. Créer une nouvelle app Slack ou utiliser une existante
3. Activer les **Incoming Webhooks**
4. Créer un nouveau webhook pour le canal désiré
5. Copier l'URL du webhook

## 🚨 Sécurité des secrets

### Bonnes pratiques

- ✅ **Ne jamais** commiter les secrets dans le code
- ✅ Utiliser des tokens avec permissions minimales
- ✅ Régénérer les tokens périodiquement
- ✅ Supprimer les tokens non utilisés

### Permissions minimales requises

#### Netlify Token

- Deploy hooks
- Site settings (lecture)
- Build logs (lecture)

#### Slack Webhook Permissions

- Permissions d'écriture sur le canal choisi uniquement

## 🔄 Test des secrets configurés

### Vérifier OpenAI

```bash
# Tester localement avec la clé
export VITE_AI_API_KEY="sk-..."
bun run test:openai
```

### Vérifier Netlify

1. Push une branche `develop` pour tester le staging
2. Push sur `main` pour tester la production
3. Vérifier les déploiements dans l'interface Netlify

### Vérifier Slack

1. Déclencher un déploiement
2. Vérifier la réception des notifications dans Slack

## 📋 Checklist de configuration

- [ ] `OPENAI_API_KEY` configuré (optionnel)
- [ ] `NETLIFY_AUTH_TOKEN` configuré
- [ ] `NETLIFY_STAGING_SITE_ID` configuré
- [ ] `NETLIFY_PRODUCTION_SITE_ID` configuré
- [ ] `SLACK_WEBHOOK_URL` configuré (optionnel)
- [ ] Tests de déploiement staging réussis
- [ ] Tests de déploiement production réussis
- [ ] Notifications Slack fonctionnelles

## 🐛 Dépannage

### Erreur "Secret not found"

- Vérifier l'orthographe exacte du nom du secret
- Vérifier que le secret est configuré au niveau du repository (pas organisation)

### Erreur de déploiement Netlify

- Vérifier que le token Netlify est valide
- Vérifier que les Site IDs correspondent aux bons sites
- Vérifier les permissions du token

### Notifications Slack non reçues

- Vérifier que l'URL du webhook est correcte
- Vérifier que l'app Slack a les permissions nécessaires
- Vérifier les logs des workflows GitHub

## 📞 Support

Pour toute question sur la configuration des secrets :

1. Vérifier les logs des workflows GitHub Actions
2. Consulter la documentation des services tiers (Netlify, Slack, OpenAI)
3. Créer une issue avec les détails de l'erreur

---

## 📅 Documentation mise à jour

Janvier 2025

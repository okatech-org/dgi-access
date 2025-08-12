# 🔐 Configuration des Secrets GitHub - DGI Access

## Vue d'ensemble

Ce document explique comment configurer les secrets GitHub pour activer toutes les fonctionnalités du workflow CI/CD de DGI Access.

## État actuel

✅ **Le workflow fonctionne sans aucun secret configuré !**  
Les étapes optionnelles sont automatiquement ignorées grâce à `continue-on-error: true` et aux vérifications de configuration.

## Secrets Requis

### 🟢 Automatiques (Aucune action requise)

| Secret | Description | Status |
|--------|-------------|---------|
| `GITHUB_TOKEN` | Token d'authentification GitHub | ✅ Fourni automatiquement |

## Secrets Optionnels

### 🔵 OpenAI (Tests d'Intégration)

| Secret | Description | Impact si manquant |
|--------|-------------|-------------------|
| `OPENAI_API_KEY` | Clé API OpenAI | Tests d'intégration IA ignorés |

**Comment obtenir :**
1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Ajoutez-la dans GitHub : Settings > Secrets and variables > Actions

### 🟡 Netlify (Déploiements)

| Secret | Description | Impact si manquant |
|--------|-------------|-------------------|
| `NETLIFY_AUTH_TOKEN` | Token d'authentification Netlify | Déploiements ignorés |
| `NETLIFY_STAGING_SITE_ID` | ID du site staging | Déploiement staging ignoré |
| `NETLIFY_PRODUCTION_SITE_ID` | ID du site production | Déploiement production ignoré |

**Comment obtenir :**
1. **Token Netlify :**
   - Allez sur https://app.netlify.com/user/applications#personal-access-tokens
   - Cliquez sur "New access token"
   - Donnez un nom descriptif et générez le token

2. **Site IDs :**
   - Dans Netlify, allez sur votre site
   - Settings > General > Site details
   - Copiez le "Site ID"

### 🟣 Slack (Notifications)

| Secret | Description | Impact si manquant |
|--------|-------------|-------------------|
| `SLACK_WEBHOOK_URL` | URL webhook Slack | Notifications ignorées |

**Comment obtenir :**
1. Allez sur https://api.slack.com/apps
2. Créez une nouvelle app ou sélectionnez une app existante
3. Activez "Incoming Webhooks"
4. Créez un nouveau webhook pour votre canal
5. Copiez l'URL du webhook

## Instructions de Configuration

### 1. Accéder aux paramètres des secrets

```
https://github.com/VOTRE_USERNAME/dgi-access/settings/secrets/actions
```

### 2. Ajouter un secret

1. Cliquez sur "New repository secret"
2. Entrez le nom du secret (exactement comme dans le tableau)
3. Collez la valeur
4. Cliquez sur "Add secret"

### 3. Vérifier la configuration

Utilisez le script d'aide :
```bash
bun run setup:secrets
```

Ou vérifiez les logs du workflow dans l'onglet "Actions" de GitHub.

## Workflow de Test

### Phase 1 : Test de base (sans secrets)
1. Poussez un commit sur `develop` ou `main`
2. Vérifiez que les jobs de base s'exécutent :
   - ✅ Configuration check
   - ✅ Tests unitaires  
   - ✅ Build
   - ✅ Tests de sécurité

### Phase 2 : Ajout progressif des secrets
1. Ajoutez `OPENAI_API_KEY` → testez les intégrations IA
2. Ajoutez les secrets Netlify → testez les déploiements
3. Ajoutez `SLACK_WEBHOOK_URL` → testez les notifications

## Statut dans les Logs

Le workflow affiche automatiquement le statut de chaque secret :

```
🔐 Résumé de la Configuration des Secrets:
----------------------------------------
✅ GITHUB_TOKEN: Fourni automatiquement

📝 Secrets optionnels:
✅ OPENAI_API_KEY: Configuré - tests OpenAI activés
⚠️ NETLIFY_AUTH_TOKEN: Non configuré - déploiements Netlify ignorés
⚠️ NETLIFY_STAGING_SITE_ID: Non configuré - déploiement staging ignoré
⚠️ NETLIFY_PRODUCTION_SITE_ID: Non configuré - déploiement production ignoré
⚠️ SLACK_WEBHOOK_URL: Non configuré - notifications Slack ignorées
```

## Sécurité

### ✅ Bonnes pratiques respectées :
- Les secrets ne sont jamais affichés dans les logs
- Utilisation de `continue-on-error: true` pour éviter les échecs
- Vérifications avant utilisation des secrets
- Conditions `if` pour éviter l'exécution inutile

### ⚠️ Recommandations :
- Utilisez des tokens avec permissions minimales
- Régénérez les tokens périodiquement
- Surveillez l'utilisation dans les logs d'audit

## Support

### Commandes utiles :
```bash
# Aide à la configuration
bun run setup:secrets

# Test complet
bun run test:all

# Vérification finale
bun run check:final
```

### Résolution des problèmes :
1. Vérifiez que les noms des secrets sont exacts (sensible à la casse)
2. Consultez les logs du workflow pour des messages d'erreur spécifiques
3. Testez les tokens individuellement avant de les ajouter à GitHub

---

**💡 Conseil :** Commencez simple ! Le workflow fonctionne parfaitement sans secrets optionnels. Ajoutez-les progressivement selon vos besoins.

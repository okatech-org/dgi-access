#!/bin/bash

# Script de déploiement production DGI Access avec serveur API
# Usage: ./deploy-production.sh

set -e

echo "🚀 Déploiement DGI Access Application - Mode Production"
echo "========================================================"

# Configuration
PROJECT_NAME="dgi-access"
BUILD_DIR="dist"
API_PORT=${API_PORT:-3001}
DOMAIN=${DOMAIN:-"dgi-access.netlify.app"}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifications préliminaires
log_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

# Vérifier Netlify CLI
if ! command -v netlify &> /dev/null; then
    log_warning "Netlify CLI n'est pas installé. Installation..."
    npm install -g netlify-cli
fi

log_success "Prérequis vérifiés"

# Nettoyage
log_info "Nettoyage des builds précédents..."
rm -rf $BUILD_DIR
rm -rf audit-server/data
rm -rf audit-server/logs
log_success "Nettoyage terminé"

# Configuration pour la production
log_info "Configuration pour la production..."

# Créer le fichier .env.production
cat > .env.production << EOF
VITE_USE_API=false
VITE_API_URL=https://${DOMAIN}/api
VITE_API_KEY=production-dgi-key-change-me
VITE_APP_TITLE=DGI Access - Gabon
VITE_APP_VERSION=2.0.0
EOF

log_success "Configuration créée (.env.production)"

# Build de l'application cliente
log_info "Construction de l'application cliente..."
npm ci --production=false
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    log_error "Le build a échoué - dossier $BUILD_DIR introuvable"
    exit 1
fi

log_success "Application cliente construite"

# Préparation du serveur pour déploiement
log_info "Préparation du serveur API..."

# Copier les fichiers serveur dans le build
mkdir -p $BUILD_DIR/api
cp -r audit-server/*.js $BUILD_DIR/api/
cp audit-server/package.json $BUILD_DIR/api/

# Créer le netlify.toml pour les fonctions
cat > $BUILD_DIR/netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/dgi-server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
EOF

log_success "Configuration Netlify créée"

# Modifier le serveur pour Netlify Functions
log_info "Adaptation du serveur pour Netlify Functions..."

cat > $BUILD_DIR/api/netlify-dgi.js << 'EOF'
// Fonction Netlify pour DGI API
import { app } from './dgi-server.js';

export const handler = async (event, context) => {
  // Configuration pour Netlify
  process.env.DB_DIR = '/tmp';
  process.env.LOG_DIR = '/tmp/logs';
  
  return new Promise((resolve, reject) => {
    const callback = (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    };

    // Adapter l'event Netlify pour Express
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      status: (code) => { res.statusCode = code; return res; },
      json: (data) => { 
        res.headers['Content-Type'] = 'application/json';
        res.body = JSON.stringify(data);
        callback(null, res);
      },
      send: (data) => {
        res.body = typeof data === 'string' ? data : JSON.stringify(data);
        callback(null, res);
      }
    };

    // Simulation d'Express
    app(req, res);
  });
};
EOF

log_success "Serveur adapté pour Netlify"

# Installation des dépendances serveur
log_info "Installation des dépendances serveur..."
cd $BUILD_DIR/api
npm install --production
cd ../..

log_success "Dépendances serveur installées"

# Tests avant déploiement
log_info "Tests avant déploiement..."

# Vérifier que les fichiers essentiels existent
if [ ! -f "$BUILD_DIR/index.html" ]; then
    log_error "Fichier index.html manquant"
    exit 1
fi

if [ ! -f "$BUILD_DIR/api/package.json" ]; then
    log_error "Package.json serveur manquant"
    exit 1
fi

log_success "Tests réussis"

# Déploiement sur Netlify
log_info "Déploiement sur Netlify..."

# Login Netlify (si nécessaire)
if ! netlify status &> /dev/null; then
    log_warning "Connexion à Netlify requise"
    netlify login
fi

# Déploiement
netlify deploy --prod --dir=$BUILD_DIR --message="Déploiement DGI Access v2.0.0 avec API serveur"

if [ $? -eq 0 ]; then
    log_success "Déploiement réussi !"
    echo ""
    echo "🎉 Application déployée avec succès !"
    echo "🌐 URL: https://${DOMAIN}"
    echo "📊 API: https://${DOMAIN}/api"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifier le fonctionnement sur: https://${DOMAIN}"
    echo "   2. Tester les endpoints API: https://${DOMAIN}/api/dgi/personnel"
    echo "   3. Configurer le domaine personnalisé si nécessaire"
    echo "   4. Mettre à jour les variables d'environnement Netlify"
else
    log_error "Échec du déploiement"
    exit 1
fi

# Nettoyage post-déploiement
log_info "Nettoyage post-déploiement..."
rm -f .env.production

log_success "Script terminé !"

echo ""
echo "🔧 Configuration recommandée pour Netlify:"
echo "   Variables d'environnement à ajouter dans l'interface Netlify:"
echo "   - API_KEY: production-dgi-key-change-me"
echo "   - NODE_ENV: production"
echo ""
echo "📖 Documentation:"
echo "   - README.md pour les instructions d'utilisation"
echo "   - docs/ pour la documentation technique"
EOF

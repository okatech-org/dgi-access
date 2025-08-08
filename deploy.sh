#!/bin/bash

# Script de déploiement GitHub Pages pour IMPOTS ACCESS
set -e

echo "🚀 Déploiement de IMPOTS ACCESS vers GitHub Pages..."

# Configuration Git
git config user.name "IMPOTS Access Deployer"
git config user.email "deploy@impots-access.ga"

# Construire l'application
echo "📦 Construction de l'application..."
bun run build

# Initialiser le dépôt si nécessaire
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Ajouter tous les fichiers sources
echo "📝 Ajout des fichiers sources..."
git add .
git commit -m "✨ Application IMPOTS ACCESS - Système de Gestion Intégré

- Interface de gestion des visiteurs et badges
- Module de gestion des colis avec scanner IA
- Scanner de code-barres intégré (BarcodeDetector + Quagga)
- Système d'authentification et gestion des rôles
- Interface responsive avec Tailwind CSS
- Architecture React + TypeScript + Vite

Direction Générale des Impôts du Gabon" || true

# Créer et déployer vers gh-pages
echo "🌐 Déploiement vers GitHub Pages..."
git checkout -B gh-pages

# Supprimer tous les fichiers sauf dist et .git
find . -maxdepth 1 ! -name '.git' ! -name 'dist' ! -name '.' ! -name '..' -exec rm -rf {} \;

# Déplacer le contenu de dist vers la racine
mv dist/* .
mv dist/.* . 2>/dev/null || true
rmdir dist

# Créer le fichier CNAME pour le domaine personnalisé
echo "impots-access.ga" > CNAME

# Créer un fichier .nojekyll pour éviter les problèmes Jekyll
touch .nojekyll

# Créer un README pour GitHub Pages
cat > README.md << 'EOF'
# IMPOTS ACCESS - Système de Gestion Intégré

🏛️ **Direction Générale des Impôts du Gabon**

Application web moderne pour la gestion intégrée des services fiscaux et d'imposition.

## ✨ Fonctionnalités

- 👥 **Gestion des visiteurs** : Enregistrement et suivi des visiteurs
- 🎫 **Système de badges** : Génération et gestion des badges d'accès
- 📦 **Gestion des colis** : Suivi et traçabilité des courriers
- 📱 **Scanner IA** : Détection automatique des codes-barres
- 🔐 **Authentification** : Système de connexion sécurisé
- 📊 **Tableaux de bord** : Statistiques et métriques en temps réel

## 🚀 Technologies

- **Frontend** : React 18 + TypeScript
- **Build** : Vite 5
- **UI** : Tailwind CSS + Lucide Icons
- **Scanner** : BarcodeDetector API + Quagga.js

## 🌐 Accès

L'application est déployée et accessible à l'adresse :
**https://impots-access.ga**

---
*Développé pour la modernisation des services publics gabonais*
EOF

# Ajouter et commiter les fichiers de production
git add .
git commit -m "🚀 Deploy IMPOTS ACCESS to GitHub Pages

Production build with:
- Optimized React bundle (889KB gzipped: 179KB)
- Quagga scanner library (91KB gzipped: 31KB)
- Tailwind CSS styles (85KB gzipped: 13KB)
- Static assets and images

Ready for production deployment at impots-access.ga"

echo "✅ Déploiement terminé !"
echo "📋 Étapes suivantes :"
echo "   1. Créer un dépôt GitHub : impots-access-gabon"
echo "   2. Ajouter l'origine : git remote add origin https://github.com/USERNAME/impots-access-gabon.git"
echo "   3. Pousser : git push -u origin gh-pages"
echo "   4. Activer GitHub Pages dans les paramètres du dépôt"
echo "   5. Configurer le domaine personnalisé : impots-access.ga"

echo ""
echo "🌐 L'application sera accessible sur :"
echo "   - GitHub Pages : https://USERNAME.github.io/impots-access-gabon"
echo "   - Domaine personnalisé : https://impots-access.ga"
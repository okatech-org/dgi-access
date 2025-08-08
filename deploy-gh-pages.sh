#!/bin/bash

# Script de déploiement GitHub Pages (version simplifiée)
set -e

echo "🚀 Préparation du déploiement GitHub Pages..."

# Configuration Git
git config user.name "IMPOTS Access Deployer"
git config user.email "deploy@impots-access.ga"

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist n'existe pas. Lancez 'bun run build' d'abord."
    exit 1
fi

# Ajouter tous les fichiers sources à main
echo "📝 Commit des fichiers sources sur la branche main..."
git add .
git commit -m "✨ IMPOTS ACCESS - Système de Gestion Intégré

Source code avec :
- Interface React + TypeScript
- Scanner de code-barres intégré
- Gestion visiteurs, badges et colis
- Direction Générale des Impôts du Gabon" || echo "Pas de changements à commiter"

# Créer et déployer vers gh-pages
echo "🌐 Préparation de la branche gh-pages..."
git checkout -B gh-pages

# Supprimer tous les fichiers sauf dist et .git
find . -maxdepth 1 ! -name '.git' ! -name 'dist' ! -name '.' ! -name '..' -exec rm -rf {} \;

# Déplacer le contenu de dist vers la racine
cp -r dist/* .
rm -rf dist

# Créer le fichier CNAME pour le domaine personnalisé
echo "impots-access.ga" > CNAME

# Créer un fichier .nojekyll
touch .nojekyll

# Créer un README pour GitHub Pages
cat > README.md << 'EOF'
# IMPOTS ACCESS - Déploiement Production

🏛️ **Direction Générale des Impôts du Gabon**

Application déployée sur GitHub Pages.

## 🌐 Accès
- Production : https://impots-access.ga
- GitHub Pages : https://username.github.io/impots-access-gabon

## ✨ Fonctionnalités
- Gestion des visiteurs et badges
- Scanner de code-barres IA
- Gestion des colis et courriers
- Tableaux de bord en temps réel

*Build optimisé pour la production*
EOF

# Ajouter et commiter les fichiers de production
git add .
git commit -m "🚀 Deploy IMPOTS ACCESS Production

Optimized build ready for GitHub Pages deployment"

echo "✅ Branche gh-pages préparée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Créer un dépôt GitHub public : impots-access-gabon"
echo "   2. git remote add origin https://github.com/USERNAME/impots-access-gabon.git"
echo "   3. git push origin main"
echo "   4. git push origin gh-pages"
echo "   5. Activer GitHub Pages (Settings → Pages → Source: gh-pages)"
echo ""
echo "🌐 URL d'accès : https://USERNAME.github.io/impots-access-gabon"